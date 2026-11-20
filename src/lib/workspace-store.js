/** Serialize writes, coalesce intervening edits, and advance revision only on acknowledgement. */
export function createWorkspaceStore(initial, revision, save) {
  let state = { db: initial, status: "saved" },
    acknowledged = initial,
    writing = false,
    disposed = false;
  const listeners = new Set();
  const notify = (patch) => {
    state = { ...state, ...patch };
    for (const fn of listeners) fn();
  };
  async function flush() {
    if (
      writing ||
      disposed ||
      state.db === acknowledged ||
      state.status === "error" ||
      state.status === "conflict"
    )
      return;
    writing = true;
    notify({ status: "saving" });
    try {
      while (!disposed && acknowledged !== state.db) {
        const snapshot = state.db;
        revision = await save(snapshot, revision);
        acknowledged = snapshot;
      }
      if (!disposed) notify({ status: "saved" });
    } catch (e) {
      if (!disposed)
        notify({ status: e?.code === "40001" ? "conflict" : "error" });
    } finally {
      writing = false;
    }
  }
  return {
    getSnapshot: () => state,
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    update(change) {
      const db = typeof change === "function" ? change(state.db) : change;
      if (db === state.db) return;
      notify({ db });
      void flush();
    },
    retry() {
      if (state.status !== "error") return;
      notify({ status: "saving" });
      void flush();
    },
    dispose() {
      disposed = true;
      listeners.clear();
    },
  };
}
