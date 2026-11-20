import { useEffect, useState } from "react";
import { Cloud, LogOut } from "lucide-react";
import { client, problem, loadWorkspace } from "../lib/cloud";
export async function signOut() {
  const { error } = await client.auth.signOut({ scope: "local" });
  if (error) throw error;
}
function GatePanel({ children }) {
  return (
    <div className="cloud-gate panel">
      <h2>FlinT System</h2>
      {children}
    </div>
  );
}
function AccountWorkspace({ user, render }) {
  const [result, R] = useState(null),
    [failed, F] = useState(false),
    [attempt, A] = useState(0);
  useEffect(() => {
    let current = true;
    F(false);
    loadWorkspace(user.id)
      .then((data) => {
        if (current) R(data);
      })
      .catch(() => {
        if (current) F(true);
      });
    return () => {
      current = false;
    };
  }, [user.id, attempt]);
  if (result) return render(user, result);
  return (
    <GatePanel>
      {failed ? (
        <>
          <p role="alert">
            Could not load your cloud workspace. Check the connection and
            database migration. Nothing has been overwritten.
          </p>
          <button className="secondary" onClick={() => A((a) => a + 1)}>
            Retry
          </button>{" "}
          <button
            className="secondary"
            onClick={() =>
              signOut().catch(() => alert("Could not sign out. Try again."))
            }
          >
            Sign out
          </button>
        </>
      ) : (
        <p role="status">Loading your private workspace…</p>
      )}
    </GatePanel>
  );
}
export function WorkspaceGate({ render }) {
  const [session, S] = useState(client ? undefined : null);
  useEffect(() => {
    if (!client) return;
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, next) => S(next));
    return () => subscription.unsubscribe();
  }, []);
  if (session === undefined)
    return (
      <GatePanel>
        <p role="status">Opening your workspace…</p>
      </GatePanel>
    );
  return session ? (
    <AccountWorkspace
      key={session.user.id}
      user={session.user}
      render={render}
    />
  ) : (
    render(null, null)
  );
}
export function AccountSettings({ user, status }) {
  const [email, E] = useState(""),
    [busy, B] = useState(false),
    [message, M] = useState("");
  async function login(e) {
    e.preventDefault();
    B(true);
    M("");
    try {
      const { error } = await client.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: location.origin + location.pathname },
      });
      if (error) throw error;
      M("Check your inbox for the sign-in link.");
    } catch {
      M("Could not send the link. Check the address and try again.");
    } finally {
      B(false);
    }
  }
  return (
    <>
      <h3>
        <Cloud /> Cloud workspace
      </h3>
      {user ? (
        <>
          <p>
            Signed in as <strong>{user.email}</strong>. Activity, habits,
            milestones, and goals are saved to your private Supabase workspace.
          </p>
          <button
            disabled={busy || status !== "saved"}
            className="secondary"
            onClick={async () => {
              B(true);
              try {
                await signOut();
              } catch {
                M("Could not sign out. Try again.");
                B(false);
              }
            }}
          >
            <LogOut size={14} /> Sign out
          </button>
        </>
      ) : client ? (
        <>
          <p>
            This is your local workspace. Sign in to open your separate cloud
            workspace. To bring existing records with you, export a backup here
            and import it after signing in.
          </p>
          <form className="cloud-login" onSubmit={login}>
            <label>
              Email address
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => E(e.target.value)}
              />
            </label>
            <button disabled={busy} className="secondary">
              {busy ? "Sending…" : "Email sign-in link"}
            </button>
          </form>
        </>
      ) : (
        <p>
          {problem ||
            "Local mode. Cloud accounts are not configured for this deployment."}
        </p>
      )}
      {message && <p role="status">{message}</p>}
      <hr />
    </>
  );
}
