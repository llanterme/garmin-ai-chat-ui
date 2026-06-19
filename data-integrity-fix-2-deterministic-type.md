Project: athlete-iq-agents
Task: Make Recommendation Type Deterministic (Code, Not LLM)
Working directory: /Users/lukelanterme/Documents/Code/Personal/Java/Projects/athlete-iq-agents
**Run with:** `java-backend-engineer` sub-agent


## Critical Problem (CONFIRMED BY LOGS)

Even after the previous data integrity fix (temperature 0.0, deterministic risk and duration), the recommendation TYPE is still varying between identical calls:

**Same input data (ACR=0.05, daysSinceRestDay=5, hardSessions7Days=1) produced:**
- Call 1 (13:42:25 — `/recommendations/daily`): **TEMPO**
- Call 2 (13:42:29 — `/workout-plans/daily` internal Agent 1): **TEMPO** ✓
- Call 3 (13:42:46 — `/workout-plans/daily` internal Agent 1): **AEROBIC_BASE** ✗

The user sees the recommendation card showing TEMPO 45min, but the plan below shows AEROBIC_BASE 60min — directly contradicting each other on the same screen.

**Why temp=0.0 isn't enough:** OpenAI's "temperature 0" with GPT-4o-mini still has small variance due to MoE routing. For decisions with overlapping rules, this variance flips the answer.

**Why the rules overlap:** For ACR=0.05, restStreak=5, both rules apply:
- `daysSinceRestDay >= 3 AND acr < 0.5` → AEROBIC_BASE or TEMPO
- `acr < 0.8 AND daysSinceHardSession > 3` → TEMPO or THRESHOLD

The "or" leaves the LLM to pick. With variance, the pick flips.


## Fix: Move type selection to code

Type selection is the LAST decision the LLM is making for the recommendation. Move it to code like we did with risk and duration. The LLM keeps only its strength: writing natural-language intensity description and reasoning summary.


### Fix 1 — Create `RecommendationTypeCalculator.java`

Create `src/main/java/com/athleteiq/agents/domain/services/RecommendationTypeCalculator.java`:

```java
package com.athleteiq.agents.domain.services;

import com.athleteiq.agents.domain.model.RecommendationType;
import com.athleteiq.agents.domain.model.TrainingState;

/**
 * Deterministic recommendation type selection based on training state.
 * This logic must NOT live in an LLM prompt — overlapping rules and LLM variance
 * cause inconsistent recommendations for identical input data.
 *
 * Rules are evaluated in priority order — the first matching rule wins.
 * Each athlete state maps to exactly one recommendation type.
 */
public final class RecommendationTypeCalculator {

    private RecommendationTypeCalculator() {}

    public static RecommendationType calculate(TrainingState state) {
        Double acr = state.acuteChronicRatio();
        Integer hardSessions = state.hardSessions7Days();
        Integer daysSinceRest = state.daysSinceRestDay();
        Integer daysSinceHard = state.daysSinceHardSession();

        // Default safe values when metrics are missing
        double acrVal = acr != null ? acr : 1.0;
        int hardVal = hardSessions != null ? hardSessions : 0;
        int restStreakVal = daysSinceRest != null ? daysSinceRest : 0;
        int sinceHardVal = daysSinceHard != null ? daysSinceHard : 0;

        // PRIORITY 1: Overload — recover
        if (acrVal > 1.5) return RecommendationType.RECOVERY;
        if (acrVal > 1.3) return RecommendationType.RECOVERY;

        // PRIORITY 2: Accumulated fatigue — go aerobic
        if (hardVal >= 3 && acrVal > 1.0) return RecommendationType.AEROBIC_BASE;

        // PRIORITY 3: Returning from extended rest — start easy
        // (rest streak 3+ with very low ACR signals time off, illness, or detraining)
        if (restStreakVal >= 3 && acrVal < 0.5) return RecommendationType.AEROBIC_BASE;

        // PRIORITY 4: Well-recovered, regular cadence — tempo stimulus
        // (low ACR but no significant rest streak; just well-recovered between sessions)
        if (acrVal < 0.8 && sinceHardVal > 3) return RecommendationType.TEMPO;

        // PRIORITY 5: Balanced loading — keep building base
        if (acrVal >= 0.8 && acrVal <= 1.3) return RecommendationType.AEROBIC_BASE;

        // DEFAULT: aerobic base is always safe
        return RecommendationType.AEROBIC_BASE;
    }
}
```

The priority order resolves the ambiguity: when someone has been resting AND has low ACR (Luke's case: ACR=0.05, restStreak=5), they get AEROBIC_BASE — the safer "ease back in" choice — every single time.


### Fix 2 — Use it in `GenerateWorkoutRecommendationUseCaseImpl`

In `src/main/java/com/athleteiq/agents/application/usecases/GenerateWorkoutRecommendationUseCaseImpl.java`, OVERRIDE the LLM's type with the deterministic value:

Add the import:
```java
import com.athleteiq.agents.domain.services.RecommendationTypeCalculator;
```

In `execute()`, after fetching training state and before/after the LLM call, override the type. Replace the existing override block with:

```java
// Compute the deterministic recommendation type from the training state.
// The LLM is told to focus on description and reasoning — type comes from code.
RecommendationType correctType = RecommendationTypeCalculator.calculate(trainingState);

// Call the LLM for intensity description + reasoning. We still pass the
// training state as context so the LLM can write meaningful text.
WorkoutRecommendation llmRec = agent.recommendWithState(serializeTrainingState(trainingState));

// Compute deterministic risk and duration based on the CORRECTED type
RiskLevel correctRisk = RiskCalculator.calculate(trainingState);
int correctDuration = WorkoutDurationCalculator.calculateMinutes(correctType);

log.info("LLM produced: type={}, risk={}, duration={}; CORRECTED: type={}, risk={}, duration={}",
        llmRec.recommendationType(), llmRec.riskLevel(), llmRec.durationMinutes(),
        correctType, correctRisk, correctDuration);

return new WorkoutRecommendation(
        correctType,                   // Code decides this (was LLM)
        correctDuration,               // Code decides this
        llmRec.intensityDescription(), // LLM composes this
        llmRec.reasoningSummary(),     // LLM composes this
        correctRisk,                   // Code decides this
        llmRec.confidence()            // LLM decides this (placeholder; harmless)
);
```


### Fix 3 — Use it in `GenerateWorkoutPlanUseCaseImpl`

In `src/main/java/com/athleteiq/agents/application/usecases/GenerateWorkoutPlanUseCaseImpl.java`, compute the type deterministically BEFORE deciding whether to call Agent 1.

Add the import:
```java
import com.athleteiq.agents.domain.services.RecommendationTypeCalculator;
```

Refactor the recommendation-type resolution. Replace the existing block:

```java
String recommendationType;

if (recommendationTypeOverride != null && !recommendationTypeOverride.isBlank()) {
    // Override provided — skip Agent 1
    ...
} else {
    // No override — use Agent 1 with pre-fetched state (no tool call)
    WorkoutRecommendation recommendation = recommendationAgent.recommendWithState(trainingStateJson);
    recommendationType = recommendation.recommendationType().name();
    ...
}
```

With:

```java
RecommendationType resolvedType;

if (recommendationTypeOverride != null && !recommendationTypeOverride.isBlank()) {
    // User explicitly chose a type — honor it
    log.info("Recommendation type override provided: {} — skipping Agent 1", recommendationTypeOverride);
    try {
        resolvedType = RecommendationType.valueOf(recommendationTypeOverride.toUpperCase());
    } catch (IllegalArgumentException e) {
        String accepted = Arrays.stream(RecommendationType.values())
                .map(v -> v.name().toLowerCase())
                .collect(Collectors.joining(", "));
        throw new IllegalArgumentException(
                "Invalid recommendation type override: '" + recommendationTypeOverride
                        + "'. Accepted values: " + accepted);
    }
} else {
    // Compute deterministically — DO NOT call Agent 1 to avoid type variance
    resolvedType = RecommendationTypeCalculator.calculate(trainingState);
    log.info("Computed deterministic recommendation type: {}", resolvedType);
}

if (resolvedType == RecommendationType.REST) {
    log.info("Type is REST — skipping Agent 2, returning rest plan");
    return buildRestPlan();
}

String recommendationType = resolvedType.name();
int deterministicDuration = WorkoutDurationCalculator.calculateMinutes(resolvedType);
```

Then when computing `effectiveDurationOverride`, simplify it:

```java
String effectiveDurationOverride;
if (durationOverride != null) {
    effectiveDurationOverride = String.valueOf(durationOverride);
} else {
    effectiveDurationOverride = String.valueOf(deterministicDuration);
    log.info("Using deterministic duration: {} minutes for type {}", deterministicDuration, resolvedType);
}
```

This means the plan endpoint NO LONGER calls Agent 1 at all (unless we want reasoning text for it, which we don't — the plan card doesn't show reasoning). Same data → same type → same plan, every time.


### Fix 4 — Simplify the agent's prompt

In `src/main/java/com/athleteiq/agents/application/agents/WorkoutRecommendationAgent.java`, update BOTH `@SystemMessage` blocks (the one for `recommend` and the one for `recommendWithState`).

Find the DECISION GUIDELINES section and replace with:

```
========================
DECISION GUIDELINES
========================

Note on metric semantics:
- daysSinceRestDay is a REST STREAK (consecutive rest days ending today).
  Value 0 = trained today. Value 5 = has been resting for 5 consecutive days.
  A HIGH value means the athlete has been resting, NOT that they need more rest.
- daysSinceHardSession is calendar days since the last hard session.

Recommendation Type Reference (for context — your output is OVERRIDDEN by code):
- REST: extreme overload (ACR > 1.8)
- RECOVERY: high accumulated load (ACR > 1.3)
- AEROBIC_BASE: balanced loading, returning from extended rest, or accumulated fatigue
- TEMPO: well-recovered, ready for moderate stimulus
- THRESHOLD: well-prepared, building lactate clearance
- VO2MAX: peak phase, high-intensity intervals

IMPORTANT: Your recommendationType, riskLevel, durationMinutes, and confidence values
will all be OVERRIDDEN by deterministic code computations after your response.
You may set placeholder values for these fields.

Your real task is to produce an excellent intensityDescription and reasoningSummary
that reflects the training state. Reference the athlete's:
- ACR value and what it indicates about their load balance
- Rest streak / days since last hard session
- Zone distribution if relevant
- Sport balance from sportDistribution7Days

The reasoning summary should be 1-2 sentences, data-driven, and connect specific
metrics to the suggested intensity range.
```

This tells the LLM clearly that its type/risk/duration choices are throwaway — its real job is good reasoning text.


## Do NOT

- Do not modify the planner agent (Agent 2) — it already accepts type and duration as inputs
- Do not change the front-end (a separate prompt handles the UX side)
- Do not change DTOs or controllers
- Do not change the chat, insights, or activity-analysis services
- Do not delete the existing agent methods — they still work, we just override their outputs


## Testing

```bash
./gradlew build

# Test 1: Run recommendation 5 times — MUST produce identical type every time
for i in 1 2 3 4 5; do
  curl -s -X POST http://localhost:8085/api/v1/recommendations/daily \
    -H "Content-Type: application/json" \
    -H "X-API-Key: dev-api-key-change-in-production" \
    -d '{"daysBack": 14, "timezone": "Africa/Johannesburg"}' \
    | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'Run $i: type={d[\"recommendationType\"]} duration={d[\"durationMinutes\"]} risk={d[\"riskLevel\"]}')"
done

# Test 2: Run plan 5 times — MUST produce identical type and duration every time
for i in 1 2 3 4 5; do
  curl -s -X POST http://localhost:8085/api/v1/workout-plans/daily \
    -H "Content-Type: application/json" \
    -H "X-API-Key: dev-api-key-change-in-production" \
    -d '{"daysBack": 14, "timezone": "Africa/Johannesburg"}' \
    | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'Run $i: sport={d[\"sport\"]} type={d[\"recommendationType\"]} duration={d[\"durationMinutes\"]}')"
done

# Test 3: Recommendation and plan MUST agree
REC=$(curl -s -X POST http://localhost:8085/api/v1/recommendations/daily \
  -H "Content-Type: application/json" -H "X-API-Key: dev-api-key-change-in-production" \
  -d '{"daysBack": 14, "timezone": "Africa/Johannesburg"}')
PLAN=$(curl -s -X POST http://localhost:8085/api/v1/workout-plans/daily \
  -H "Content-Type: application/json" -H "X-API-Key: dev-api-key-change-in-production" \
  -d '{"daysBack": 14, "timezone": "Africa/Johannesburg"}')
echo "Recommendation: $(echo $REC | python3 -c 'import sys,json; d=json.load(sys.stdin); print(f\"type={d[\"recommendationType\"]} duration={d[\"durationMinutes\"]}\")')"
echo "Plan:           $(echo $PLAN | python3 -c 'import sys,json; d=json.load(sys.stdin); print(f\"type={d[\"recommendationType\"]} duration={d[\"durationMinutes\"]}\")')"
```

**Expected results:**
- Test 1: All 5 recommendation runs produce IDENTICAL `type`, `duration`, `risk` (intensity description / reasoning may vary slightly in wording — that's OK, it's natural language)
- Test 2: All 5 plan runs produce IDENTICAL `type` and `duration`
- Test 3: Recommendation type == Plan type AND Recommendation duration == Plan duration
- For test athlete (ACR=0.05, restStreak=5, hardSessions=1): type = **AEROBIC_BASE**, duration = **60min**

## Why AEROBIC_BASE, not TEMPO?

Both rules apply to this state, but the calculator's priority order picks AEROBIC_BASE because:
1. The athlete has been resting for 5 consecutive days (illness, life events, deliberate break)
2. Their ACR has collapsed to 0.05 — extreme detraining indicator
3. Going straight to TEMPO after extended rest risks injury and overload
4. AEROBIC_BASE eases them back in safely — sports-science best practice for return-to-training

The previous "ambiguous rule" issue is now resolved by clear priority: returning-from-rest beats well-recovered-stimulus.
