import { test } from "node:test";
import assert from "node:assert/strict";
import { liveSeries } from "../src/lib/live-stats.js";
test("live stats sum records per day, exclude outside dates, deduplicate a habit check-in", () => {
  const result = liveSeries(
    [
      { date: "2026-11-13", min: 45 },
      { date: "2026-11-14", min: 12 },
      { date: "2026-11-20", min: 18 },
      { date: "2026-11-20", min: 30 },
      { date: "2026-11-21", min: 4 },
    ],
    [
      { days: ["2026-11-20", "2026-11-20"] },
      { days: ["2026-11-14", "2026-11-20"] },
    ],
    "Weekly",
    "2026-11-20",
  );
  assert.deepEqual(result.minutes, [12, 0, 0, 0, 0, 0, 48]);
  assert.deepEqual(result.checks, [1, 0, 0, 0, 0, 0, 2]);
});
test("monthly and yearly signals preserve zero days and leap boundaries", () => {
  for (const [period, count] of [
    ["Monthly", 30],
    ["Yearly", 365],
  ]) {
    const r = liveSeries([], [], period, "2024-03-01");
    assert.equal(r.count, count);
    assert.equal(r.days.at(-2), "2024-02-29");
    assert.equal(r.days.length, count);
    assert.ok(
      r.minutes.every((x) => x === 0) && r.checks.every((x) => x === 0),
    );
  }
});
