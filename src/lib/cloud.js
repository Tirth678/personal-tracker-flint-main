import { createClient } from "@supabase/supabase-js";
import { valid } from "../data.js";
const url = import.meta.env.VITE_SUPABASE_URL?.trim(),
  key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
// Only the project's HTTPS Data API endpoint and its PUBLIC publishable key belong in Vite.
function configure() {
  if (!url && !key) return {};
  try {
    const endpoint = new URL(url);
    if (
      endpoint.protocol !== "https:" ||
      endpoint.username ||
      endpoint.password ||
      !key?.startsWith("sb_publishable_")
    )
      throw Error();
    return { client: createClient(endpoint.origin, key) };
  } catch {
    return {
      problem:
        "Cloud setup is incomplete. Check the Supabase project URL and publishable key.",
    };
  }
}
export const { client, problem } = configure();
export async function loadWorkspace(owner) {
  const { data, error } = await client.rpc("flint_load_workspace");
  if (error) throw error;
  if (data === null)
    return {
      revision: 0,
      workspace: {
        records: [],
        habits: [],
        lessons: [],
        sample: false,
        goals: [35, 50, 45],
      },
    };
  if (
    data.owner !== owner ||
    !Number.isSafeInteger(data.revision) ||
    !valid(data.workspace)
  )
    throw Error("Invalid cloud workspace");
  return data;
}
export async function saveWorkspace(owner, revision, workspace) {
  const { data, error } = await client.rpc("flint_save_workspace", {
    expected_owner: owner,
    expected_revision: revision,
    workspace,
  });
  if (error) throw error;
  if (data !== revision + 1) throw Error("Unexpected save response");
  return data;
}
