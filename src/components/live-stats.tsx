import * as React from "react";
import { Activity, Clock3, ListChecks } from "lucide-react";
import { PeakChart } from "@/components/ui/peak-chart";
import { liveSeries } from "@/lib/live-stats";
import { day } from "@/data";
interface Props {
  records: { date: string; min: number }[];
  habits: { days: string[] }[];
}
const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);
const dateLabel = (d: string) =>
  new Date(d + "T12:00").toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
function SignalCard({
  kind,
  records,
  habits,
  end,
}: { kind: "time" | "habits"; end: string } & Props) {
  const [period, setPeriod] = React.useState("Weekly"),
    ref = React.useRef<HTMLDivElement>(null),
    [width, setWidth] = React.useState(0);
  React.useLayoutEffect(() => {
    const node = ref.current!;
    const resize = () =>
      setWidth(Math.min(210, Math.max(1, Math.floor(node.clientWidth))));
    resize();
    const obs = new ResizeObserver(resize);
    obs.observe(node);
    return () => obs.disconnect();
  }, []);
  const stats = React.useMemo(
    () => liveSeries(records, habits, period, end),
    [records, habits, period, end],
  );
  const time = kind === "time",
    points = time ? stats.minutes : stats.checks,
    total = sum(points),
    labels = stats.days.map(dateLabel);
  return (
    <div className="signalSlot" ref={ref}>
      {width > 0 && (
        <PeakChart
          width={width}
          data={points}
          labels={labels}
          period={period}
          onPeriodChange={setPeriod}
          value={time ? total / 60 : total}
          decimals={time ? 1 : 0}
          valueSuffix={time ? "h" : ""}
          updatedText={time ? "ACTIVITY / 01" : "HABITS / 02"}
          title={time ? "Tracked time" : "Habit check-ins"}
          caption={`Last ${stats.count} days · ${labels[0]} – ${labels[labels.length - 1]}`}
          trend="none"
          accent={time ? "#899bab" : "#88a799"}
          formatValue={(v) =>
            time ? `${Math.round(v)} min` : `${Math.round(v)} check-ins`
          }
        />
      )}
    </div>
  );
}
export function LiveStats({ records, habits }: Props) {
  const [end, setEnd] = React.useState(() => day());
  React.useEffect(() => {
    const update = () => setEnd(day());
    const id = window.setInterval(update, 60000);
    window.addEventListener("focus", update);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", update);
    };
  }, []);
  const todayRows = records.filter((r) => r.date === end),
    checks = habits.filter((h) => h.days.includes(end)).length;
  return (
    <section aria-labelledby="signal-title" className="signalDeck">
      <div className="signalHead">
        <div>
          <h2 id="signal-title">
            <Activity size={17} />
            Live statistics
          </h2>
          <p>Your activity and habit signals over time.</p>
        </div>
        <span className="signal-live">
          <i /> Live
        </span>
      </div>
      <div className="signalPair">
        <SignalCard kind="time" records={records} habits={habits} end={end} />
        <SignalCard kind="habits" records={records} habits={habits} end={end} />
      </div>
      <div className="signalStrip">
        <span>
          <Clock3 size={12} />
          {sum(todayRows.map((r) => r.min))} min today
        </span>
        <i />
        <span>
          <Activity size={12} />
          {todayRows.length} activities
        </span>
        <i />
        <span>
          <ListChecks size={12} />
          {checks}/{habits.length} habits
        </span>
      </div>
    </section>
  );
}
