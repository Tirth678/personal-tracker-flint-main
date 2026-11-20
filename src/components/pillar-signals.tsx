import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { CalendarDays, Clock3, History } from "lucide-react";
import { cats, day } from "@/data";
import { pillarSignal } from "@/lib/live-stats";
import { PeakChart } from "@/components/ui/peak-chart";
const specs = [
  ["Reflection & presence", "#9e8db2"],
  ["Learning & focus", "#86ab9b"],
  ["Movement & vitality", "#b8a087"],
];
const formatDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});
type Entry = { cat: string; date: string; min: number; time: string };
const periods = ["Last 7 days", "Today", "This month"];
function PillarCard({
  name,
  index,
  records,
  dailyGoal,
  period,
  end,
}: {
  name: string;
  index: number;
  records: Entry[];
  dailyGoal: number;
  period: string;
  end: string;
}) {
  const ref = useRef<HTMLDivElement>(null),
    [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const node = ref.current!;
    const measure = () => setWidth(Math.floor(node.clientWidth));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const signal = useMemo(
    () => pillarSignal(records, name, dailyGoal, period, end),
    [records, name, dailyGoal, period, end],
  );
  const labels = signal.keys.map((k) =>
    period === "Today" ? k : formatDate.format(new Date(k + "T12:00")),
  );
  const [description, accent] = specs[index];
  return (
    <article
      className="pillar-signal"
      style={{ "--tint": accent } as CSSProperties}
      aria-label={`${name} pillar`}
    >
      <div className="pillar-signal-plot" ref={ref}>
        {width > 0 && (
          <PeakChart
            width={width}
            layout="wide"
            data={signal.minutes}
            labels={labels}
            title={name}
            updatedText={`PILLAR / 0${index + 1}`}
            caption={description}
            value={signal.percent}
            valueSuffix="%"
            accent={accent}
            trend="none"
            periods={[]}
            period={period}
            formatValue={(v) => `${Math.round(v)} min`}
            font="inherit"
          />
        )}
        <span className="pillar-goal-note">of goal</span>
      </div>
      <div className="pillar-signal-foot">
        <span>
          <History size={12} />
          {signal.activityCount}{" "}
          {signal.activityCount === 1 ? "activity" : "activities"}
        </span>
        <span title={`${signal.total} of ${signal.goal} target minutes`}>
          <Clock3 size={12} />
          {signal.total >= 60
            ? `${Math.floor(signal.total / 60)}h ${signal.total % 60}m`
            : `${signal.total}m`}
        </span>
      </div>
    </article>
  );
}
export function PillarSignals({
  records,
  goals,
  period,
  setPeriod,
}: {
  records: Entry[];
  goals: number[];
  period: string;
  setPeriod: (s: string) => void;
}) {
  const end = day();
  return (
    <section aria-labelledby="pillar-heading">
      <div className="sectionHeading">
        <h2 id="pillar-heading">Pillar overview</h2>
        <label className="selectWrap">
          <CalendarDays size={14} />
          <select
            aria-label="Pillar period"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            {periods.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="pillar-signal-grid">
        {cats.map((c, i) => (
          <PillarCard
            key={c}
            name={c}
            index={i}
            records={records}
            dailyGoal={goals[i]}
            period={period}
            end={end}
          />
        ))}
      </div>
    </section>
  );
}
