export const cats = ["Soul", "Mind", "Body"],
  colors = ["#bf9cec", "#8bd8be", "#efb17d"];
export const apps = {
  "Time Tracker": "https://time-tracker-personal-gamma.vercel.app/",
  "Money Tracker": "https://personal-money-tracker-umber.vercel.app/",
};
export function day(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export const today = day();
export const names = [
  "Morning meditation",
  "Deep work session",
  "Evening walk",
];
export function initial() {
  const records = [];
  for (let d = -27; d <= 0; d++)
    cats.forEach((cat, i) => {
      let min = Math.round(
        26 + i * 7 + 12 * Math.sin((d + i) * 1.42) + 8 * Math.cos(d * 0.78 + i),
      );
      records.unshift({
        id: crypto.randomUUID(),
        name: names[i],
        cat,
        min,
        date: day(d),
        time: ["07:00", "10:00", "17:00"][i],
      });
    });
  return {
    records,
    habits: [
      "Morning meditation",
      "Read 10 pages",
      "Daily movement",
      "Gratitude journal",
    ].map((name, i) => ({
      id: crypto.randomUUID(),
      name,
      cat: cats[i % 3],
      color: colors[i % 3],
      days: i < 2 ? [today] : [],
    })),
    lessons: [],
    sample: true,
  };
}
export function read() {
  try {
    const raw = localStorage.getItem("flint.v1");
    if (raw) {
      let d = JSON.parse(raw);
      if (valid(d)) return d;
    }
  } catch {}
  return initial();
}
const dateOK = (s) =>
  typeof s === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(s) &&
  Number.isFinite(Date.parse(s + "T12:00:00Z")) &&
  new Date(s + "T12:00:00Z").toISOString().slice(0, 10) === s;
const named = (x) =>
  x &&
  typeof x.id === "string" &&
  x.id.length > 0 &&
  typeof x.name === "string" &&
  x.name.trim().length > 0 &&
  x.name.length <= 100;
const list = (v, test) =>
  Array.isArray(v) &&
  v.every(test) &&
  new Set(v.map((x) => x.id)).size === v.length;
export function valid(d) {
  return (
    !!d &&
    list(
      d.records,
      (r) =>
        named(r) &&
        cats.includes(r.cat) &&
        Number.isInteger(r.min) &&
        r.min >= 1 &&
        r.min <= 1440 &&
        dateOK(r.date) &&
        /^([01]\d|2[0-3]):[0-5]\d$/.test(r.time),
    ) &&
    list(
      d.habits,
      (h) =>
        named(h) &&
        cats.includes(h.cat) &&
        Array.isArray(h.days) &&
        h.days.every(dateOK) &&
        /^#[a-f0-9]{6}$/i.test(h.color),
    ) &&
    list(d.lessons, (l) => named(l) && typeof l.done === "boolean") &&
    (!d.goals ||
      (Array.isArray(d.goals) &&
        d.goals.length === 3 &&
        d.goals.every((n) => Number.isInteger(n) && n > 0 && n <= 1440)))
  );
}
export function shift(date, n) {
  let d = new Date(date + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
export function range(date, period) {
  let d = new Date(date + "T12:00:00Z");
  if (period === "Monthly") {
    let first = date.slice(0, 8) + "01",
      last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0))
        .toISOString()
        .slice(0, 10);
    return [first, last];
  }
  if (period === "Hourly") return [date, date];
  let first = shift(date, -((d.getUTCDay() + 6) % 7));
  return [first, shift(first, 6)];
}
export function chartData(records, period, date, calendar) {
  let [first, last] = calendar
    ? range(date, period)
    : period === "Monthly"
      ? range(date, period)
      : [shift(date, -6), date];
  let n =
    period === "Monthly"
      ? Math.ceil(Number(last.slice(-2)) / 7)
      : period === "Hourly"
        ? 6
        : 7;
  let labels = [],
    vals = cats.map(() => []);
  for (let j = 0; j < n; j++) {
    let start = shift(first, j * (period === "Monthly" ? 7 : 1));
    let end = period === "Monthly" ? [shift(start, 6), last].sort()[0] : start;
    labels.push(
      period === "Hourly"
        ? `${4 * j}:00`
        : new Date(start + "T12:00").toLocaleDateString(
            "en-US",
            period === "Monthly"
              ? { month: "short", day: "numeric" }
              : { weekday: "short" },
          ),
    );
    cats.forEach((c, i) =>
      vals[i].push(
        records
          .filter(
            (r) =>
              r.cat === c &&
              (period === "Hourly"
                ? r.date === date &&
                  Math.floor(Number(r.time.slice(0, 2)) / 4) === j
                : r.date >= start && r.date <= end),
          )
          .reduce((a, r) => a + r.min, 0),
      ),
    );
  }
  return { labels, vals, n };
}
