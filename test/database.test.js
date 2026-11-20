import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
// Real PostgreSQL engine, with the two roles and auth.uid() normally supplied by Supabase.
test("tracker migration: round-trip, ownership, conflicts, constraints and deletion", async () => {
  const pg = new PGlite();
  const a = "00000000-0000-4000-8000-000000000001",
    b = "00000000-0000-4000-8000-000000000002";
  try {
    await pg.exec(
      `create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated;insert into auth.users values('${a}'),('${b}');`,
    );
    await pg.exec(
      await readFile(
        new URL(
          "../supabase/migrations/20261120000100_tracker.sql",
          import.meta.url,
        ),
        "utf8",
      ),
    );
    const role = async (uid) => {
      await pg.exec("reset role;set role authenticated");
      await pg.query("select set_config('request.jwt.claim.sub',$1,false)", [
        uid,
      ]);
    };
    const load = async () =>
      (await pg.query("select public.flint_load_workspace() as result")).rows[0]
        .result;
    const save = async (uid, rev, w) =>
      (
        await pg.query(
          "select public.flint_save_workspace($1,$2,$3::jsonb) as revision",
          [uid, rev, JSON.stringify(w)],
        )
      ).rows[0].revision;
    const w = {
      records: [
        {
          id: "a1",
          name: "Run",
          cat: "Body",
          date: "2026-11-19",
          time: "06:30",
          min: 25,
        },
      ],
      habits: [
        {
          id: "h1",
          name: "Read",
          cat: "Mind",
          color: "#cba123",
          days: ["2026-11-20"],
        },
      ],
      lessons: [{ id: "m1", name: "React", done: false }],
      sample: false,
      goals: [10, 15, 20],
    };
    await role(a);
    assert.equal(await load(), null);
    assert.equal(await save(a, 0, w), 1);
    assert.deepEqual(await load(), { owner: a, revision: 1, workspace: w });
    await assert.rejects(save(a, 0, w), { code: "40001" });
    await assert.rejects(
      save(a, 1, { ...w, records: [{ ...w.records[0], min: 0 }] }),
      { code: "23514" },
    );
    assert.deepEqual((await load()).workspace, w);
    assert.equal((await load()).revision, 1);
    await role(b);
    assert.equal(await load(), null);
    await assert.rejects(save(a, 1, w), { code: "42501" });
    assert.equal(
      (await pg.query("select * from flint_private.activities")).rows.length,
      0,
    );
    await assert.rejects(
      pg.query(
        "insert into flint_private.habits(owner_id,id,name,pillar,color,position) values($1,'x','x','Mind','#123456',1)",
        [a],
      ),
      { code: "42501" },
    );
    assert.equal(await save(b, 0, w), 1);
    await role(a);
    assert.equal(
      await save(a, 1, { records: [], habits: [], lessons: [], sample: false }),
      2,
    );
    assert.deepEqual((await load()).workspace.goals, [35, 50, 45]);
    assert.deepEqual(
      (await pg.query("select * from flint_private.habit_checkins")).rows,
      [],
    );
    await role(b);
    assert.deepEqual((await load()).workspace, w);
    await pg.exec("reset role;set role anon");
    await assert.rejects(load(), { code: "42501" });
    await assert.rejects(save(a, 2, w), { code: "42501" });
  } finally {
    await pg.close();
  }
});
