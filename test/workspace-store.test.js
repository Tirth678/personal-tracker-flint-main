import test from "node:test";
import assert from "node:assert/strict";
import { createWorkspaceStore } from "../src/lib/workspace-store.js";
const settle = () => new Promise((r) => setImmediate(r));
test("concurrent edits save in order at successive acknowledged revisions", async () => {
  const calls = [],
    pending = [];
  const s = createWorkspaceStore(0, 4, (data, rev) => {
    calls.push([data, rev]);
    return new Promise((resolve) => pending.push(resolve));
  });
  s.update(1);
  s.update((x) => x + 1);
  s.update(3);
  assert.deepEqual(calls, [[1, 4]]);
  pending.shift()(5);
  await settle();
  assert.deepEqual(calls, [
    [1, 4],
    [3, 5],
  ]);
  pending.shift()(6);
  await settle();
  assert.deepEqual(s.getSnapshot(), { db: 3, status: "saved" });
});
test("network errors retain edits; retry saves the latest version", async () => {
  let offline = true,
    calls = [];
  const s = createWorkspaceStore("a", 5, async (d, r) => {
    calls.push([d, r]);
    if (offline) throw Error();
    return r + 1;
  });
  s.update("b");
  await settle();
  s.update("c");
  assert.deepEqual(s.getSnapshot(), { db: "c", status: "error" });
  offline = false;
  s.retry();
  await settle();
  assert.deepEqual(calls, [
    ["b", 5],
    ["c", 5],
  ]);
  assert.equal(s.getSnapshot().status, "saved");
});
test("conflicts stop automatic writes, and sign-out disposal stops queued work", async () => {
  let count = 0;
  const s = createWorkspaceStore(0, 0, async () => {
    count++;
    throw { code: "40001" };
  });
  s.update(1);
  await settle();
  s.update(2);
  s.retry();
  assert.equal(count, 1);
  assert.deepEqual(s.getSnapshot(), { db: 2, status: "conflict" });
  let done;
  const calls = [];
  const t = createWorkspaceStore(0, 0, (x) => {
    calls.push(x);
    return new Promise((r) => (done = r));
  });
  t.update(1);
  t.update(2);
  t.dispose();
  done(1);
  await settle();
  assert.deepEqual(calls, [1]);
});
