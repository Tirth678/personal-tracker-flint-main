import test from "node:test";
import assert from "node:assert/strict";
import { initial, valid, range, chartData, shift } from "../src/data.js";
test("example workspace survives a backup round trip", () =>
  assert.ok(valid(JSON.parse(JSON.stringify(initial())))));
test("backup validator rejects invalid dates, categories, times and goals", () => {
  let db = initial();
  for (let patch of [
    { date: "2026-02-30" },
    { time: "25:00" },
    { min: -2 },
    { cat: "other" },
    { name: "  " },
  ])
    assert.equal(
      valid({ ...db, records: [{ ...db.records[0], ...patch }] }),
      false,
    );
  assert.equal(valid({ ...db, goals: [0, 20, 30] }), false);
});
test("calendar weeks cross month boundaries and February handles leap years", () => {
  assert.deepEqual(range("2026-11-01", "Weekly"), ["2026-10-26", "2026-11-01"]);
  assert.deepEqual(range("2024-02-29", "Monthly"), [
    "2024-02-01",
    "2024-02-29",
  ]);
  assert.equal(shift("2026-01-01", -1), "2025-12-31");
});
test("each report aggregates only entries inside the selected interval", () => {
  let records = [
    { cat: "Soul", min: 30, date: "2026-11-01", time: "07:30" },
    { cat: "Soul", min: 15, date: "2026-11-30", time: "23:59" },
    { cat: "Soul", min: 40, date: "2026-12-01", time: "12:00" },
  ];
  assert.deepEqual(
    chartData(records, "Monthly", "2026-11-12", true).vals[0],
    [30, 0, 0, 0, 15],
  );
  assert.deepEqual(
    chartData(records, "Hourly", "2026-11-30", true).vals[0],
    [0, 0, 0, 0, 0, 15],
  );
  assert.deepEqual(
    chartData(records, "Weekly", "2026-11-01", true).vals[0],
    [0, 0, 0, 0, 0, 0, 30],
  );
});
