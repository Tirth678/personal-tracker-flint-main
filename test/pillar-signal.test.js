import test from "node:test";
import assert from "node:assert/strict";
import { pillarSignal } from "../src/lib/live-stats.js";
const records = [
  { cat: "Soul", min: 15, date: "2024-02-29", time: "08:00" },
  { cat: "Soul", min: 10, date: "2024-02-29", time: "08:30" },
  { cat: "Mind", min: 40, date: "2024-02-29", time: "08:30" },
  { cat: "Soul", min: 20, date: "2024-02-01", time: "09:00" },
  { cat: "Soul", min: 10, date: "2024-03-01", time: "07:00" },
];
test("today groups only the selected pillar by hour, with a capped goal", () => {
  const s = pillarSignal(records, "Soul", 20, "Today", "2024-02-29");
  assert.equal(s.minutes.length, 24);
  assert.equal(s.minutes[8], 25);
  assert.equal(s.total, 25);
  assert.equal(s.percent, 100);
  assert.equal(s.activityCount, 2);
});
test("pillar windows use rolling weeks and full calendar-month targets", () => {
  let s = pillarSignal(records, "Soul", 20, "Last 7 days", "2024-02-29");
  assert.equal(s.keys[0], "2024-02-23");
  assert.equal(s.goal, 140);
  assert.equal(s.total, 25);
  s = pillarSignal(records, "Soul", 20, "This month", "2024-02-01");
  assert.deepEqual(s.minutes, [20]);
  assert.equal(s.goal, 580);
  assert.equal(s.percent, 3);
  assert.equal(
    pillarSignal([], "Body", 45, "This month", "2024-02-29").percent,
    0,
  );
});
