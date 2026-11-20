import {
  useState,
  useEffect,
  useRef,
  useId,
  type ReactNode,
  type ComponentType,
} from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  ArrowDownToLine,
  Clock3,
  Eye,
  ListChecks,
  Search,
  ShieldCheck,
  ShoppingBag,
  TriangleAlert,
  Users,
  Zap,
} from "lucide-react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import {
  Dialog,
  sampleViews,
  type GlassyDashboardProps,
  type ShellProps,
} from "./glassy-dashboard";
const periods = ["7 days", "30 days", "90 days"] as const;
type Period = (typeof periods)[number];
const analytics = {
  "7 days": {
    revenue: 11600,
    orders: 319,
    visitors: 2184,
    refunds: 14,
    automation: 304,
    subscribers: 1847,
    change: ["+4.7%", "+7.4%", "+5.2%", "−8.0%"],
    axis: ["Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon"],
    collected: [1.2, 1.5, 1.35, 1.9, 1.59, 1.72, 2.34],
    costs: [0.8, 0.92, 0.72, 0.85, 1.04, 1.01, 0.84],
    desktop: [58, 63, 61, 57, 59, 64, 60],
    devices: [54, 38, 8],
  },
  "30 days": {
    revenue: 47200,
    orders: 1328,
    visitors: 8344,
    refunds: 56,
    automation: 1284,
    subscribers: 1847,
    change: ["+8.3%", "+12.2%", "+9.0%", "−3.4%"],
    axis: ["Oct 19", "Oct 24", "Oct 29", "Nov 3", "Nov 8", "Nov 13", "Nov 17"],
    collected: [5.5, 6.4, 5.2, 7.6, 6.8, 7.1, 8.6],
    costs: [4.3, 4.85, 4.52, 4.2, 5.85, 5.15, 5.5],
    desktop: [66, 57, 64, 58, 60, 55, 61],
    devices: [56, 36, 8],
  },
  "90 days": {
    revenue: 126100,
    orders: 3728,
    visitors: 24132,
    refunds: 162,
    automation: 3562,
    subscribers: 1847,
    change: ["+13.4%", "+17.5%", "+11.6%", "−5.2%"],
    axis: ["Aug 20", "Sep 4", "Sep 19", "Oct 4", "Oct 19", "Nov 3", "Nov 17"],
    collected: [13.7, 16.2, 15.4, 16.8, 18.6, 20.4, 25],
    costs: [10.2, 11.2, 12.1, 11.16, 13.4, 13.1, 14.9],
    desktop: [64, 62, 59, 53, 56, 63, 57],
    devices: [58, 33, 9],
  },
};
const statuses = ["Needs review", "Scheduled", "Running", "Exceptions"];
const initialWork = [
  [
    "OP-241",
    "Refund approval",
    "A refund exception is ready for the owner to review.",
    "Stripe",
    "Finance",
    statuses[0],
    "10:42",
  ],
  [
    "OP-238",
    "Send cap review",
    "Review the first batch size for the renewal campaign.",
    "HubSpot",
    "Marketing",
    statuses[0],
    "10:16",
  ],
  [
    "OP-235",
    "Inventory check",
    "Review 23 low-stock items for the next supplier order.",
    "Shopify",
    "Operations",
    statuses[1],
    "15:00",
  ],
  [
    "OP-234",
    "Executive summary",
    "Compile revenue, customer support and campaign performance.",
    "Reports",
    "Analytics",
    statuses[1],
    "Fri 09:00",
  ],
  [
    "OP-232",
    "Sync 142 orders",
    "Update CRM and fulfillment records with validated orders.",
    "Shopify",
    "Operations",
    statuses[2],
    "09:52",
  ],
  [
    "OP-229",
    "Lead enrichment",
    "Match recent support requests to the sales pipeline.",
    "HubSpot",
    "Sales",
    statuses[2],
    "09:23",
  ],
  [
    "OP-227",
    "Duplicate account",
    "Two CRM entries share a billing address. Updates are on hold.",
    "Salesforce",
    "Operations",
    statuses[3],
    "09:06",
  ],
  [
    "OP-223",
    "Calendar access",
    "The scheduling connector needs an owner to restore write access.",
    "Google",
    "Marketing",
    statuses[3],
    "08:41",
  ],
].map(([id, name, description, tool, owner, status, timestamp]) => ({
  id,
  name,
  description,
  tool,
  owner,
  status,
  timestamp,
}));
const recent = [
  ["Order records validated", "Shopify", "Complete", "10:38"],
  ["Refund sent to review", "Stripe", "Needs review", "10:24"],
  ["Renewal sequence scheduled", "HubSpot", "Scheduled", "10:07"],
  ["Support digest delivered", "Reports", "Complete", "09:51"],
  ["Account match paused", "Salesforce", "Exceptions", "09:06"],
];
const usd = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
export function saveCsv(filename: string, rows: (number | string)[][]) {
  const csv = rows
    .map((row) =>
      row
        .map((c) => {
          const s = String(c);
          return (
            '"' +
            (/^[=+\-@\t\r]/.test(s) ? "'" : "") +
            s.replaceAll('"', '""') +
            '"'
          );
        })
        .join(","),
    )
    .join("\r\n");
  const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    ),
    link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function Panel({
  title,
  children,
  subtitle,
  action,
}: {
  title: string;
  children: ReactNode;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <section className="gd-panel" data-gd-enter>
      <div className="gd-panel-head">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
function Counter({ value }: { value: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const t = String(value),
        m = /^(\$?)([0-9.,]+)(%|k)?$/.exec(t);
      if (!m) return;
      const num = Number(m[2].replaceAll(",", "")),
        dec = m[2].split(".")[1]?.length ?? 0,
        c = { v: 0 };
      gsap.to(c, {
        v: num,
        duration: 0.64,
        ease: "power3.out",
        onUpdate: () => {
          el.textContent =
            m[1] +
            c.v.toLocaleString("en-US", {
              minimumFractionDigits: dec,
              maximumFractionDigits: dec,
            }) +
            (m[3] ?? "");
        },
      });
    },
    { dependencies: [value], revertOnUpdate: true },
  );
  return (
    <>
      <span ref={ref} aria-hidden>
        {value}
      </span>
      <span className="gd-sr">{value}</span>
    </>
  );
}
function Metric({
  title,
  value,
  detail,
  icon,
}: {
  title: string;
  value: ReactNode;
  detail: string;
  icon?: ReactNode;
}) {
  return (
    <article className="gd-metric" data-gd-enter>
      <span>
        {title}
        {icon}
      </span>
      <strong>
        <Counter value={value} />
      </strong>
      <small>{detail}</small>
    </article>
  );
}
function Activity() {
  const [q, Q] = useState(""),
    [filter, F] = useState("All statuses");
  const rows = recent.filter(
    (r) =>
      r.join(" ").toLowerCase().includes(q.trim().toLowerCase()) &&
      (filter === "All statuses" || r[2] === filter),
  );
  return (
    <Panel
      title="Recent activity"
      action={
        <div className="gd-tools">
          <label>
            <Search size={14} />
            <input
              type="search"
              aria-label="Search activity"
              placeholder="Search activity"
              value={q}
              onChange={(e) => Q(e.target.value)}
            />
          </label>
          <select
            aria-label="Filter activity"
            value={filter}
            onChange={(e) => F(e.target.value)}
          >
            {[
              "All statuses",
              "Complete",
              "Needs review",
              "Scheduled",
              "Exceptions",
            ].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      }
    >
      <div className="gd-table-scroll">
        <table>
          <thead>
            <tr>
              {["Activity", "Source", "Status", "Time"].map((c) => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r[0]}>
                {r.map((c) => (
                  <td key={c}>{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!rows.length && <p>No matching activity.</p>}
    </Panel>
  );
}
function StackChart({
  labels,
  lower,
  upper,
  names,
}: {
  labels: string[];
  lower: number[];
  upper: number[];
  names: string[];
}) {
  const [active, A] = useState<number | null>(null),
    max = Math.max(...lower.map((v, i) => v + upper[i]), 1);
  return (
    <div>
      <div className="gd-chart-info">
        {names.join(" / ")}
        <b>
          {active !== null &&
            `${labels[active]} · ${(lower[active] + upper[active]).toLocaleString()}`}
        </b>
      </div>
      <div className="gd-stack" onMouseLeave={() => A(null)}>
        {labels.map((l, i) => (
          <button
            key={l}
            aria-label={`${l}, ${names[0]}: ${lower[i]}, ${names[1]}: ${upper[i]}`}
            onFocus={() => A(i)}
            onBlur={() => A(null)}
            onMouseEnter={() => A(i)}
            onClick={() => A(i)}
          >
            <span style={{ height: (100 * (lower[i] + upper[i])) / max + "%" }}>
              <i style={{ flexGrow: upper[i] }} />
              <i style={{ flexGrow: lower[i] }} />
            </span>
            <small>{l}</small>
          </button>
        ))}
      </div>
    </div>
  );
}
function RevenueChart({ s }: { s: (typeof analytics)[Period] }) {
  const [a, A] = useState<number | null>(null),
    id = useId(),
    max = Math.ceil((Math.max(...s.collected, ...s.costs) * 1.14) / 2.5) * 2.5;
  const path = (values: number[]) =>
    values
      .map((v, i) => {
        const x = i * 100,
          y = 200 - (200 * v) / max;
        return i
          ? `C${x - 50},${200 - (200 * values[i - 1]) / max} ${x - 50},${y} ${x},${y}`
          : `M0,${y}`;
      })
      .join(" ");
  return (
    <div>
      <div className="gd-chart-info">
        Revenue / Costs{" "}
        <b>
          {a !== null &&
            `${s.axis[a]} · ${usd(s.collected[a] * 1000)} / ${usd(s.costs[a] * 1000)}`}
        </b>
      </div>
      <div className="gd-line-plot">
        <svg
          viewBox="0 0 600 200"
          preserveAspectRatio="none"
          role="img"
          aria-label="Revenue and operating costs by date"
        >
          <defs>
            <linearGradient id={id} x2="0" y2="1">
              <stop stopColor="#afc9bc" stopOpacity=".4" />
              <stop offset="1" stopColor="#afc9bc" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 50, 100, 150, 200].map((y) => (
            <line
              key={y}
              x1="0"
              x2="600"
              y1={y}
              y2={y}
              stroke="#8886"
              strokeDasharray="3 5"
            />
          ))}
          <path d={path(s.collected) + "V200H0Z"} fill={`url(#${id})`} />
          {[s.collected, s.costs].map((v, i) => (
            <path
              key={i}
              d={path(v)}
              fill="none"
              stroke={i ? "#939493" : "#b7d2c2"}
              strokeWidth="3"
            />
          ))}
        </svg>
        <div>
          {s.axis.map((l, i) => (
            <button
              aria-label={`${l}, revenue ${usd(s.collected[i] * 1000)}, costs ${usd(s.costs[i] * 1000)}`}
              key={l}
              onFocus={() => A(i)}
              onMouseEnter={() => A(i)}
              onClick={() => A(i)}
              onBlur={() => A(null)}
              onMouseLeave={() => A(null)}
            />
          ))}
        </div>
      </div>
      <div className="gd-axis">
        {s.axis.map((l) => (
          <small key={l}>{l}</small>
        ))}
      </div>
    </div>
  );
}
function DeviceChart({ s }: { s: (typeof analytics)[Period] }) {
  const [a, A] = useState<number | null>(null),
    names = ["Desktop", "Mobile", "Tablet"];
  return (
    <>
      <div
        className="gd-ring"
        style={{
          background: `conic-gradient(#b8d4c3 0 ${s.devices[0]}%,#798781 0 ${100 - s.devices[2]}%,#48514e 0)`,
        }}
      >
        <div>
          <strong>
            {(a === null
              ? s.visitors
              : Math.round((s.visitors * s.devices[a]) / 100)
            ).toLocaleString()}
          </strong>
          <small>{a === null ? "Visitors" : names[a]}</small>
        </div>
      </div>
      {names.map((n, i) => (
        <button
          className="gd-device-row"
          aria-pressed={i === a}
          key={n}
          onClick={() => A(i === a ? null : i)}
        >
          {n}
          <b>{s.devices[i]}%</b>
        </button>
      ))}
    </>
  );
}
export function SampleWorkspace({
  Shell,
  ...props
}: GlassyDashboardProps & { Shell: ComponentType<ShellProps> }) {
  const route = () =>
    sampleViews.find((v) => v.id === location.hash.slice(1))?.id ?? "command";
  const [v, V] = useState(route),
    [period, P] = useState<Period>("30 days"),
    [work, W] = useState(initialWork),
    [item, I] = useState(""),
    [lane, L] = useState("All lanes");
  useEffect(() => {
    const fn = () => V(route());
    addEventListener("hashchange", fn);
    return () => removeEventListener("hashchange", fn);
  }, []);
  const select = (next: string) => {
      location.hash = next;
      V(next);
    },
    s = analytics[period],
    current = sampleViews.find((x) => x.id === v)!,
    selected = work.find((i) => i.id === item),
    review = work.filter((i) => i.status === "Needs review"),
    cost = s.costs.reduce((a, b) => a + b, 0) * 1000;
  const download = () =>
    v === "operations"
      ? saveCsv("atlas-operations.csv", [
          ["ID", "Workflow", "System", "Owner", "Status", "Time"],
          ...work.map((i) => [
            i.id,
            i.name,
            i.tool,
            i.owner,
            i.status,
            i.timestamp,
          ]),
        ])
      : saveCsv(`atlas-trends-${period.replace(" ", "-")}.csv`, [
          ["Period ending", "Revenue (USD)", "Operating costs (USD)"],
          ...s.axis.map((l, i) => [
            l,
            Math.round(s.collected[i] * 1000),
            Math.round(s.costs[i] * 1000),
          ]),
        ]);
  return (
    <Shell
      backgroundImage="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1800&q=85"
      backgroundCredit={{
        label: "Mountain photography · Unsplash",
        href: "https://unsplash.com",
      }}
      {...props}
      active={v}
      select={select}
      views={sampleViews}
      notices={review.map((i) => ({
        id: i.id,
        label: i.name,
        description: i.description,
        open: () => {
          select("operations");
          I(i.id);
        },
      }))}
    >
      <div className="gd-view-head">
        <div>
          <h1>{current.label}</h1>
          <p>{current.description}</p>
        </div>
        <div className="gd-tools">
          {v !== "operations" && (
            <div className="gd-period">
              {periods.map((p) => (
                <button
                  key={p}
                  aria-pressed={p === period}
                  onClick={() => P(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
          {["operations", "trends"].includes(v) && (
            <button className="gd-primary" onClick={download}>
              <ArrowDownToLine size={14} />
              Export CSV
            </button>
          )}
        </div>
      </div>
      {v === "command" ? (
        <>
          <div className="gd-demo-grid">
            <Panel title="Total revenue" action={<small>USD</small>}>
              <strong className="gd-balance">{usd(s.revenue)}</strong>
              <p>{s.change[0]} vs prior period</p>
              <div className="gd-tools">
                <button className="gd-primary" onClick={() => select("trends")}>
                  View trends <ArrowUpRight size={14} />
                </button>
                <button
                  className="gd-secondary"
                  onClick={() => select("metrics")}
                >
                  View metrics
                </button>
              </div>
              <div className="gd-streams">
                {["Subscriptions", "Services", "Add-ons"].map((l, i) => (
                  <span key={l}>
                    {l}
                    <b>{usd(s.revenue * [0.686, 0.208, 0.106][i])}</b>
                  </span>
                ))}
              </div>
            </Panel>
            <div className="gd-summary">
              <Metric
                title="Automations run"
                value={s.automation}
                detail="+9.6% vs prior period"
                icon={<Zap />}
              />
              <Metric
                title="Subscribers"
                value={s.subscribers}
                detail="+124 this month"
                icon={<Users />}
              />
              <Metric
                title="Churn rate"
                value="4.2%"
                detail="+0.6% vs prior period"
              />
              <Metric
                title="Open tickets"
                value="12"
                detail="9 resolved today"
              />
            </div>
            <Panel
              title="Automation activity"
              subtitle="Completed and sent to review · last 7 days"
            >
              <StackChart
                labels={analytics["7 days"].axis}
                lower={[108, 176, 138, 213, 155, 161, 238]}
                upper={[10, 11, 14, 19, 12, 15, 14]}
                names={["Complete", "Review"]}
              />
            </Panel>
          </div>
          <div className="gd-demo-lower">
            <div>
              <Panel title="Automation capacity">
                <progress value={1284} max={2200} />
                <p>1,284 used · 2,200 monthly runs</p>
              </Panel>
              <Panel title="Approvals" subtitle="Decisions that need an owner">
                <button
                  className="gd-secondary"
                  onClick={() => select("operations")}
                >
                  <ShieldCheck size={15} />
                  {review.length} waiting for review
                </button>
              </Panel>
            </div>
            <Activity />
          </div>
        </>
      ) : v === "operations" ? (
        <>
          <div className="gd-metric-grid">
            {[
              ["Revenue at work", "$126.1k", "last 90 days"],
              ["Active work items", work.length, "in the operations queue"],
              ["Needs approval", review.length, "waiting for an owner"],
              [
                "Connected systems",
                new Set(work.map((i) => i.tool)).size,
                "represented in the queue",
              ],
            ].map(([title, value, detail]) => (
              <Metric
                key={title}
                title={String(title)}
                value={value}
                detail={String(detail)}
              />
            ))}
          </div>
          <Panel
            title="Active work board"
            subtitle="Track queued actions, approvals, and connector exceptions."
            action={
              <select
                aria-label="Filter operations lanes"
                value={lane}
                onChange={(e) => L(e.target.value)}
              >
                {["All lanes", ...statuses].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            }
          >
            <div className="gd-lanes">
              {(lane === "All lanes" ? statuses : [lane]).map((l, i) => {
                const Icon = [ListChecks, Clock3, Zap, TriangleAlert][i],
                  items = work.filter((w) => w.status === l);
                return (
                  <div key={l} className="gd-lane">
                    <h3>
                      <Icon size={16} />
                      {l} · {items.length}
                    </h3>
                    {items.map((w) => (
                      <button key={w.id} onClick={() => I(w.id)}>
                        <b>{w.name}</b>
                        <p>{w.description}</p>
                        <small>
                          {w.tool} · {w.timestamp}
                        </small>
                      </button>
                    ))}
                    {!items.length && <p>Queue clear.</p>}
                  </div>
                );
              })}
            </div>
          </Panel>
        </>
      ) : (
        <>
          <div className="gd-metric-grid">
            <Metric
              title="Revenue"
              value={usd(s.revenue)}
              detail={s.change[0] + " vs prior period"}
            />
            {v === "trends" ? (
              <>
                <Metric
                  title="Operating costs"
                  value={usd(cost)}
                  detail="in this period"
                />
                <Metric
                  title="Net revenue"
                  value={usd(s.revenue - cost)}
                  detail="after operating costs"
                />
                <Metric
                  title="Operating margin"
                  value={
                    (((s.revenue - cost) / s.revenue) * 100).toFixed(1) + "%"
                  }
                  detail="of revenue"
                />
              </>
            ) : (
              <>
                <Metric
                  title="Orders"
                  value={s.orders}
                  detail={s.change[1]}
                  icon={<ShoppingBag />}
                />
                <Metric
                  title="Visitors"
                  value={s.visitors}
                  detail={s.change[2]}
                  icon={<Eye />}
                />
                <Metric
                  title="Refunds"
                  value={s.refunds}
                  detail={s.change[3]}
                  icon={<ArrowDownRight />}
                />
              </>
            )}
          </div>
          <div className="gd-demo-analytics">
            <Panel
              title={
                v === "trends"
                  ? "Revenue vs operating costs"
                  : "Revenue by device"
              }
            >
              {v === "trends" ? (
                <RevenueChart s={s} />
              ) : (
                <StackChart
                  labels={s.axis}
                  lower={s.collected.map((a, i) => a * 10 * s.desktop[i])}
                  upper={s.collected.map(
                    (a, i) => a * 10 * (100 - s.desktop[i]),
                  )}
                  names={["Desktop", "Mobile"]}
                />
              )}
            </Panel>
            <Panel title="Traffic by device">
              <DeviceChart s={s} />
            </Panel>
          </div>
          {v === "metrics" ? (
            <Activity />
          ) : (
            <Panel
              title="Reporting snapshot"
              subtitle={`${period} · ${s.axis[0]} to ${s.axis.at(-1)}`}
            >
              <button className="gd-secondary" onClick={download}>
                Download revenue and expense CSV
              </button>
            </Panel>
          )}
        </>
      )}
      {selected && (
        <Dialog title={selected.name} close={() => I("")}>
          <p>{selected.status}</p>
          <p>{selected.description}</p>
          <dl className="gd-facts">
            {[
              ["System", selected.tool],
              ["Owner", selected.owner],
              ["Reference", selected.id],
            ].map(([l, v]) => (
              <div key={l}>
                <dt>{l}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          {selected.status === "Needs review" && (
            <button
              className="gd-primary"
              onClick={() => {
                W(
                  work.map((w) =>
                    w.id === selected.id ? { ...w, status: "Scheduled" } : w,
                  ),
                );
                I("");
              }}
            >
              Mark reviewed
            </button>
          )}
        </Dialog>
      )}
    </Shell>
  );
}
