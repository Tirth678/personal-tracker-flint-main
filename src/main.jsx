import { WorkspaceGate, AccountSettings } from "./components/cloud-workspace";
import { saveWorkspace } from "./lib/cloud";
import { createWorkspaceStore } from "./lib/workspace-store";
import React, {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createRoot } from "react-dom/client";
import {
  LayoutDashboard,
  ChartNoAxesCombined,
  ListChecks,
  BriefcaseBusiness,
  Timer,
  Wallet,
  CalendarDays,
  Plus,
  ArrowUpRight,
  ArrowRight,
  Settings2,
  Flower2,
  Brain,
  Activity,
  Check,
  BookOpen,
  Footprints,
  NotebookPen,
  X,
  SlidersHorizontal,
  History,
  Download,
  Upload,
  Link2,
  Pencil,
  Trash2,
  CalendarPlus,
  Target,
} from "lucide-react";
import GlassyDashboard from "@/components/ui/glassy-dashboard";
import { saveCsv } from "@/components/ui/glassy-sample";
import { cats, colors, apps, day, today, chartData, read, valid } from "./data";
import "./globals.css";
import { PillarSignals } from "@/components/pillar-signals";
import { LiveStats } from "@/components/live-stats";
import "./style.css";
import "./glass.css";
import "./workspace.css";
const pages = [
  "Overview",
  "Progress",
  "Habit Tracker",
  "Career Hub",
  ...Object.keys(apps),
  "Settings",
];
const navicons = [
  LayoutDashboard,
  ChartNoAxesCombined,
  ListChecks,
  BriefcaseBusiness,
  Timer,
  Wallet,
  Settings2,
];
const slug = (p) => p.toLowerCase().replaceAll(" ", "-");
const descriptions = {
  Overview: "A daily perspective on your mind, body, and soul.",
  Progress: "Explore how your time adds up across the three pillars.",
  "Habit Tracker": "Build consistency, one check-in at a time.",
  "Career Hub": "Your personal learning path with 100xDevs.",
  "Time Tracker": "Your connected time-tracking workspace.",
  "Money Tracker": "Your connected personal finance workspace.",
  Settings: "Manage your goals, backups, and workspace data.",
};
const trackerViews = pages.map((p, i) => ({
  id: slug(p),
  label: p,
  short: [
    "Overview",
    "Progress",
    "Habits",
    "Career",
    "Time",
    "Money",
    "Settings",
  ][i],
  icon: navicons[i],
  description: descriptions[p],
}));
const icons = [Flower2, Brain, Activity];
const getPage = () =>
  pages.find(
    (p) => p.toLowerCase().replaceAll(" ", "-") === location.hash.slice(1),
  ) || "Overview";
const go = (p) => (location.hash = p.toLowerCase().replaceAll(" ", "-"));
const fmt = (d, opt) => new Date(d + "T12:00").toLocaleDateString("en-US", opt);
const sum = (arr) => arr.reduce((n, r) => n + r.min, 0);
const dur = (n) => (n >= 60 ? `${Math.floor(n / 60)}h ${n % 60}m` : `${n}m`);
const ico = (I, size = 17) => <I size={size} strokeWidth={1.65} />;
function path(pts) {
  return pts.reduce(
    (s, [x, y], i) =>
      i
        ? `${s} C${(x + pts[i - 1][0]) / 2},${pts[i - 1][1]} ${(x + pts[i - 1][0]) / 2},${y} ${x},${y}`
        : `M${x},${y}`,
    "",
  );
}
function Chart({ records, period, setPeriod, details = false }) {
  const [anchor, setAnchor] = useState(today);
  let { labels, vals, n } = chartData(
    records,
    period,
    details ? anchor : today,
    details,
  );
  let max = Math.max(60, Math.ceil(Math.max(...vals.flat()) / 30) * 30);
  return (
    <section className="panel chartPanel">
      <div className="between">
        <h3>
          <ChartNoAxesCombined /> Activity trends
        </h3>
        <select
          aria-label="Chart period"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          {["Weekly", "Monthly", "Hourly"].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </div>
      {details && (
        <label className="periodDate">
          {period === "Monthly"
            ? "Month containing"
            : period === "Weekly"
              ? "Week containing"
              : "Activity date"}{" "}
          <input
            type="date"
            value={anchor}
            onChange={(e) => {
              if (e.target.value) setAnchor(e.target.value);
            }}
          />
        </label>
      )}
      <div className="legend">
        {cats.map((c, i) => (
          <span key={c}>
            <i style={{ background: colors[i] }} />
            {c}
          </span>
        ))}
        <small>MINUTES</small>
      </div>
      <div className="plot">
        <div className="ticks">
          {[1, 0.75, 0.5, 0.25, 0].map((x) => (
            <span key={x}>{Math.round(x * max)}</span>
          ))}
        </div>
        <svg
          viewBox="0 0 600 130"
          preserveAspectRatio="none"
          role="img"
          aria-label={`${period} activity minutes by pillar`}
        >
          <defs>
            {colors.map((c, i) => (
              <linearGradient key={c} id={"shade" + i} x2="0" y2="1">
                <stop stopColor={c} stopOpacity=".14" />
                <stop offset="1" stopColor={c} stopOpacity="0" />
              </linearGradient>
            ))}
          </defs>
          {[2, 33, 64, 95, 126].map((y) => (
            <line
              key={y}
              x1="0"
              x2="600"
              y1={y}
              y2={y}
              stroke="#373a39"
              strokeDasharray="3 5"
            />
          ))}
          {vals.map((v, i) => {
            let points = v.map((x, j) => [
              3 + (j * 594) / (n - 1),
              126 - (124 * x) / max,
            ]);
            let p = path(points);
            return (
              <g key={i}>
                <path d={p + " V126 H3Z"} fill={`url(#shade${i})`} />
                <path d={p} stroke={colors[i]} strokeWidth="2.3" fill="none" />
                {points.map(([x, y], j) => (
                  <circle key={j} cx={x} cy={y} r="2.6" fill={colors[i]}>
                    <title>
                      {cats[i]} · {labels[j]}: {v[j]} minutes
                    </title>
                  </circle>
                ))}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="axis">
        {labels.map((x) => (
          <span key={x}>{x}</span>
        ))}
      </div>
    </section>
  );
}
function App({ user, loaded }) {
  const [store] = useState(() =>
    createWorkspaceStore(
      loaded?.workspace ?? read(),
      loaded?.revision ?? 0,
      user
        ? (db, rev) => saveWorkspace(user.id, rev, db)
        : async (db, rev) => {
            localStorage.setItem("flint.v1", JSON.stringify(db));
            return rev + 1;
          },
    ),
  );
  const { db, status } = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
  );
  const S = store.update;
  const [page, P] = useState(getPage),
    [modal, M] = useState(""),
    [editing, E] = useState(null),
    [query, setQuery] = useState(""),
    [period, G] = useState("Weekly"),
    [span, V] = useState("Last 7 days"),
    [filter, F] = useState("All pillars"),
    [all, A] = useState(false),
    [picked, C] = useState(colors[0]),
    [msg, U] = useState("");
  const dia = useRef(null),
    imp = useRef(null);
  useEffect(() => () => store.dispose(), [store]);
  useEffect(() => {
    if (status === "saved") return;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    addEventListener("beforeunload", warn);
    return () => removeEventListener("beforeunload", warn);
  }, [status]);
  useEffect(() => {
    if (!user) S((d) => ({ ...d }));
  }, [user, S]);
  useEffect(() => {
    let fn = () => {
      P(getPage());

      window.scrollTo(0, 0);
    };
    addEventListener("hashchange", fn);
    return () => removeEventListener("hashchange", fn);
  }, []);
  useEffect(() => {
    if (modal) dia.current?.showModal();
    else dia.current?.close();
  }, [modal]);
  useEffect(() => {
    if (msg) {
      let t = setTimeout(() => U(""), 4000);
      return () => clearTimeout(t);
    }
  }, [msg]);
  const toggle = (id) =>
    S((d) => ({
      ...d,
      habits: d.habits.map((h) =>
        h.id !== id
          ? h
          : {
              ...h,
              days: h.days.includes(today)
                ? h.days.filter((x) => x !== today)
                : [...h.days, today],
            },
      ),
    }));
  let complete = db.habits.filter((h) => h.days.includes(today)).length;
  const nav = (p) => {
    go(p);
  };
  function add(e) {
    e.preventDefault();
    let f = Object.fromEntries(new FormData(e.target)),
      name = f.name.trim();
    if (!name) {
      e.target.elements.name.setCustomValidity("Enter a name.");
      e.target.elements.name.reportValidity();
      return;
    }
    let id = crypto.randomUUID();
    if (modal === "Edit activity")
      S((d) => ({
        ...d,
        records: d.records.map((r) =>
          r.id === editing.id
            ? { ...f, name, id: r.id, min: Number(f.min) }
            : r,
        ),
      }));
    if (modal === "Log activity")
      S((d) => ({
        ...d,
        records: [{ ...f, name, id, min: Number(f.min) }, ...d.records],
      }));
    if (modal === "New habit")
      S((d) => ({
        ...d,
        habits: [
          ...d.habits,
          { name, id, cat: f.cat, color: picked, days: [] },
        ],
      }));
    if (modal === "New milestone")
      S((d) => ({ ...d, lessons: [...d.lessons, { id, name, done: false }] }));
    U(user ? "Workspace updated" : "Saved to your workspace");
    M("");
  }
  const activityButton = (
    <button className="primary" onClick={() => M("Log activity")}>
      <Plus size={16} /> Log activity
    </button>
  );
  const section = (label, right) => (
    <div className="sectionHeading">
      <h2>{label}</h2>
      {right}
    </div>
  );
  const pillars = (
    <PillarSignals
      records={db.records}
      goals={db.goals || [35, 50, 45]}
      period={span}
      setPeriod={V}
    />
  );
  const habitrow = (h, i, full = false) => {
    let done = h.days.includes(today);
    return (
      <div className="habitrow" key={h.id} style={{ "--color": h.color }}>
        <div className="miniIcon">
          {ico([Flower2, BookOpen, Footprints, NotebookPen][i % 4], 17)}
        </div>
        <div className="grow">
          <b>{h.name}</b>
          <small>
            {h.cat}
            {full ? " · " + h.days.length + " days completed" : ""}
          </small>
        </div>
        <button
          className={"check " + (done ? "done" : "")}
          aria-label={(done ? "Undo " : "Complete ") + h.name}
          aria-pressed={done}
          onClick={() => toggle(h.id)}
        >
          {done && <Check size={13} />}
        </button>
      </div>
    );
  };
  const habits = (
    <section className="panel daily">
      <div className="between">
        <h3>
          <ListChecks /> Daily habits
        </h3>
        <span className="counter">
          {complete}/{db.habits.length} done
        </span>
      </div>
      <div className="daily-progress">
        <span>Today’s completion</span>
        <b>{Math.round((100 * complete) / (db.habits.length || 1))}%</b>
        <div>
          <i
            style={{ width: (100 * complete) / (db.habits.length || 1) + "%" }}
          />
        </div>
      </div>
      {db.habits.slice(0, 4).map((h, i) => habitrow(h, i))}
      {!db.habits.length && (
        <p>No habits yet. Create your first habit below.</p>
      )}
      <button className="textbtn full" onClick={() => nav("Habit Tracker")}>
        View habit tracker <ArrowRight size={13} />
      </button>
    </section>
  );
  let sorted = db.records
    .filter(
      (r) =>
        (filter === "All pillars" || r.cat === filter) &&
        r.name.toLowerCase().includes(query.trim().toLowerCase()),
    )
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  const log = (
    <section className="panel log">
      <div className="between">
        <h3>
          <History /> Activity log
        </h3>
        <div className="log-tools">
          <input
            type="search"
            placeholder="Search activities…"
            aria-label="Search activities"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            className="secondary"
            onClick={() =>
              saveCsv("flint-activities.csv", [
                ["Activity", "Pillar", "Date", "Time", "Minutes"],
                ...sorted.map((r) => [r.name, r.cat, r.date, r.time, r.min]),
              ])
            }
          >
            <Download size={13} /> CSV
          </button>
          <div className="selectWrap">
            <SlidersHorizontal size={13} />
            <select
              aria-label="Filter activity log"
              value={filter}
              onChange={(e) => F(e.target.value)}
            >
              {["All pillars", ...cats].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="tableScroll">
        <table>
          <thead>
            <tr>
              {["Activity", "Pillar", "Date", "Duration", ""].map((x) => (
                <th key={x}>{x}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.slice(0, all ? undefined : 4).map((r) => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>
                  <span
                    className="tag"
                    style={{ "--color": colors[cats.indexOf(r.cat)] }}
                  >
                    {r.cat}
                  </span>
                </td>
                <td>{fmt(r.date, { month: "short", day: "numeric" })}</td>
                <td>{dur(r.min)}</td>
                <td>
                  <button
                    aria-label={"Edit " + r.name}
                    className="editRow"
                    onClick={() => {
                      E(r);
                      M("Edit activity");
                    }}
                  >
                    <Pencil size={14} />
                  </button>
                  <a
                    aria-label={"Add " + r.name + " to Google Calendar"}
                    target="_blank"
                    rel="noreferrer"
                    href={calURL(r)}
                  >
                    <CalendarPlus size={15} />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!sorted.length && <p>No activities in this view.</p>}
      {sorted.length > 4 && (
        <button className="textbtn full" onClick={() => A(!all)}>
          {all
            ? "Show recent activities"
            : `View all ${sorted.length} activities`}{" "}
          <ArrowRight size={13} />
        </button>
      )}
    </section>
  );
  return (
    <>
      <GlassyDashboard
        personal
        workspaceName="FlinT System"
        initialTheme="dark"
        panelFrost={18}
        views={trackerViews}
        active={slug(page)}
        select={(id) => nav(pages.find((p) => slug(p) === id) || "Overview")}
        notices={db.habits
          .filter((h) => !h.days.includes(today))
          .map((h) => ({
            id: h.id,
            label: h.name,
            description: h.cat + " · Not checked in today",
            open: () => nav("Habit Tracker"),
          }))}
        quickActions={[
          {
            label: "Log activity",
            description: "Record time for a pillar",
            icon: Plus,
            run: () => M("Log activity"),
          },
          {
            label: "Create habit",
            description: "Set up a daily habit",
            icon: ListChecks,
            run: () => {
              C(colors[0]);
              M("New habit");
            },
          },
        ]}
      >
        <section
          className={"gd-title " + (page === "Overview" ? "gd-title-home" : "")}
        >
          <div className="title-meta">
            <i />{" "}
            {page === "Overview"
              ? "PERSONAL COMMAND CENTER"
              : "PERSONAL WORKSPACE"}
          </div>
          <h1>{page === "Overview" ? "Life Observatory" : page}</h1>
          <p>{descriptions[page]}</p>
          <div className="gd-title-actions">
            {page === "Overview" && activityButton}
            <span className="gd-date">
              <CalendarDays size={14} />
              {fmt(today, { weekday: "short", month: "short", day: "numeric" })}
            </span>
          </div>
          <span className="scene-coordinate" aria-hidden="true">
            <i /> ENV. 01 / ALPINE
          </span>
        </section>
        {status === "saving" && user && (
          <p role="status" className="cloud-state">
            Saving to your cloud workspace…
          </p>
        )}
        {["error", "conflict"].includes(status) && (
          <div className="cloud-state" role="alert">
            <p>
              {status === "conflict"
                ? "Another session changed this workspace. Export a backup of your unsaved edits in Settings, then reload to open the latest cloud version."
                : user
                  ? "Cloud save failed. Your edits are only in this tab. Retry or export a backup in Settings before leaving."
                  : "Browser storage unavailable. Export a backup in Settings to keep your edits."}
            </p>
            {status === "error" && (
              <button className="secondary" onClick={store.retry}>
                Retry save
              </button>
            )}
            {status === "conflict" && (
              <button
                className="secondary"
                onClick={() => {
                  if (
                    confirm("Discard unsaved edits and load the cloud version?")
                  )
                    location.reload();
                }}
              >
                Reload cloud version
              </button>
            )}
          </div>
        )}
        {page === "Overview" && (
          <>
            {pillars}
            <div className="gd-signal-grid">
              <LiveStats records={db.records} habits={db.habits} />
              {habits}
            </div>
            <Chart records={db.records} period={period} setPeriod={G} />
            {log}
          </>
        )}
        {page === "Progress" && (
          <>
            {pillars}
            <Chart details records={db.records} period={period} setPeriod={G} />
            <div className="panel">
              <h3>
                <CalendarDays /> Google Calendar
              </h3>
              <p>
                Use the calendar icon beside an activity to add it to your
                Google Calendar. Account sync is not connected.
              </p>
            </div>
            {log}
          </>
        )}
        {page === "Habit Tracker" && (
          <>
            {section(
              "Your habits",
              <button
                className="primary"
                onClick={() => {
                  C(colors[0]);
                  M("New habit");
                }}
              >
                <Plus size={15} /> New habit
              </button>,
            )}
            <div className="panel">
              <div className="between">
                <h3>
                  <Target /> Today’s progress
                </h3>
                <b>
                  {complete} / {db.habits.length}
                </b>
              </div>
              <div className="track thick">
                <i
                  style={{
                    width: (complete / (db.habits.length || 1)) * 100 + "%",
                  }}
                />
              </div>
              <p>{db.habits.length - complete} habits left for today</p>
            </div>
            <div className="habitgrid">
              {cats.map((c, i) => (
                <section key={c} className="panel">
                  <h3 style={{ color: colors[i] }}>
                    {ico(icons[i])}
                    {c}
                  </h3>
                  {db.habits
                    .filter((h) => h.cat === c)
                    .map((h, j) => habitrow(h, j, true))}
                  {!db.habits.some((h) => h.cat === c) && <p>No habits yet.</p>}
                </section>
              ))}
            </div>
            <div className="panel">
              <h3>
                <ChartNoAxesCombined /> Last seven days
              </h3>
              <div className="bars">
                {Array.from({ length: 7 }, (_, i) => {
                  let d = day(i - 6),
                    n = db.habits.filter((h) => h.days.includes(d)).length;
                  return (
                    <div key={d}>
                      <b>{n}</b>
                      <i
                        style={{
                          height: 3 + (65 * n) / (db.habits.length || 1),
                        }}
                      />
                      <small>{fmt(d, { weekday: "short" })}</small>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
        {page === "Career Hub" && (
          <>
            <div className="panel course">
              <div className="eyebrow">COURSE WORKSPACE</div>
              <h2>100xDevs</h2>
              <p>Keep track of the lessons and projects you’re working on.</p>
              <a
                className="primary"
                href="https://100xdevs.com"
                target="_blank"
                rel="noreferrer"
              >
                Open course <ArrowUpRight size={15} />
              </a>
            </div>
            {section(
              "Learning milestones",
              <button className="secondary" onClick={() => M("New milestone")}>
                <Plus size={15} />
                Add milestone
              </button>,
            )}
            <div className="panel">
              {!db.lessons.length && (
                <p>
                  Add your first lesson or project to start tracking your course
                  progress.
                </p>
              )}
              {db.lessons.map((l) => (
                <label className="lesson" key={l.id}>
                  <input
                    type="checkbox"
                    checked={l.done}
                    onChange={() =>
                      S({
                        ...db,
                        lessons: db.lessons.map((x) =>
                          x.id === l.id ? { ...x, done: !x.done } : x,
                        ),
                      })
                    }
                  />
                  {l.name}
                </label>
              ))}
            </div>
          </>
        )}
        {apps[page] && (
          <div className="panel">
            <div className="between">
              <h3>
                <Link2 /> Connected workspace
              </h3>
              <a
                className="secondary"
                target="_blank"
                rel="noreferrer"
                href={apps[page]}
              >
                Open app <ArrowUpRight size={15} />
              </a>
            </div>
            <p>
              If the embedded app requires sign-in or doesn’t load, open it in a
              new tab.
            </p>
            <iframe
              key={page}
              title={page}
              src={apps[page]}
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        )}
        {page === "Settings" && (
          <div className="panel settings">
            <AccountSettings user={user} status={status} />
            <h3>
              <Target /> Daily pillar goals
            </h3>
            <p>
              Set your target minutes per day. The pillar cards compare your
              logged time against these goals.
            </p>
            <form
              className="goals"
              onSubmit={(e) => {
                e.preventDefault();
                let f = new FormData(e.target);
                S({ ...db, goals: cats.map((c) => Number(f.get(c))) });
                U("Daily goals updated");
              }}
            >
              {cats.map((c, i) => (
                <label key={c}>
                  {c} (min)
                  <input
                    type="number"
                    required
                    min="1"
                    max="1440"
                    name={c}
                    defaultValue={(db.goals || [35, 50, 45])[i]}
                  />
                </label>
              ))}
              <button className="secondary">Save goals</button>
            </form>
            <hr />
            <h3>
              <Settings2 /> Workspace data
            </h3>
            <p>
              {user
                ? "Export a copy of your cloud workspace. Importing a backup replaces the signed-in account’s records."
                : "Records are saved in this browser. Export a backup before clearing browser data."}
            </p>
            <button
              className="secondary"
              onClick={() => {
                let url = URL.createObjectURL(
                    new Blob([JSON.stringify(db, null, 2)], {
                      type: "application/json",
                    }),
                  ),
                  a = document.createElement("a");
                a.href = url;
                a.download = "flint-workspace.json";
                a.click();
                setTimeout(() => URL.revokeObjectURL(url), 1000);
              }}
            >
              <Download size={15} />
              Export backup
            </button>{" "}
            <button className="secondary" onClick={() => imp.current.click()}>
              <Upload size={15} />
              Import backup
            </button>
            <input
              type="file"
              accept="application/json"
              hidden
              ref={imp}
              onChange={async (e) => {
                let f = e.target.files[0];
                e.target.value = "";
                if (!f) return;
                try {
                  let data = JSON.parse(await f.text());
                  if (!valid(data)) throw Error();
                  if (confirm("Replace this workspace with the backup?")) {
                    S(data);
                    U("Backup restored");
                  }
                } catch {
                  U("Invalid FlinT workspace backup");
                }
              }}
            />
            <hr />
            <h3>Start fresh</h3>
            <p>
              {db.sample
                ? "Your workspace includes example records to explore. "
                : ""}
              Clear all activities, habits, and milestones to begin with an
              empty workspace.
            </p>
            <button className="secondary" onClick={() => M("Clear workspace")}>
              Clear workspace
            </button>
          </div>
        )}
      </GlassyDashboard>
      <dialog
        ref={dia}
        onCancel={() => M("")}
        onClick={(e) => {
          if (e.target === dia.current) M("");
        }}
      >
        <div className="between">
          <h2>{modal}</h2>
          <button
            className="iconbtn"
            aria-label="Close dialog"
            onClick={() => M("")}
          >
            <X size={18} />
          </button>
        </div>
        {modal === "Clear workspace" ? (
          <>
            <p>
              {user
                ? "This deletes all tracking data in your cloud workspace on every device."
                : "This removes all locally saved tracking data."}{" "}
              Export a backup first if you want to keep it.
            </p>
            <button
              className="primary"
              onClick={() => {
                S({ records: [], habits: [], lessons: [], sample: false });
                M("");
                U("Workspace cleared");
              }}
            >
              Confirm clear
            </button>
          </>
        ) : (
          modal && (
            <form key={modal} onSubmit={add}>
              <label>
                Name
                <input
                  required
                  autoFocus
                  onInput={(e) => e.target.setCustomValidity("")}
                  maxLength={100}
                  name="name"
                  defaultValue={modal === "Edit activity" ? editing.name : ""}
                  placeholder={
                    modal === "Log activity"
                      ? "e.g. Evening walk"
                      : modal === "New habit"
                        ? "e.g. Read 10 pages"
                        : "e.g. Finish React lesson"
                  }
                />
              </label>
              {modal !== "New milestone" && (
                <label>
                  Pillar
                  <select
                    name="cat"
                    defaultValue={
                      modal === "Edit activity" ? editing.cat : cats[0]
                    }
                  >
                    {cats.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
              )}
              {["Log activity", "Edit activity"].includes(modal) && (
                <>
                  <label>
                    Duration (minutes)
                    <input
                      name="min"
                      type="number"
                      min="1"
                      max="1440"
                      defaultValue={
                        modal === "Edit activity" ? editing.min : 30
                      }
                      required
                    />
                  </label>
                  <div className="formrow">
                    <label>
                      Date
                      <input
                        name="date"
                        type="date"
                        max={today}
                        defaultValue={
                          modal === "Edit activity" ? editing.date : today
                        }
                        required
                      />
                    </label>
                    <label>
                      Start time
                      <input
                        type="time"
                        name="time"
                        defaultValue={
                          modal === "Edit activity" ? editing.time : "09:00"
                        }
                        required
                      />
                    </label>
                  </div>
                </>
              )}
              {modal === "New habit" && (
                <label>
                  Habit color
                  <span className="swatches">
                    {[...colors, "#f6ad7c", "#ee95b6", "#e9ce79"].map((c) => (
                      <button
                        key={c}
                        aria-label={"Choose " + c}
                        type="button"
                        style={{ background: c }}
                        onClick={() => C(c)}
                      >
                        {c === picked && <Check size={15} />}
                      </button>
                    ))}
                  </span>
                </label>
              )}
              <button className="primary">
                {["Log activity", "Edit activity"].includes(modal)
                  ? "Save activity"
                  : modal === "New habit"
                    ? "Create habit"
                    : "Save milestone"}
              </button>
              {modal === "Edit activity" && (
                <button
                  className="textbtn"
                  type="button"
                  onClick={() => {
                    if (confirm("Delete this activity?")) {
                      S((d) => ({
                        ...d,
                        records: d.records.filter((r) => r.id !== editing.id),
                      }));
                      M("");
                      U("Activity deleted");
                    }
                  }}
                >
                  <Trash2 size={14} /> Delete activity
                </button>
              )}
            </form>
          )
        )}
      </dialog>
      {msg && (
        <div className="toast" role="status">
          {msg}
        </div>
      )}
    </>
  );
}
function calURL(r) {
  let start = new Date(`${r.date}T${r.time}`),
    end = new Date(+start + r.min * 60000);
  let stamp = (d) =>
    d
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  return (
    "https://calendar.google.com/calendar/render?" +
    new URLSearchParams({
      action: "TEMPLATE",
      text: r.name,
      dates: stamp(start) + "/" + stamp(end),
      details: "FlinT System · " + r.cat,
    })
  );
}
createRoot(document.getElementById("root")).render(
  <WorkspaceGate
    render={(user, loaded) => (
      <App key={user?.id ?? "guest"} user={user} loaded={loaded} />
    )}
  />,
);
