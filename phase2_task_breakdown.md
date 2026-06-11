# Athlete IQ — Phase 2 Task Breakdown

## Overview

Four features to take the app from functional to professional:
1. Dark mode with athletic aesthetic
2. Trend charts (FTP, pace, ACR, load over time)
3. Weekly training plan generation
4. Activity detail page with computed training context

**Tech stack:** Next.js 15, React 19, TypeScript, TanStack React Query, Tailwind CSS, Recharts (available), Radix UI
**UI path:** /Users/lukelanterme/Documents/Code/Personal/AI/Projects/garmin-ai-chat-ui
**garmin-adapter path:** /Users/lukelanterme/Documents/Code/Personal/AI/Projects/garmin-adapter
**athlete-iq-agents path:** /Users/lukelanterme/Documents/Code/Personal/Java/Projects/athlete-iq-agents


## Task Map

```
P2-T1  Dark Mode + Athletic Theme (frontend only)
  │
P2-T2  Trend Data Backend (garmin-adapter)
  └──→ P2-T3  Trend Charts Page (frontend)
  
P2-T4  Weekly Plan Agent (athlete-iq-agents)
  └──→ P2-T5  Weekly Plan Proxy + API (garmin-adapter + frontend)
       └──→ P2-T6  Weekly Plan Page (frontend)

P2-T7  Activity Context Backend (garmin-adapter)
  └──→ P2-T8  Activity Detail Page Enhancement (frontend)
```

P2-T1 is independent — do it first, everything after looks better.
P2-T2→T3, P2-T4→T5→T6, and P2-T7→T8 are three independent tracks that can run in parallel.


## P2-T1 — Dark Mode + Athletic Theme
**Agent:** modern-frontend-engineer
**Goal:** Transform the visual identity from generic shadcn defaults to a dark-first athletic training aesthetic.
**Scope:**
- Update `globals.css`: Redesign the dark mode CSS variables with a slate-900 background, refined card/border colors, and an athletic accent palette. Make dark mode the default.
- Add a theme toggle component (Sun/Moon icon) in the navigation bar using a simple cookie or localStorage preference + class toggle. No next-themes dependency — keep it simple with a `useTheme` hook.
- Update the light mode variables to be equally polished (warm grays, not the current cold blue defaults).
- Accent color shift: Replace the generic blue primary (`221.2 83.2% 53.3%`) with a more distinctive athletic palette — emerald as the primary accent (health/performance), amber for warnings, rose for high intensity. The primary should feel energetic, not corporate.
- Typography refinement: Add a display font for page headings (e.g., `font-display` class using a clean geometric sans like "Plus Jakarta Sans" from Google Fonts — one `@import` in globals.css). Body text stays Inter.
- Update the nav bar for dark mode: subtle border-b, logo area, active states.
- Audit all existing pages (dashboard, workouts, chat, activities, settings, sync) for dark mode contrast issues — fix any text/background combinations that become unreadable.
**Exit Criteria:**
- [ ] Dark mode is the default and looks polished
- [ ] Light mode toggle works and looks equally polished
- [ ] Theme toggle in nav bar (both desktop and mobile)
- [ ] All existing pages render correctly in both modes
- [ ] No contrast issues (text readable on all backgrounds)
- [ ] Accent colors are emerald/amber/rose — not generic blue
- [ ] `npm run build` succeeds


## P2-T2 — Trend Data Backend Endpoint
**Agent:** python-backend-engineer
**Goal:** Add a garmin-adapter endpoint that returns historical metrics at multiple time points for charting.
**Scope:**
- New endpoint: `GET /api/v1/metrics/trends?days=90&timezone=Africa/Johannesburg`
- Returns an array of weekly data points, each containing: week start date, total load that week, ACR at that point, estimated FTP at that point, estimated threshold pace at that point, activity count
- Implementation: iterate backward from today in 7-day windows, compute metrics for each window using existing `ActivityViewService` methods. This is computationally more expensive than a single snapshot — cache the result for 1 hour or compute on-demand.
- The endpoint reuses existing computation methods (not new algorithms) — it just calls them at different points in time.
- Authentication required.
**Exit Criteria:**
- [ ] `GET /api/v1/metrics/trends` returns an array of weekly data points
- [ ] Each point has: weekStart, totalLoad, acr, ftpWatts, thresholdPace, activityCount
- [ ] Data spans 90 days (≈13 weekly points)
- [ ] Existing tests pass (150)
- [ ] Response completes in <5 seconds


## P2-T3 — Trend Charts Page
**Agent:** modern-frontend-engineer
**Goal:** A "Trends" page with interactive charts showing training metrics over time.
**Scope:**
- New page: `/trends`
- Add "Trends" to navigation (between "Workouts" and settings)
- Proxy endpoint on garmin-adapter: `GET /api/v1/workouts/trends` → forwards to trend data endpoint
- Charts (using Recharts, already available):
  - **Training Load** — area chart, weekly total load. Color-coded background bands for "undertraining" / "optimal" / "overreaching" zones.
  - **Acute:Chronic Ratio** — line chart with horizontal reference lines at 0.8, 1.0, 1.3, 1.5. Color background bands: green (0.8-1.3), amber (1.3-1.5), red (>1.5).
  - **FTP** — line chart showing watts over time. Trend arrow (up/down/flat).
  - **Threshold Pace** — line chart showing pace over time (inverted Y axis — faster pace is higher).
- Time range selector: 30d / 60d / 90d toggle
- Responsive: charts stack vertically on mobile
- Dark mode compatible (Recharts supports custom colors via props)
**Exit Criteria:**
- [ ] Trends page renders at /trends with navigation link
- [ ] All four charts render with real data
- [ ] Time range toggle works (30/60/90 days)
- [ ] Charts are dark mode compatible
- [ ] Responsive on mobile
- [ ] `npm run build` succeeds


## P2-T4 — Weekly Training Plan Agent
**Agent:** java-backend-engineer
**Goal:** Add a new endpoint on athlete-iq-agents that generates a 7-day training plan.
**Scope:**
- New endpoint: `POST /api/v1/workout-plans/weekly`
- Request: `{ daysBack: 14, timezone: "Africa/Johannesburg", weekStartDate: "2026-06-16" }`
- The endpoint fetches training state once, then generates 7 daily workout plans that respect:
  - Progressive load (don't schedule hard sessions back-to-back)
  - Rest day placement (at least 1 rest day per week, ideally 2)
  - Sport balance (alternate running and cycling based on recent distribution)
  - Current fitness state (ACR, days since rest inform the weekly structure)
- Implementation options:
  - Option A: A new LangChain4j agent with a system prompt that takes the training state + 7-day constraint and outputs a weekly plan JSON
  - Option B: Programmatic scheduling (rule-based) that calls the existing daily planner for each non-rest day
- Option A is more flexible but more expensive (one large LLM call). Option B is more predictable. Recommend Option A with a detailed system prompt.
- Response: `{ weekStart, weekEnd, days: [{ date, sport, recommendationType, workoutPlan (same structure as daily plan) }] }`
**Exit Criteria:**
- [ ] `POST /api/v1/workout-plans/weekly` returns a 7-day plan
- [ ] Plan includes at least 1 rest day
- [ ] No back-to-back hard sessions
- [ ] Sport selection is balanced
- [ ] Each day's plan has full interval structure with pace/power targets
- [ ] `./gradlew build` succeeds


## P2-T5 — Weekly Plan Proxy + Frontend API Layer
**Agent:** python-backend-engineer (proxy) + modern-frontend-engineer (API layer)
**Goal:** Add proxy endpoint and frontend types/API/hook for the weekly plan.
**Scope:**
- garmin-adapter: Add `POST /api/v1/workouts/weekly-plan` proxy to athlete-iq-agents
- Frontend: Add `WeeklyPlan` types, `getWeeklyPlan()` API function, `useWeeklyPlan()` mutation to existing workouts-api.ts and use-workouts.ts
**Exit Criteria:**
- [ ] Proxy endpoint works (curl test)
- [ ] Frontend types, API, and hook compile
- [ ] `npm run build` succeeds


## P2-T6 — Weekly Training Plan Page
**Agent:** modern-frontend-engineer
**Goal:** A week view showing the 7-day training plan with daily workout cards.
**Scope:**
- New page: `/workouts/weekly` or expand the existing `/workouts` page with a tab/toggle between "Today" and "Weekly"
- Layout: 7 columns (desktop) or vertical stack (mobile), one per day
- Each day card shows: date, sport icon, recommendation type badge, duration, key target (tempo pace / threshold power), and the workout timeline strip (reuse from T3)
- Rest days show a distinct "Rest" card with a calm/muted style
- "Generate Weekly Plan" button at the top
- The current day is highlighted
- Click a day card to expand full interval detail (or link to the daily workout view)
**Exit Criteria:**
- [ ] Weekly view renders with 7 day cards
- [ ] Each day shows sport, type, duration, and timeline strip
- [ ] Rest days render distinctly
- [ ] Current day is highlighted
- [ ] Responsive on mobile (vertical stack)
- [ ] `npm run build` succeeds


## P2-T7 — Activity Computed Context Backend
**Agent:** python-backend-engineer
**Goal:** Add computed training context to the activity detail API response.
**Scope:**
- Enhance the existing `GET /api/v1/activities/{id}` endpoint (or add a `GET /api/v1/activities/{id}/context` sub-endpoint) that returns:
  - **Training load contribution:** This activity's computed load (from T2's `_compute_activity_load`)
  - **Hard session classification:** Was this classified as a hard session? (from T2's `_is_hard_session`)
  - **Relative intensity:** avg HR as % of max HR, or avg power as % of FTP
  - **Zone time:** This activity's time-in-zone breakdown using the sport-aware logic (from T5)
  - **Performance comparison:** For running — how this activity's pace compares to current threshold/tempo. For cycling — how this activity's power compares to current FTP. (e.g., "Average power 184W = 81% of FTP")
  - **Weekly position:** Where this activity sits in the training week (load rank, day of week, was it the hardest/easiest that week)
- Reuses existing methods from ActivityViewService — no new algorithms needed
- The user physiology is fetched from the user's profile (same as agent view)
**Exit Criteria:**
- [ ] Activity context data is available for any activity
- [ ] Includes load contribution, hard session flag, relative intensity, zone time, performance comparison
- [ ] Existing tests pass (150)


## P2-T8 — Activity Detail Page Enhancement
**Agent:** modern-frontend-engineer
**Goal:** Transform the activity detail page from a data dump into a training-context-rich view.
**Scope:**
- Fetch the computed context alongside the existing activity data
- Add a "Training Context" card at the top showing:
  - Training load badge: "Load: 108" with color coding (low/moderate/high relative to weekly average)
  - Hard session indicator: "Hard Session ✓" or "Easy/Moderate"
  - Relative intensity: "78% of max HR" or "81% of FTP" with a visual bar
  - Performance comparison: "Average pace 5:44/km — 14% slower than your threshold (5:02/km)" or "Average power 184W — 81% of FTP (226W)"
- Add a "Zone Distribution" card showing this activity's time-in-zone as colored horizontal bars (reuse the zone bar visual from the training snapshot)
- Add a "Weekly Context" mini-card: "This was your 3rd hardest session this week" or "Day 4 of 5 consecutive training days"
- Keep the existing metrics cards (Key Metrics, Performance, Health Metrics, Activity Information) but improve their dark mode styling
- Summary stat cards at the top of the activities list page (currently showing "--" for Total Activities, Total Distance, Total Time, Total Calories) should be populated with real computed values
**Exit Criteria:**
- [ ] Training context card shows load, hard session flag, relative intensity
- [ ] Performance comparison shows pace/power relative to current threshold/FTP
- [ ] Zone distribution visualizes this activity's zones
- [ ] Activity list summary stats are populated
- [ ] All cards render correctly in dark mode
- [ ] `npm run build` succeeds
