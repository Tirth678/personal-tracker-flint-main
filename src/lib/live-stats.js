import { shift } from "../data.js";
/** Date-only keys keep local records independent of UTC and daylight-saving transitions. */
export function liveSeries(records, habits, period, end) {
  const count = period === "Weekly" ? 7 : period === "Monthly" ? 30 : 365;
  const start = shift(end, 1 - count),
    days = Array.from({ length: count }, (_, i) => shift(start, i));
  const minutes = new Map(days.map((d) => [d, 0])),
    checks = new Map(minutes);
  for (const r of records)
    if (minutes.has(r.date)) minutes.set(r.date, minutes.get(r.date) + r.min);
  for (const h of habits)
    for (const d of new Set(h.days))
      if (checks.has(d)) checks.set(d, checks.get(d) + 1);
  return {
    days,
    minutes: [...minutes.values()],
    checks: [...checks.values()],
    count,
  };
}

/** A pillar's window, series, and goal all use the same calendar boundaries. */
export function pillarSignal(records, pillar, dailyGoal, period, end) {
  const month = period === "This month",
    hourly = period === "Today";
  const first = month ? end.slice(0, 8) + "01" : hourly ? end : shift(end, -6);
  const rows = records.filter(
    (r) => r.cat === pillar && r.date >= first && r.date <= end,
  );
  const goalDays = month
    ? new Date(
        Date.UTC(Number(end.slice(0, 4)), Number(end.slice(5, 7)), 0),
      ).getUTCDate()
    : hourly
      ? 1
      : 7;
  const keys = Array.from(
    { length: hourly ? 24 : month ? Number(end.slice(-2)) : 7 },
    (_, i) => (hourly ? String(i).padStart(2, "0") + ":00" : shift(first, i)),
  );
  const totals = new Map(keys.map((key) => [key, 0]));
  for (const r of rows) {
    const key = hourly ? r.time.slice(0, 2) + ":00" : r.date;
    totals.set(key, totals.get(key) + r.min);
  }
  const minutes = Array.from(totals.values()),
    total = minutes.reduce((a, b) => a + b, 0),
    goal = goalDays * dailyGoal;
  return {
    keys,
    minutes,
    total,
    goal,
    activityCount: rows.length,
    percent: Math.min(100, Math.round((100 * total) / goal)),
  };
}
