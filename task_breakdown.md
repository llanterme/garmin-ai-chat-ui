# Garmin AI Chat UI — Workout Extension Task Breakdown

## Overview

Extend the existing garmin-ai-chat-ui (Next.js 15 / React 19 / TanStack React Query / Tailwind) to support workout recommendations and structured workout plans. The UI currently only talks to garmin-adapter (port 8002), so athlete-iq-agents endpoints must be proxied through garmin-adapter to maintain the single-backend architecture.

**Tech stack:** Next.js 15, React 19, TypeScript, TanStack React Query, Tailwind CSS, Radix UI, Axios
**UI path:** /Users/lukelanterme/Documents/Code/Personal/AI/Projects/garmin-ai-chat-ui
**garmin-adapter path:** /Users/lukelanterme/Documents/Code/Personal/AI/Projects/garmin-adapter
**athlete-iq-agents path:** /Users/lukelanterme/Documents/Code/Personal/Java/Projects/athlete-iq-agents

**Sub-agents:**
- `python-backend-engineer` — garmin-adapter proxy endpoints (T1)
- `modern-frontend-engineer` — UI components, hooks, pages (T2–T4)

## Task Map

```
T1 (garmin-adapter proxy)
  │
  ├──→ T2 (UI types + API client + hook)
  │      │
  │      ├──→ T3 (Workouts page)
  │      │
  │      └──→ T4 (Dashboard metrics card + nav)
```

T1 is the prerequisite — it creates the proxy layer so the UI can reach athlete-iq-agents without a second API client.


## T1 — Garmin-Adapter Proxy Endpoints
**Agent:** python-backend-engineer
**Goal:** Add proxy endpoints to garmin-adapter that forward workout requests to athlete-iq-agents, keeping the UI's single-backend architecture.
**Scope:**
- New file: `src/api/workouts.py` with a FastAPI router
- Three proxy endpoints:
  - `POST /api/v1/workouts/recommendation` → forwards to `POST http://localhost:8085/api/v1/recommendations/daily`
  - `POST /api/v1/workouts/plan` → forwards to `POST http://localhost:8085/api/v1/workout-plans/daily`
  - `GET /api/v1/workouts/metrics` → forwards to `GET http://localhost:8085/api/v1/training-metrics`
- Use `httpx.AsyncClient` for the async HTTP forwarding (already a dependency via OpenAI SDK)
- Configure the athlete-iq-agents base URL via environment variable (ATHLETE_IQ_URL, default http://localhost:8085)
- No auth forwarding needed — athlete-iq-agents is internal, but the garmin-adapter endpoints should still require authentication (user must be logged in)
- Register the router in `src/main.py`
- Error handling: if athlete-iq-agents is unreachable, return 502 Bad Gateway with a clear message
**Exit Criteria:**
- [ ] `POST /api/v1/workouts/recommendation` returns a workout recommendation JSON
- [ ] `POST /api/v1/workouts/plan` returns a structured workout plan JSON
- [ ] `GET /api/v1/workouts/metrics` returns training metrics JSON
- [ ] All three endpoints require auth (return 401 without token)
- [ ] Returns 502 if athlete-iq-agents is unreachable
- [ ] Existing tests still pass (150)
**Key Learning:** BFF (Backend-for-Frontend) proxy pattern — the UI talks to one backend, which fans out to downstream services. Keeps auth in one place, avoids CORS, simplifies the frontend.


## T2 — UI Types, API Client, and React Query Hook
**Agent:** modern-frontend-engineer
**Goal:** Add the TypeScript types, API client module, and React Query hook for workout endpoints.
**Scope:**
- Update `src/types/index.ts` — add interfaces:
  - `WorkoutRecommendation` (recommendationType, durationMinutes, intensityDescription, reasoningSummary, riskLevel, confidence)
  - `WorkoutPlan` (sport, recommendationType, durationMinutes, intensityDescription, workoutStructure with segments and intervals, confidence, performanceMetrics)
  - `WorkoutSegment` (segment, durationMinutes, target, intervals)
  - `WorkoutInterval` (description, durationMinutes, target)
  - `TrainingMetrics` (totalLoad7Days, totalLoad28Days, acuteChronicRatio, hardSessions7Days, daysSinceHardSession, daysSinceRestDay, daysSinceRecoveryDay, avgAerobicEffect7Days, zoneDistribution7Days, sportDistribution7Days, performanceMetrics)
  - `WorkoutRequest` (daysBack, timezone)
  - `WorkoutPlanRequest` (daysBack, timezone, sportOverride?, durationOverride?, recommendationTypeOverride?)
- New file: `src/lib/workouts-api.ts` — follows the same pattern as `chat-api.ts` and `activities-api.ts`:
  - `getRecommendation(request)` → POST /workouts/recommendation
  - `getWorkoutPlan(request)` → POST /workouts/plan
  - `getTrainingMetrics(params?)` → GET /workouts/metrics
- New file: `src/hooks/use-workouts.ts` — follows the same pattern as `use-chat.ts`:
  - `useTrainingMetrics(daysBack?, timezone?)` — React Query query (auto-fetches)
  - `useRecommendation()` — React Query mutation (on-demand)
  - `useWorkoutPlan()` — React Query mutation (on-demand)
**Exit Criteria:**
- [ ] All TypeScript interfaces compile without errors
- [ ] API client functions follow existing patterns (apiCall wrapper, error handling)
- [ ] Hook exports queries and mutations consistent with existing hooks
- [ ] `npm run build` succeeds
**Key Learning:** Consistent API layer pattern — types → api client → hook → component. Each layer has a single responsibility: types define shape, api client handles HTTP, hook manages React Query state, component renders UI.


## T3 — Workouts Page
**Agent:** modern-frontend-engineer
**Goal:** Create a full workouts page with recommendation generation, workout plan display, and sport/duration overrides.
**Scope:**
- New file: `src/app/workouts/page.tsx` — the main page layout
- New component: `src/components/workouts/recommendation-card.tsx` — displays the recommendation (type, risk level, reasoning, confidence)
- New component: `src/components/workouts/workout-plan-card.tsx` — displays the structured workout with:
  - Sport and recommendation type header
  - Segment breakdown (warmup → main set → cooldown)
  - Interval detail within main set (description, duration, target pace/power)
  - Performance metrics summary
- New component: `src/components/workouts/workout-controls.tsx` — form with:
  - "Generate Recommendation" button (primary action)
  - "Generate Workout Plan" button (appears after recommendation)
  - Sport override dropdown (auto, running, cycling)
  - Duration override input (minutes, optional)
  - Recommendation type override dropdown (optional — allows skipping Agent 1)
- Page flow:
  1. User lands on page → sees training metrics summary at top (auto-fetched via useTrainingMetrics)
  2. User clicks "Generate Recommendation" → shows loading → displays recommendation card
  3. User clicks "Generate Workout Plan" → shows loading → displays workout plan card
  4. User can override sport/duration/type before generating the plan
- Design: follow existing Tailwind + Card patterns from dashboard and activities pages
- Loading states: use the same Loader2 spinner pattern from chat-interface.tsx
- Error states: show error messages in a red alert card
**Exit Criteria:**
- [ ] Page renders at /workouts
- [ ] "Generate Recommendation" calls the API and displays the result
- [ ] "Generate Workout Plan" calls the API and displays structured intervals
- [ ] Sport and duration overrides are passed to the API
- [ ] Loading and error states are handled
- [ ] Responsive on mobile
- [ ] `npm run build` succeeds
**Key Learning:** Multi-step form flow — the recommendation feeds into the plan, with optional overrides. State management via React Query mutations keeps the logic clean.


## T4 — Dashboard Training Metrics Card + Navigation Update
**Agent:** modern-frontend-engineer
**Goal:** Add a live training metrics summary card to the dashboard and add "Workouts" to the navigation.
**Scope:**
- Update `src/components/ui/navigation.tsx` — add Workouts to navigationItems:
  - name: "Workouts", href: "/workouts", icon: Dumbbell (from lucide-react)
  - Position it between "AI Chat" and the end
- Update `src/app/dashboard/page.tsx` — add a training metrics card that auto-fetches via `useTrainingMetrics`:
  - New component: `src/components/dashboard/training-metrics-card.tsx`
  - Displays: ACR (with color coding: green <1.0, yellow 1.0-1.3, red >1.3), 7-day load, days since rest, FTP, threshold pace
  - Zone distribution as a simple 3-bar horizontal visualization (low/moderate/high with color coding)
  - Sport distribution as small badges
  - "View Workouts" link to /workouts
  - Handles loading state (skeleton) and error state (retry button)
- The dashboard page becomes a client component ('use client') since it now uses hooks — or wrap only the metrics card in a client boundary
**Exit Criteria:**
- [ ] Navigation shows "Workouts" link on both desktop and mobile
- [ ] Dashboard displays live training metrics card
- [ ] ACR is color-coded by risk level
- [ ] Zone distribution visualization renders correctly
- [ ] Card handles loading and error states gracefully
- [ ] `npm run build` succeeds
**Key Learning:** Server vs client component boundary in Next.js 15 — the dashboard page is currently a server component with static content. Adding a data-fetching card requires either making the page a client component or using a client component island pattern.
