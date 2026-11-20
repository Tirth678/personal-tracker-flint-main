"use client";
import {
  useId,
  useRef,
  useState,
  useEffect,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  Check,
  Ellipsis,
  ChevronRight,
  LayoutDashboard,
  Moon,
  Search,
  Sun,
  TrendingUp,
  X,
  type LucideIcon,
} from "lucide-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import "@fontsource-variable/manrope";
import "./glassy-dashboard.css";
import { SampleWorkspace } from "./glassy-sample";
gsap.registerPlugin(useGSAP);
export interface GlassyDashboardProps {
  backgroundImage?: string;
  backgroundCredit?: { label: string; href: string };
  workspaceName?: string;
  panelFrost?: number;
  initialTheme?: "light" | "dark";
}
export interface WorkspaceView {
  id: string;
  label: string;
  short: string;
  icon: LucideIcon;
  description: string;
}
export interface Notice {
  id: string;
  label: string;
  description: string;
  open: () => void;
}
export interface ShellProps extends GlassyDashboardProps {
  views: WorkspaceView[];
  active: string;
  select: (view: string) => void;
  children: ReactNode;
  notices?: Notice[];
  personal?: boolean;
  quickActions?: {
    label: string;
    description: string;
    run: () => void;
    icon: LucideIcon;
  }[];
}
export const sampleViews: WorkspaceView[] = [
  {
    id: "command",
    label: "Command Center",
    short: "Command",
    icon: LayoutDashboard,
    description: "Revenue, automations, and what needs your attention.",
  },
  {
    id: "trends",
    label: "Trends",
    short: "Trends",
    icon: TrendingUp,
    description: "Compare operating costs and revenue over time.",
  },
  {
    id: "metrics",
    label: "Metrics",
    short: "Metrics",
    icon: BarChart3,
    description: "Track orders, traffic, and device performance.",
  },
  {
    id: "operations",
    label: "Premium Operations",
    short: "Operations",
    icon: BriefcaseBusiness,
    description: "Manage approvals, schedules, and exceptions across systems.",
  },
];
export function Dialog({
  title,
  children,
  close,
}: {
  title: string;
  children: ReactNode;
  close: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null),
    id = useId();
  useEffect(() => {
    ref.current?.showModal();
    ref.current?.querySelector("input")?.focus();
  }, []);
  return (
    <dialog
      ref={ref}
      className="gd-dialog"
      aria-labelledby={id}
      onClose={close}
      onClick={(e) => {
        if (e.target === e.currentTarget) e.currentTarget.close();
      }}
    >
      <div className="gd-dialog-inner">
        <div className="gd-dialog-title">
          <h2 id={id}>{title}</h2>
          <button
            aria-label="Close dialog"
            className="gd-icon-button"
            onClick={() => ref.current?.close()}
          >
            <X />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
function Dock({
  active,
  views,
  select,
  more,
}: {
  active: string;
  more?: () => void;
  views: WorkspaceView[];
  select: (s: string) => void;
}) {
  const nav = useRef<HTMLElement>(null),
    marker = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const root = nav.current,
      indicator = marker.current;
    if (!root || !indicator) return;
    const adjust = () => {
      const cur = root.querySelector<HTMLElement>("[aria-current=page]");
      if (!cur) {
        indicator.hidden = true;
        return;
      }
      indicator.hidden = false;
      Object.assign(indicator.style, {
        width: cur.offsetWidth + "px",
        height: cur.offsetHeight + "px",
        transform: `translate(${cur.offsetLeft}px, ${cur.offsetTop}px)`,
      });
      indicator.dataset.ready = "true";
    };
    const obs = new ResizeObserver(adjust);
    obs.observe(root);
    root.querySelectorAll("a").forEach((a) => obs.observe(a));
    adjust();
    return () => obs.disconnect();
  }, [active, views]);
  const click = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    e.preventDefault();
    select(id);
  };
  return (
    <nav
      ref={nav}
      className="gd-dock gd-dock-bottom"
      aria-label="Workspace views"
    >
      <span ref={marker} className="gd-dock-indicator" aria-hidden />
      {views.map(({ id, label, short, icon: Icon }) => (
        <a
          key={id}
          href={"#" + id}
          aria-label={label}
          aria-current={active === id ? "page" : undefined}
          onClick={(e) => click(e, id)}
        >
          <Icon aria-hidden />
          <span>{short}</span>
        </a>
      ))}
      {more && (
        <button
          className="gd-dock-more"
          onClick={more}
          aria-label="More workspace views"
        >
          <Ellipsis />
          <span>More</span>
        </button>
      )}
    </nav>
  );
}
function WorkspaceShell({
  backgroundImage = "/glass/alpine.webp",
  backgroundCredit,
  workspaceName = "ATLAS",
  panelFrost = 12,
  initialTheme = "dark",
  views,
  active,
  select,
  children,
  notices = [],
  personal = false,
  quickActions = [],
}: ShellProps) {
  const [theme, setTheme] = useState(initialTheme),
    [modal, M] = useState<"search" | "notifications" | null>(null),
    [query, Q] = useState(""),
    [read, R] = useState("");
  const content = useRef<HTMLDivElement>(null);
  const signature = notices.map((n) => n.id).join("|");
  const openSearch = () => {
    Q("");
    M("search");
  };
  useEffect(() => {
    try {
      const saved = personal ? localStorage.getItem("flint.palette") : null;
      setTheme(saved === "light" || saved === "dark" ? saved : initialTheme);
    } catch {
      setTheme(initialTheme);
    }
  }, [initialTheme, personal]);
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (personal) {
      try {
        localStorage.setItem("flint.palette", next);
      } catch {}
    }
  };
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (
        (e.metaKey || e.ctrlKey) &&
        e.key.toLowerCase() === "k" &&
        !document.querySelector("dialog[open]")
      ) {
        e.preventDefault();
        openSearch();
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  useGSAP(
    () => {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const layer = content.current;
      if (!layer) return;
      const els = layer.querySelectorAll(
        "[data-gd-enter],.pillar,.gd-title,.signalDeck,.panel",
      );
      if (els.length)
        gsap.fromTo(
          els,
          { opacity: 0.65, y: 9 },
          {
            opacity: 1,
            y: 0,
            duration: 0.34,
            ease: "power3.out",
            stagger: 0.025,
            clearProps: "opacity,transform",
          },
        );
    },
    { scope: content, dependencies: [active], revertOnUpdate: true },
  );
  const results = [
    ...views.map((v) => ({
      label: v.label,
      description: v.description,
      icon: v.icon,
      run: () => select(v.id),
    })),
    ...quickActions,
  ].filter((v) =>
    query
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .every((term) =>
        (v.label + " " + v.description).toLowerCase().includes(term),
      ),
  );
  const [sceneFailed, sceneError] = useState(false);
  useEffect(() => sceneError(false), [backgroundImage]);
  const current = views.find((v) => v.id === active) || views[0];
  return (
    <div
      className={"gd-app" + (personal ? " gd-tracker" : "")}
      data-theme={theme}
      style={
        {
          "--gd-panel-frost": Math.max(0, Math.min(36, panelFrost)) + "px",
          "--gd-scene": `url(${JSON.stringify(backgroundImage)})`,
        } as CSSProperties
      }
    >
      <img
        className="gd-background"
        src={sceneFailed ? "/glass/alpine.webp" : backgroundImage}
        onError={() => sceneError(true)}
        alt=""
        fetchPriority="high"
      />
      <div className="gd-surround">
        <div className="gd-top">
          <a
            href={"#" + views[0].id}
            className="gd-brand"
            onClick={(e) => {
              e.preventDefault();
              select(views[0].id);
            }}
          >
            <span className="gd-logo">
              <img src="/flint-mark.png" alt="" />
            </span>
            <div>
              <strong>{workspaceName}</strong>
              <small>
                {personal ? "PERSONAL WORKSPACE" : "ANALYTICS WORKSPACE"}
              </small>
            </div>
          </a>
          <button
            className="gd-ask"
            aria-label={"Search " + workspaceName + " views"}
            onClick={openSearch}
          >
            <Search size={16} />
            <span>Search workspace...</span>
            <kbd>⌘ K</kbd>
          </button>
          <div className="gd-top-actions">
            <span className="gd-online">
              <i />
              System online
            </span>
            <button
              type="button"
              className="gd-icon-button gd-theme"
              aria-label={
                theme === "dark"
                  ? "Switch to graphite theme"
                  : "Switch to obsidian theme"
              }
              onClick={toggleTheme}
            >
              {theme === "dark" ? <Sun /> : <Moon />}
            </button>
            <button
              type="button"
              className="gd-icon-button"
              aria-label="Notifications"
              onClick={() => {
                M("notifications");
                R(signature);
              }}
            >
              <Bell />
              {signature && read !== signature && <i />}
            </button>
            {personal && (
              <button
                className="gd-avatar"
                aria-label="Workspace settings"
                onClick={() => select("settings")}
              >
                T
              </button>
            )}
          </div>
        </div>
        <div className="gd-stage-wrap">
          <main className="gd-stage">
            <div className="gd-stage-scroll">
              <div className="gd-crumb">
                <LayoutDashboard size={12} /> Workspace{" "}
                <ChevronRight size={11} /> <b>{current.label}</b>
              </div>
              <div ref={content} className="gd-content" key={active}>
                {children}
              </div>
            </div>
          </main>
          <Dock
            views={personal ? views.slice(0, 4) : views}
            active={active}
            select={select}
            more={personal ? openSearch : undefined}
          />
        </div>
        <div className="gd-footer">
          <span>
            {personal
              ? "FlinT System · Personal life tracker"
              : "Sample workspace"}
          </span>
          {backgroundCredit && !sceneFailed && (
            <a href={backgroundCredit.href} target="_blank" rel="noreferrer">
              {backgroundCredit.label} <ArrowUpRight size={10} />
            </a>
          )}
        </div>
      </div>
      {modal === "search" && (
        <Dialog title="Search workspace" close={() => M(null)}>
          <label className="gd-command-input">
            <Search size={17} />
            <input
              type="search"
              aria-label="Find a view or action"
              placeholder="Find a view or action…"
              value={query}
              onChange={(e) => Q(e.target.value)}
            />
          </label>
          <div className="gd-quick-list">
            {results.map(({ label, description, run, icon: Icon }) => (
              <button
                key={label}
                onClick={() => {
                  M(null);
                  run();
                }}
              >
                <Icon />
                <div>
                  <strong>{label}</strong>
                  <small>{description}</small>
                </div>
                <ChevronRight />
              </button>
            ))}
            {results.length === 0 && <p>No matching views.</p>}
          </div>
        </Dialog>
      )}
      {modal === "notifications" && (
        <Dialog title="Notifications" close={() => M(null)}>
          <div className="gd-quick-list">
            {notices.map((n) => (
              <button
                key={n.id}
                onClick={() => {
                  M(null);
                  n.open();
                }}
              >
                <Bell />
                <div>
                  <strong>{n.label}</strong>
                  <small>{n.description}</small>
                </div>
                <ArrowRight />
              </button>
            ))}
            {!notices.length && (
              <p>
                <Check size={14} /> You’re all caught up.
              </p>
            )}
          </div>
        </Dialog>
      )}
    </div>
  );
}
export function GlassyDashboard(props: GlassyDashboardProps | ShellProps = {}) {
  return "views" in props ? (
    <WorkspaceShell {...props} />
  ) : (
    <SampleWorkspace {...props} Shell={WorkspaceShell} />
  );
}
export default GlassyDashboard;
