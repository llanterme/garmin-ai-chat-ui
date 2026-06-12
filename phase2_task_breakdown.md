# Athlete IQ — Phase 2 Task Breakdown

## Overview

Four features to take the app from functional to professional:
1. Dark mode with athletic aesthetic
2. Trend charts (FTP, pace, ACR, load over time)
3. Weekly training plan generation
4. Activity detail page with computed training context

**Tech stack:** Next.js 15, React 19, TypeScript, TanStack React Query, Tailwind CSS, Recharts, Radix UI
**UI path:** /Users/lukelanterme/Documents/Code/Personal/AI/Projects/garmin-ai-chat-ui
**garmin-adapter path:** /Users/lukelanterme/Documents/Code/Personal/AI/Projects/garmin-adapter
**athlete-iq-agents path:** /Users/lukelanterme/Documents/Code/Personal/Java/Projects/athlete-iq-agents


## Task Map

```
P2-T1  Dark Mode + Athletic Theme (frontend only)                    ✅ DONE
  │
P2-T2  Trend Data Backend (garmin-adapter)                           ✅ DONE
  └──→ P2-T3  Trend Charts Page (frontend)                          ✅ DONE
  
P2-T4  Weekly Plan Agent (athlete-iq-agents)                         ✅ DONE
  └──→ P2-T5  Weekly Plan Proxy + API (garmin-adapter + frontend)    IN PROGRESS
       └──→ P2-T6  Weekly Plan Page (frontend)

P2-T7  Activity Context Backend (garmin-adapter)
  └──→ P2-T8  Activity Detail Page Enhancement (frontend)
```


## Completed Tasks

### P2-T1 — Dark Mode + Athletic Theme ✅
Emerald accent palette, Plus Jakarta Sans display font, dark-first with light mode toggle, all pages audited.

### P2-T2 — Trend Data Backend ✅
`GET /api/v1/metrics/trends` — weekly snapshots of load, ACR, FTP, pace over 90 days.

### P2-T3 — Trend Charts Page ✅
Four Recharts visualizations (load area, ACR line with zones, FTP line, pace line inverted), 30d/60d/90d toggle.

### P2-T4 — Weekly Training Plan Agent ✅
Two-phase generation: WeeklySchedulerAgent (7-day schedule) → SportAndWorkoutPlannerAgent (detail per day). Respects rest days, sport balance, hard-easy pattern.


## Remaining Tasks

### P2-T5 — Weekly Plan Proxy + Frontend API Layer
Split into P2-T5a (garmin-adapter proxy) and P2-T5b (frontend types/API/hook). IN PROGRESS.

### P2-T6 — Weekly Training Plan Page
Week view with 7 day cards, timeline strips, sport icons, rest day styling.

### P2-T7 — Activity Computed Context Backend
Per-activity training context: load contribution, hard session flag, relative intensity, zone distribution, performance comparison.

### P2-T8 — Activity Detail Page Enhancement
Training context cards, zone distribution visualization, performance comparison, weekly context, activity list summary stats.


## Deferred Improvements

### P2-D1 — Async Weekly Plan Generation
**Priority:** Medium — UX improvement for the weekly plan endpoint
**Description:** The weekly plan generation takes 15-20 seconds (6-7 sequential LLM calls) which is slow for a synchronous HTTP request. The current implementation uses a 120-second timeout and the user sees a spinner with no progress feedback.
**Proposed solution:** Convert to an async task pattern (matching the existing Garmin sync flow):
1. `POST /api/v1/workout-plans/weekly` → returns `{ taskId, status: "processing" }` immediately
2. Java service runs generation in a background thread, updating progress per day
3. `GET /api/v1/workout-plans/weekly/{taskId}` → returns `{ status: "processing", progress: "Generating Day 3 of 7..." }` or `{ status: "complete", data: {...} }`
4. garmin-adapter proxy endpoints mirror the pattern
5. Frontend hook uses polling (like the sync status hook) instead of a blocking mutation
**Scope:** Touches all three services (Java async execution + progress tracking, Python proxy for both POST and GET, frontend polling hook + progress UI)
**Prerequisite:** P2-T6 complete (synchronous weekly plan page working first)

### P2-D2 — Light Mode Chart Colors
**Priority:** Low — cosmetic polish
**Description:** Chart grid lines and axis text use hardcoded dark-mode hex colors (#2a2d3a, #8b8fa3). In light mode these are nearly invisible. Should swap based on theme.
**Fix:** Read theme from `useTheme` hook in chart components and swap grid/axis colors.

### P2-D3 — Dashboard Metadata Branding
**Priority:** Low — cosmetic
**Description:** Some page metadata still references "Garmin AI Chat" instead of "Athlete IQ" (e.g., dashboard page title in browser tab).
**Fix:** Search all `metadata` exports for "Garmin AI Chat" and replace with "Athlete IQ".
