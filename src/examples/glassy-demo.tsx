"use client";
import { useEffect, useState } from "react";
import GlassyDashboard from "@/components/ui/glassy-dashboard";
const settings = { workspaceName: "ATLAS", panelFrost: 12 };
function useWorkspaceTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const html = document.documentElement,
      preferred = matchMedia("(prefers-color-scheme: dark)");
    const update = () =>
      setDark(
        html.classList.contains("dark") || html.dataset.theme === "dark"
          ? true
          : html.classList.contains("light") || html.dataset.theme === "light"
            ? false
            : preferred.matches,
      );
    const changes = new MutationObserver(update);
    changes.observe(html, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });
    preferred.addEventListener("change", update);
    update();
    return () => {
      changes.disconnect();
      preferred.removeEventListener("change", update);
    };
  }, []);
  return dark;
}
export default function GlassyDashboardDemo(
  props: Partial<typeof settings> = {},
) {
  const s = { ...settings, ...props },
    dark = useWorkspaceTheme();
  return (
    <GlassyDashboard
      workspaceName={s.workspaceName}
      panelFrost={s.panelFrost}
      initialTheme={dark ? "dark" : "light"}
    />
  );
}
