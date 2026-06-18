# Athlete IQ — Phase 2 Task Breakdown

## Overview

Professional features taking the app from functional to polished.

**Status: 6 of 8 tasks COMPLETE. T7/T8 deferred behind P2.5 education layer.**


## Task Map

```
P2-T1  Dark Mode + Athletic Theme                    ✅ DONE
P2-T2  Trend Data Backend                            ✅ DONE
  └──→ P2-T3  Trend Charts Page                      ✅ DONE
P2-T4  Weekly Plan Agent (Java)                      ✅ DONE
  └──→ P2-T5  Weekly Plan Proxy + API                ✅ DONE
       └──→ P2-T6  Weekly Plan Page                  ✅ DONE
P2-T7  Activity Context Backend                      DEFERRED → reframed as education feature
  └──→ P2-T8  Activity Detail Page Enhancement       DEFERRED → reframed as education feature
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

### P2-T5 — Weekly Plan Proxy + Frontend API Layer ✅
P2-T5a garmin-adapter proxy (120s timeout), P2-T5b frontend types/API/hook.

### P2-T6 — Weekly Training Plan Page ✅
View toggle (Today/Weekly), 7 day cards with timeline strips, accordion expand for interval detail with pace/power targets, localStorage persistence, rest day distinct styling. Performance metrics footer.


## Deferred

| ID | Description | Status |
|----|-------------|--------|
| P2-T7 | Activity context backend ("What did this workout do for me?") | Reframed for education layer, do after architecture refactor |
| P2-T8 | Activity detail page enhancement | Reframed for education layer, do after architecture refactor |
| P2-D1 | Async weekly plan generation (task/polling pattern) | Deferred — weekly plan paused |
| P2-D2 | Light mode chart colors | Deferred — cosmetic |
| P2-D3 | Dashboard metadata branding | Covered by polish phase L2 |
