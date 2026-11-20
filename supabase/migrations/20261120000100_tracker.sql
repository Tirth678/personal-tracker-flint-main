-- FlinT System: one private life-tracking workspace per Supabase Auth account.
-- Keep flint_private OUT of the Data API's list of exposed schemas.
begin;
create schema flint_private;
revoke all on schema flint_private from public, anon;
grant usage on schema flint_private to authenticated;
create type flint_private.pillar as enum ('Soul', 'Mind', 'Body');
create table flint_private.workspaces (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  revision bigint not null default 0 check (revision >= 0),
  sample boolean not null default false,
  updated_at timestamptz not null default now()
);
create table flint_private.pillar_goals (
  owner_id uuid not null references flint_private.workspaces on delete cascade,
  pillar flint_private.pillar not null,
  daily_minutes integer not null check (daily_minutes between 1 and 1440),
  primary key (owner_id, pillar)
);
-- Text IDs preserve existing JSON backup identities; new records use crypto.randomUUID().
create table flint_private.activities (
  owner_id uuid not null references flint_private.workspaces on delete cascade,
  id text not null check (length(id)>0),
  name text not null check (length(btrim(name))>0 and length(name)<=100),
  pillar flint_private.pillar not null,
  activity_date date not null, start_time time not null check (start_time < time '24:00'),
  minutes integer not null check (minutes between 1 and 1440),
  primary key (owner_id,id)
);
create index activities_by_pillar_date on flint_private.activities(owner_id,pillar,activity_date);
create table flint_private.habits (
  owner_id uuid not null references flint_private.workspaces on delete cascade,
  id text not null check (length(id)>0),
  name text not null check (length(btrim(name))>0 and length(name)<=100),
  pillar flint_private.pillar not null, color text not null check (color ~ '^#[a-fA-F0-9]{6}$'),
  position integer not null, primary key(owner_id,id)
);
create table flint_private.habit_checkins (
  owner_id uuid not null, habit_id text not null, completed_on date not null,
  primary key(owner_id,habit_id,completed_on),
  foreign key(owner_id,habit_id) references flint_private.habits(owner_id,id) on delete cascade
);
create table flint_private.milestones (
  owner_id uuid not null references flint_private.workspaces on delete cascade,
  id text not null check (length(id)>0),
  name text not null check (length(btrim(name))>0 and length(name)<=100),
  done boolean not null default false, position integer not null, primary key(owner_id,id)
);
do $$ declare t text; begin
  foreach t in array array['workspaces','pillar_goals','activities','habits','habit_checkins','milestones'] loop
    execute format('alter table flint_private.%I enable row level security',t);
    execute format('create policy own_rows on flint_private.%I for all to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()))',t);
    execute format('revoke all on flint_private.%I from public, anon, authenticated',t);
    execute format('grant select,insert,update,delete on flint_private.%I to authenticated',t);
  end loop;
end $$;

-- One database snapshot, without nested REST pagination or a client-supplied read filter.
create function public.flint_load_workspace() returns jsonb language sql stable security invoker
set search_path = '' as $$
  select jsonb_build_object('owner',w.owner_id,'revision',w.revision,'workspace',jsonb_build_object(
    'sample',w.sample,
    'goals',(select jsonb_agg(g.daily_minutes order by g.pillar) from flint_private.pillar_goals g where g.owner_id=w.owner_id),
    'records',coalesce((select jsonb_agg(jsonb_build_object('id',a.id,'name',a.name,'cat',a.pillar,'date',a.activity_date,'time',to_char(a.start_time,'HH24:MI'),'min',a.minutes) order by a.activity_date desc,a.start_time desc,a.id) from flint_private.activities a where a.owner_id=w.owner_id),'[]'),
    'habits',coalesce((select jsonb_agg(jsonb_build_object('id',h.id,'name',h.name,'cat',h.pillar,'color',h.color,'days',coalesce((select jsonb_agg(c.completed_on order by c.completed_on) from flint_private.habit_checkins c where c.owner_id=h.owner_id and c.habit_id=h.id),'[]')) order by h.position) from flint_private.habits h where h.owner_id=w.owner_id),'[]'),
    'lessons',coalesce((select jsonb_agg(jsonb_build_object('id',m.id,'name',m.name,'done',m.done) order by m.position) from flint_private.milestones m where m.owner_id=w.owner_id),'[]')
  )) from flint_private.workspaces w where w.owner_id=(select auth.uid());
$$;

-- Atomic compare-and-swap. An out-of-date device cannot overwrite newer edits.
create function public.flint_save_workspace(expected_owner uuid, expected_revision bigint, workspace jsonb)
returns bigint language plpgsql security invoker set search_path = '' as $$
declare uid uuid := auth.uid(); next_revision bigint; goals jsonb;
begin
  if uid is null or expected_owner is distinct from uid then raise exception 'Account changed' using errcode='42501'; end if;
  goals := coalesce(workspace->'goals','[35,50,45]'::jsonb);
  if jsonb_typeof(workspace->'records') is distinct from 'array' or jsonb_typeof(workspace->'habits') is distinct from 'array' or jsonb_typeof(workspace->'lessons') is distinct from 'array' or jsonb_typeof(goals) is distinct from 'array' or jsonb_array_length(goals)<>3 then raise exception 'Invalid workspace payload' using errcode='22023'; end if;
  insert into flint_private.workspaces(owner_id) values(uid) on conflict do nothing;
  update flint_private.workspaces set revision=revision+1,sample=coalesce((workspace->>'sample')::boolean,false),updated_at=now()
    where owner_id=uid and revision=expected_revision returning revision into next_revision;
  if not found then raise exception 'Workspace has changed on another device' using errcode='40001'; end if;
  delete from flint_private.activities where owner_id=uid;
  delete from flint_private.habits where owner_id=uid; -- also removes their check-ins
  delete from flint_private.milestones where owner_id=uid;
  delete from flint_private.pillar_goals where owner_id=uid;
  insert into flint_private.pillar_goals(owner_id,pillar,daily_minutes)
    select uid,(enum_range(null::flint_private.pillar))[ordinality],value::integer from jsonb_array_elements_text(goals) with ordinality;
  insert into flint_private.activities(owner_id,id,name,pillar,activity_date,start_time,minutes)
    select uid,id,name,cat,date,time,min from jsonb_to_recordset(workspace->'records') as a(id text,name text,cat flint_private.pillar,date date,time time,min integer);
  insert into flint_private.habits(owner_id,id,name,pillar,color,position)
    select uid,v->>'id',v->>'name',(v->>'cat')::flint_private.pillar,v->>'color',pos from jsonb_array_elements(workspace->'habits') with ordinality h(v,pos);
  insert into flint_private.habit_checkins(owner_id,habit_id,completed_on)
    select distinct uid,h->>'id',d::date from jsonb_array_elements(workspace->'habits') h cross join lateral jsonb_array_elements_text(h->'days') d;
  insert into flint_private.milestones(owner_id,id,name,done,position)
    select uid,v->>'id',v->>'name',(v->>'done')::boolean,pos from jsonb_array_elements(workspace->'lessons') with ordinality m(v,pos);
  return next_revision;
end $$;
revoke all on function public.flint_load_workspace(),public.flint_save_workspace(uuid,bigint,jsonb) from public,anon;
grant execute on function public.flint_load_workspace(),public.flint_save_workspace(uuid,bigint,jsonb) to authenticated;
commit;
