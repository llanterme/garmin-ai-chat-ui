# Athlete IQ — Phase 3 Task Breakdown

## Overview

Phase 3 transforms Athlete IQ from a reactive training tool ("what should I do today?") into a goal-oriented training system ("prepare me for my half marathon in 12 weeks"). This requires capturing the athlete's goals, constraints, and preferences, then using them to inform all downstream planning.

**Prerequisite:** Phase 2 complete (P2-T4 weekly plan agent must exist before Phase 3 can make it goal-aware).


## Athlete Goals & Preferences Model

### Data to capture

**Goal Event (primary training target):**
- Event type: 5K, 10K, half marathon, marathon, Olympic triathlon, half Ironman, Ironman, century ride, sportive, general fitness
- Target date: when the event is
- Target finish time or pace (optional): "sub-2hr half marathon", "4:30/km 10K"
- Priority: A-race (peak for this), B-race (perform well but don't taper fully), training race

**Availability & Constraints:**
- Training days per week: 3, 4, 5, 6, 7
- Max hours per week: total weekly training volume cap
- Max session duration: longest single session they can do (important for long runs/rides)
- Long session day preference: "Saturday", "Sunday" — anchors the weekly plan
- Rest day preference: specific day(s) they want off (e.g., "Friday")

**Sport Preferences:**
- Priority sport: running, cycling, or balanced (for multi-sport)
- Secondary sport: optional cross-training preference
- Available equipment: smart trainer, treadmill, gym, outdoor only, pool access

**Health & Constraints:**
- Current injuries or limitations: free text (e.g., "recovering from shin splints, limit running to 4x/week")
- Medical considerations: free text (optional)

**Training Philosophy:**
- Preferred training approach: polarized (mostly easy + some hard), threshold-heavy, mixed
- Race experience level: beginner (first event), intermediate (done a few), advanced (regular racer)


## Task Map

```
P3-T1  Goals DB Schema + API (garmin-adapter)
  │
  ├──→ P3-T2  Goals Onboarding UI (frontend)
  │
  ├──→ P3-T3  Inject Goals into Weekly Scheduler Agent (athlete-iq-agents)
  │     └──→ P3-T4  Inject Goals into Daily Planner Agent (athlete-iq-agents)
  │
  └──→ P3-T5  Inject Goals into Chat Context (garmin-adapter)

P3-T6  Training Phase Detection (garmin-adapter)
  └──→ P3-T7  Phase-Aware Dashboard + UI Enhancements (frontend)
```


## P3-T1 — Goals Database Schema + API
**Agent:** python-backend-engineer
**Goal:** Store athlete goals and preferences with API endpoints for CRUD.
**Scope:**
- Alembic migration: new `training_goals` table linked to `users.id`
  - Fields: event_type, event_date, target_time, priority, training_days_per_week, max_hours_per_week, max_session_minutes, long_session_day, rest_day_preference, priority_sport, secondary_sport, equipment (JSON array), injuries_notes, training_approach, experience_level
  - One active goal per user (with is_active flag for goal history)
- SQLAlchemy model: `TrainingGoal`
- Pydantic schemas: `TrainingGoalCreate`, `TrainingGoalUpdate`, `TrainingGoalResponse`
- API endpoints:
  - `GET /api/v1/auth/goals` — get active goal
  - `PUT /api/v1/auth/goals` — create or update active goal (partial update supported)
  - `DELETE /api/v1/auth/goals` — deactivate current goal
  - `GET /api/v1/auth/goals/history` — list all past goals
- Auth required on all endpoints
**Exit Criteria:**
- [ ] Migration runs cleanly
- [ ] CRUD endpoints work (curl tests)
- [ ] Partial updates preserve existing fields
- [ ] 150+ tests pass


## P3-T2 — Goals Onboarding UI
**Agent:** modern-frontend-engineer
**Goal:** A guided goal-setting flow in the UI, accessible from the dashboard and as a first-time onboarding step.
**Scope:**
- New page: `/goals` (or `/settings/goals`)
- Multi-step form flow (not a single long form):
  - Step 1: "What are you training for?" — event type selector with icons (5K, 10K, half marathon, etc.)
  - Step 2: "When is your event?" — date picker + optional target time input
  - Step 3: "How much can you train?" — days per week slider (3-7), max hours input, long day preference
  - Step 4: "Anything else?" — injuries/limitations text area, equipment checkboxes, experience level
- Dashboard integration: if no goal is set, show a "Set your training goal" CTA card. If a goal is set, show a compact goal summary card with countdown ("Half Marathon in 47 days")
- Goal summary visible on the workouts page header (replaces or augments the current training snapshot subtitle)
- Types + API client + hook following established patterns
**Exit Criteria:**
- [ ] Goal setting flow works end-to-end
- [ ] Dashboard shows goal card or CTA
- [ ] Workouts page shows goal context
- [ ] npm run build succeeds


## P3-T3 — Inject Goals into Weekly Scheduler Agent
**Agent:** java-backend-engineer
**Goal:** The weekly scheduler considers the athlete's goal, availability, and constraints when planning.
**Scope:**
- New endpoint or parameter on `GET /api/v1/training-metrics` that includes the user's active goal (fetched via garmin-adapter proxy)
- Or: new garmin-adapter proxy endpoint `GET /api/v1/workouts/goals` → garmin-adapter `GET /api/v1/auth/goals`
- WeeklySchedulerAgent prompt updated to include:
  - Event type + date + target → determines training phase (base, build, peak, taper)
  - Days per week → hard limit on non-rest days
  - Max hours → constrains total weekly volume
  - Rest day preference → anchors rest day placement
  - Long session day → places the longest workout on that day
  - Priority sport → biases sport selection
  - Injuries → excludes certain workout types or limits frequency
- Training phase logic added to prompt:
  - > 12 weeks out: base phase (mostly aerobic + some tempo)
  - 8-12 weeks out: build phase (add threshold + VO2max)
  - 4-8 weeks out: peak phase (race-specific intensity)
  - 2-4 weeks out: taper (reduce volume, maintain intensity)
  - < 2 weeks out: race week (very light + rest)
**Exit Criteria:**
- [ ] Weekly plan respects days-per-week limit
- [ ] Rest day placed on preferred day
- [ ] Long session placed on preferred day
- [ ] Training phase reflected in workout type distribution
- [ ] ./gradlew build succeeds


## P3-T4 — Inject Goals into Daily Planner Agent
**Agent:** java-backend-engineer
**Goal:** The daily planner considers goal context for duration and intensity targeting.
**Scope:**
- SportAndWorkoutPlannerAgent prompt updated to include:
  - Target race pace/time → workout targets can reference "race pace" as a specific zone
  - Training phase → affects workout structure (e.g., taper workouts are shorter, less volume)
  - Max session duration → hard cap on workout length
  - Experience level → beginner gets more conservative intensity, longer warmups
**Exit Criteria:**
- [ ] Workout duration respects max session constraint
- [ ] Race pace referenced in appropriate workouts (tempo, threshold)
- [ ] Taper phase produces shorter, easier workouts
- [ ] ./gradlew build succeeds


## P3-T5 — Inject Goals into Chat Context
**Agent:** python-backend-engineer
**Goal:** The chat can answer goal-related questions: "Am I on track for my half marathon?", "How many weeks until my race?"
**Scope:**
- Fetch active goal alongside training metrics in conversation.py
- Add goal context to the LLM's injected context (same pattern as T8 metrics injection)
- Update system prompt to mention goal awareness
**Exit Criteria:**
- [ ] Chat answers "When is my race?" with the correct date
- [ ] Chat answers "Am I on track?" with analysis based on current metrics vs target
- [ ] Chat answers "How should I adjust my training?" considering the goal phase
- [ ] 150+ tests pass


## P3-T6 — Training Phase Detection
**Agent:** python-backend-engineer
**Goal:** Automatically compute the current training phase based on the goal's event date and add it to the training metrics response.
**Scope:**
- New field on the agent view response: `trainingPhase` ("base", "build", "peak", "taper", "race_week", "recovery", "general")
- Computed from: event_date - today = weeks_out → phase mapping
- Also compute: `weeksToEvent`, `daysToEvent` for UI display
- If no goal is set: `trainingPhase = "general"` (no phase-specific planning)
- Add to the `/api/v1/workouts/metrics` response and the chat context
**Exit Criteria:**
- [ ] trainingPhase field appears in metrics response
- [ ] Phase changes appropriately as the event date approaches
- [ ] "general" returned when no goal is set
- [ ] 150+ tests pass


## P3-T7 — Phase-Aware Dashboard + UI Enhancements
**Agent:** modern-frontend-engineer
**Goal:** The UI reflects the athlete's training phase and goal countdown.
**Scope:**
- Dashboard goal card: event name, countdown ("47 days to Half Marathon"), phase badge ("Build Phase"), progress ring or bar
- Workouts page: phase context in the training snapshot ("Build Phase — Week 6 of 12")
- Trends page: annotate the charts with phase boundaries (vertical lines at phase transitions)
- Weekly plan: phase-aware labels ("Taper Week — reduced volume")
**Exit Criteria:**
- [ ] Goal countdown visible on dashboard
- [ ] Phase badge visible on dashboard and workouts page
- [ ] Trends charts show phase annotations
- [ ] npm run build succeeds
