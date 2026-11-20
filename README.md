# FlinT System

A local-first personal life tracker built with React and Vite. The Life Observatory dashboard brings together Soul, Mind, and Body activity, daily habits, and time spent on each pillar.

## Run

Use Node.js 22.12+ and `npm ci`. Run `npm run dev` for development, `npm test` for the data tests, and `npm run build` for a production bundle in `dist/`. Deploy as a Vite static site. Hash-based navigation works without a server rewrite.

## Workspace

- Log dated activities with start time, pillar, and duration; filter, edit, or delete them in the activity log. Set daily minute targets in Settings.
- Browse calendar weeks, months, and four-hour time blocks on Progress. The overview starts with a rolling seven-day chart.
- Create colored habits and check them off once per day. See daily completion and seven-day history.
- Manage personal 100xDevs learning milestones. The course link is a personal resource, not an official partnership or course API.
- Time Tracker and Money Tracker use dedicated embedded views and standalone launch links. Their accounts and data remain in their respective apps; embedding depends on the hosts’ frame policies and browser cookie settings.
- Each activity can open a prefilled Google Calendar event; save it in Google Calendar. No Google credentials are requested, and two-way account sync is not configured.

The first visit seeds illustrative data. Choose **Settings → Clear workspace** to start empty. Tracking data lives in localStorage for the current browser/origin. There is no server account, cross-device synchronization, or automatic remote backup. Export and import JSON backups in Settings. Clearing site storage removes local records. Avoid using a shared browser profile for private records.

## Live statistics and the Peak Chart

The home dashboard feeds the Louis Studios Peak Chart with local activity minutes and dated habit completions. Each card independently selects a rolling 7-, 30-, or 365-day window ending today. The line shows daily totals; the headline shows total tracked hours or check-ins in the window. Changes to the workspace update the cards directly from React state, without polling a server. Empty periods produce real zeroes, not demo data.

- Reusable TypeScript component: `src/components/ui/peak-chart.tsx` (`@/components/ui/peak-chart`).
- Tracker integration: `src/components/live-stats.tsx`. No extra context provider, API key, chart dependency, or hosted image is required. The artwork is drawn locally on canvas. The uploaded brand mark is in `public/flint-mark.png`.
- Standalone supplied two-card example: `/peak-demo.html`, implemented in `src/examples/demo.tsx`. Its example business metrics are deliberately separate from workspace data.
- Styling: `src/globals.css` is the Tailwind v4 / shadcn entry point; `src/style.css` and `src/glass.css` contain the tracker layout and black-glass theme. Tailwind preflight is omitted to preserve the existing tracker defaults.

### Component setup

TypeScript, React types, Tailwind v4 and `@tailwindcss/vite` are configured. After checkout run `npm ci`, `npm run typecheck`, then `npm run dev`. `npm run build` type-checks and builds both entries. No migration of the existing JSX pages is required.

The `@` alias points to `src` in both Vite and TypeScript. Thus `src/components/ui/` is the project's `components/ui` folder, **not** a second `components/` at the repository root. Keeping UI primitives there lets the shadcn CLI and imports agree on the same location. `components.json` configures these aliases, `src/lib/utils.ts` supplies `cn`, and `npx shadcn@latest add button` is an example of installing a future primitive. Initialization is already complete; do not rerun `init` over the existing theme.

## Spatial glass dashboard

Every tracker route uses `src/components/ui/glassy-dashboard.tsx` as its shared shell. Route content, navigation, contextual notifications and quick actions come from the tracker; no provider or remote analytics account is needed. Use the command bar (`⌘K` or `Ctrl+K`) or the floating bottom dock. On all screen sizes, **More** includes the connected apps and settings. The sun/moon control switches between obsidian and graphite and saves the preference in this browser. The activity log supports search and CSV export of the filtered records.

The shell uses locally bundled Manrope, Lucide icons, GSAP, and `@gsap/react`. Its scoped styles are in `src/components/ui/glassy-dashboard.css`; the tracker-specific layout is in `src/workspace.css`. The local alpine backdrop is adapted from [dharmx/walls](https://github.com/dharmx/walls/blob/main/monochrome/a_mountain_with_snow_on_it.jpg). The app retains its supplied logo and its live Peak Chart cards. Embedded external apps retain their own styles.

`/glassy-demo.html` runs the standalone four-view sample with its own reports, search, operation review, notifications and CSV downloads. It uses an Unsplash scene with a local fallback. To reuse it, import `GlassyDashboard` from `@/components/ui/glassy-dashboard` and pass `workspaceName`, `panelFrost`, `initialTheme`, and optional `backgroundImage` / `backgroundCredit`. Its demo records do not enter the tracker or its backups. `/peak-demo.html` remains available separately.

Soul, Mind, and Body reuse `PeakChart` in its wide layout on Overview and Progress. The shared pillar filter selects today (hourly minutes), the last seven days, or this calendar month (daily minutes). Percentages compare logged minutes with the configured goals for the full period; activity counts and durations use the same date range.
