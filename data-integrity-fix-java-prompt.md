Project: athlete-iq-agents
Task: Fix Deterministic Data — Risk, Duration, Plan Validation, Obsolete Prompt Rules
Working directory: /Users/lukelanterme/Documents/Code/Personal/Java/Projects/athlete-iq-agents
**Run with:** `java-backend-engineer` sub-agent


## Critical Problem (CONFIRMED BY LOGS)

The Java workout recommendation + plan system invents data. Production logs show:

```
Input:  acuteChronicRatio=0.05, daysSinceRestDay=5 (rest streak), hardSessions7Days=1
Output: riskLevel="HIGH" ← WRONG. Per the rules, should be LOW.
        durationMinutes=30 ← Then thrown away, planner picks 50.
```

Specific bugs:

1. **Duration mismatch:** Recommendation says "TEMPO 30 min" but the workout plan generates 50 min — because the recommendation's duration is THROWN AWAY in `GenerateWorkoutPlanUseCaseImpl` and the planner picks its own duration.
2. **Risk level variance:** LLM returns "HIGH" when rules clearly say "LOW". Multiple clicks give different risk levels because the LLM makes the risk decision, not code.
3. **Interval sum mismatch:** Main Set says 30 min but the interval breakdown adds to 35 min. No validation.
4. **Non-deterministic reasoning:** Same data produces different reasoning text on each call (temperature 0.3).
5. **Obsolete prompt rules:** The system prompt has `daysSinceRestDay > 5 → Recommend REST` — but `daysSinceRestDay` is now a REST STREAK (high value = been resting longer). This rule is BACKWARDS and tells someone who's been resting 5 days to take more rest.

These are critical — they make the system look unreliable. We must move decisions from LLM to code AND fix the obsolete prompt rules.


## What to fix

### Fix 1 — Deterministic risk calculation (code, not LLM)

Create a utility class `src/main/java/com/athleteiq/agents/domain/services/RiskCalculator.java`:

```java
package com.athleteiq.agents.domain.services;

import com.athleteiq.agents.domain.model.RiskLevel;
import com.athleteiq.agents.domain.model.TrainingState;

/**
 * Deterministic risk level calculation based on training state.
 * This logic must NOT live in an LLM prompt — it's a math problem.
 *
 * Note: daysSinceRestDay now represents a REST STREAK (consecutive rest days),
 * so a HIGH value indicates the athlete has been resting, NOT a risk.
 */
public final class RiskCalculator {

    private RiskCalculator() {}

    public static RiskLevel calculate(TrainingState state) {
        Double acr = state.acuteChronicRatio();
        Integer hardSessions = state.hardSessions7Days();

        // HIGH: rapid overload risk
        if (acr != null && acr > 1.5) return RiskLevel.HIGH;

        // MODERATE: elevated ACR OR multiple hard sessions in past week
        if (acr != null && acr > 1.2) return RiskLevel.MODERATE;
        if (hardSessions != null && hardSessions >= 3) return RiskLevel.MODERATE;

        return RiskLevel.LOW;
    }
}
```

Note: The old rule `daysSinceRestDay > 6 → HIGH` is OBSOLETE under rest-streak semantics. Removed entirely.


### Fix 2 — Deterministic duration calculation

Create `src/main/java/com/athleteiq/agents/domain/services/WorkoutDurationCalculator.java`:

```java
package com.athleteiq.agents.domain.services;

import com.athleteiq.agents.domain.model.RecommendationType;

/**
 * Deterministic workout duration based on recommendation type.
 * This must NOT be decided by the LLM.
 */
public final class WorkoutDurationCalculator {

    private WorkoutDurationCalculator() {}

    public static int calculateMinutes(RecommendationType type) {
        return switch (type) {
            case REST -> 0;
            case RECOVERY -> 30;
            case AEROBIC_BASE -> 60;
            case TEMPO -> 45;
            case THRESHOLD -> 50;
            case VO2MAX -> 35;
        };
    }
}
```


### Fix 3 — Use calculators in the recommendation use case

In `GenerateWorkoutRecommendationUseCaseImpl.java`, OVERRIDE the LLM's risk and duration with deterministic values:

```java
@Override
public WorkoutRecommendation execute(int daysBack, String timezone) {
    log.info("Generating workout recommendation with daysBack={}, timezone={}", daysBack, timezone);

    try {
        // Fetch training state first (we need it for deterministic computations)
        TrainingState trainingState = trainingStatePort.getTrainingState(daysBack, timezone);

        // Let the LLM decide the type and provide reasoning
        WorkoutRecommendation llmRec = agent.recommendWithState(serializeTrainingState(trainingState));

        // OVERRIDE the LLM's risk and duration with deterministic values
        RiskLevel correctRisk = RiskCalculator.calculate(trainingState);
        int correctDuration = WorkoutDurationCalculator.calculateMinutes(llmRec.recommendationType());

        log.info("LLM produced: type={}, risk={}, duration={}; CORRECTED: risk={}, duration={}",
                llmRec.recommendationType(), llmRec.riskLevel(), llmRec.durationMinutes(),
                correctRisk, correctDuration);

        return new WorkoutRecommendation(
                llmRec.recommendationType(),  // LLM decides this (with deterministic rules in prompt)
                correctDuration,               // Code decides this
                llmRec.intensityDescription(), // LLM composes this
                llmRec.reasoningSummary(),     // LLM composes this
                correctRisk,                   // Code decides this
                llmRec.confidence()            // LLM decides this
        );
    } catch (Exception e) {
        log.error("Agent failed to produce a recommendation", e);
        throw new AgentExecutionException(
                "Failed to generate workout recommendation: " + e.getMessage(), e
        );
    }
}
```

You'll need to inject `TrainingStatePort` and `ObjectMapper` into this use case (similar to how `GenerateWorkoutPlanUseCaseImpl` does it). Add the `serializeTrainingState` helper method.

Also update the agent interface usage — replace `recommend(daysBack, timezone)` calls with `recommendWithState(json)`. The tool-based `recommend` method becomes unused (can remove or leave for backward compat).


### Fix 4 — Pass duration to the planner (THE BIG ONE)

In `GenerateWorkoutPlanUseCaseImpl.java`, after getting the recommendation from Agent 1, pass its duration as the durationOverride to Agent 2:

Find the existing code:
```java
WorkoutPlan plan = plannerAgent.plan(
        recommendationType,
        trainingStateJson,
        sportDistributionJson,
        performanceMetricsJson,
        sportOverrideStr,
        durationOverrideStr  // ← currently "none" unless user overrode
);
```

Replace with:
```java
// CRITICAL: If user didn't override duration, use the recommendation's deterministic duration
// to keep recommendation and plan consistent.
String effectiveDurationOverride;
if (durationOverride != null) {
    effectiveDurationOverride = String.valueOf(durationOverride);
} else if (recommendation != null) {
    // Use the LLM-corrected (deterministic) duration from the recommendation
    effectiveDurationOverride = String.valueOf(recommendation.durationMinutes());
    log.info("Using recommendation's deterministic duration as plan override: {} minutes", recommendation.durationMinutes());
} else {
    // Recommendation type override path (no Agent 1 call)
    int defaultDuration = WorkoutDurationCalculator.calculateMinutes(
            RecommendationType.valueOf(recommendationType));
    effectiveDurationOverride = String.valueOf(defaultDuration);
    log.info("Using deterministic duration for override path: {} minutes", defaultDuration);
}

WorkoutPlan plan = plannerAgent.plan(
        recommendationType,
        trainingStateJson,
        sportDistributionJson,
        performanceMetricsJson,
        sportOverrideStr,
        effectiveDurationOverride  // ← NEVER "none" anymore
);
```

Note: store the `recommendation` reference earlier so it's accessible in this block. If you're using the override path (no Agent 1), use the deterministic duration calculator directly.


### Fix 5 — Validate plan structure (catch LLM inconsistencies)

Create a validator:

`src/main/java/com/athleteiq/agents/domain/services/WorkoutPlanValidator.java`:

```java
package com.athleteiq.agents.domain.services;

import com.athleteiq.agents.domain.model.WorkoutPlan;
import com.athleteiq.agents.domain.model.WorkoutSegment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

public final class WorkoutPlanValidator {

    private static final Logger log = LoggerFactory.getLogger(WorkoutPlanValidator.class);

    private WorkoutPlanValidator() {}

    /**
     * Validate that the plan is internally consistent.
     * Returns a list of validation errors (empty if valid).
     */
    public static List<String> validate(WorkoutPlan plan, int expectedDuration) {
        List<String> errors = new java.util.ArrayList<>();

        if (plan.workoutStructure() == null || plan.workoutStructure().isEmpty()) {
            // REST may have empty structure — only error if expected duration > 0
            if (expectedDuration > 0) {
                errors.add("Expected duration " + expectedDuration + " min but workoutStructure is empty");
            }
            return errors;
        }

        // 1. Sum of segment durations must equal total
        int segmentSum = plan.workoutStructure().stream()
                .mapToInt(WorkoutSegment::durationMinutes)
                .sum();
        if (segmentSum != plan.durationMinutes()) {
            errors.add(String.format(
                    "Segment durations sum to %d but plan duration is %d",
                    segmentSum, plan.durationMinutes()));
        }

        // 2. Plan duration must match expected (from recommendation)
        if (plan.durationMinutes() != expectedDuration) {
            errors.add(String.format(
                    "Plan duration %d does not match expected %d from recommendation",
                    plan.durationMinutes(), expectedDuration));
        }

        // 3. For each main_set segment, intervals must sum to segment duration
        for (WorkoutSegment seg : plan.workoutStructure()) {
            if (seg.intervals() != null && !seg.intervals().isEmpty()) {
                int intervalSum = seg.intervals().stream()
                        .mapToInt(i -> i.durationMinutes())
                        .sum();
                if (intervalSum != seg.durationMinutes()) {
                    errors.add(String.format(
                            "Segment '%s' duration %d but intervals sum to %d",
                            seg.segment(), seg.durationMinutes(), intervalSum));
                }
            }
        }

        return errors;
    }
}
```

Use it in `GenerateWorkoutPlanUseCaseImpl.execute` after the planner returns:

```java
WorkoutPlan plan = plannerAgent.plan(...);

List<String> errors = WorkoutPlanValidator.validate(plan,
        Integer.parseInt(effectiveDurationOverride));
if (!errors.isEmpty()) {
    log.error("Plan validation failed: {}", errors);
    log.error("Plan: sport={} duration={} segments={}",
            plan.sport(), plan.durationMinutes(),
            plan.workoutStructure().size());
    // For now: log and continue. Future: retry with stricter prompt.
}
```


### Fix 6 — Lower temperature to 0.0 for deterministic agent

In `LangChain4jConfig.java`, the `agentLlm` bean uses `properties.temperature()` (currently 0.3 per the logs). Override it to 0.0:

```java
@Bean
@Qualifier("agentLlm")
public ChatModel agentChatModel(LlmProperties properties) {
    log.info("Configuring Agent LLM model: {} with temperature: 0.0 (deterministic)", properties.modelName());

    return OpenAiChatModel.builder()
            .apiKey(properties.apiKey())
            .modelName(properties.modelName())
            .temperature(0.0)  // ← was properties.temperature(), now hardcoded 0.0
            .logRequests(properties.logRequests())
            .logResponses(properties.logResponses())
            .build();
}
```

Leave `chatLlm` at temperature 0.7 — conversational chat benefits from variety.


### Fix 7 — Update the recommendation prompt: remove obsolete + redundant rules

In `WorkoutRecommendationAgent.java`, fix TWO problems in the system prompts (both `recommend` and `recommendWithState` methods):

**Problem A: Obsolete `daysSinceRestDay > 5` rule (BACKWARDS under new semantics)**

The current "Training Load Logic" says:
```
If acuteChronicRatio > 1.5 OR daysSinceRestDay > 5 → Recommend REST or RECOVERY
```

This is wrong. `daysSinceRestDay` is now a REST STREAK — high value means the athlete HAS BEEN resting. Recommending more rest is the opposite of what they need.

**Problem B: Risk Level / Confidence rules are now in code**

Since `RiskCalculator` and `WorkoutDurationCalculator` handle these deterministically, the LLM doesn't need rules for them.

**Solution:** Replace the entire "DECISION GUIDELINES" section in BOTH `@SystemMessage` blocks (the one for `recommend` and the one for `recommendWithState`).

Find:
```
========================
DECISION GUIDELINES
========================

Training Load Logic:
- If acuteChronicRatio > 1.5 OR daysSinceRestDay > 5 → Recommend REST or RECOVERY
- If acuteChronicRatio > 1.3 → Recommend RECOVERY (low intensity)
- If hardSessions7Days >= 3 → Recommend AEROBIC_BASE or RECOVERY
- If acuteChronicRatio < 0.8 AND daysSinceHardSession > 3 → Recommend TEMPO or THRESHOLD
- If acuteChronicRatio is between 0.8 and 1.3 AND zone distribution is balanced → Recommend AEROBIC_BASE

Risk Level Logic:
- HIGH → acuteChronicRatio > 1.5 OR daysSinceRestDay > 6
- MODERATE → acuteChronicRatio > 1.2 OR hardSessions7Days >= 3
- LOW → otherwise

Confidence:
- 0.9–1.0 → strong, clear physiological signals
- 0.6–0.8 → moderate clarity
- 0.0–0.5 → ambiguous signals
```

Replace with:
```
========================
DECISION GUIDELINES
========================

Note on metric semantics:
- daysSinceRestDay is a REST STREAK (consecutive rest days ending today).
  Value 0 = trained today. Value 5 = has been resting for 5 consecutive days.
  A HIGH value means the athlete has been resting, NOT that they need more rest.
- daysSinceHardSession is calendar days since the last hard session.

Recommendation Type Logic:
- If acuteChronicRatio > 1.5 → Recommend RECOVERY (rapid overload risk)
- If acuteChronicRatio > 1.3 → Recommend RECOVERY (high accumulated load)
- If hardSessions7Days >= 3 AND acuteChronicRatio > 1.0 → Recommend AEROBIC_BASE or RECOVERY (fatigue building)
- If daysSinceRestDay >= 3 AND acuteChronicRatio < 0.5 → Recommend AEROBIC_BASE or TEMPO (returning from rest, ease back in)
- If acuteChronicRatio < 0.8 AND daysSinceHardSession > 3 → Recommend TEMPO or THRESHOLD (well-recovered, ready for stimulus)
- If acuteChronicRatio between 0.8 and 1.3 AND zone distribution is balanced → Recommend AEROBIC_BASE (steady progression)

Note: Risk level, duration, and confidence are computed deterministically in code AFTER your response.
You may set placeholder values (e.g., riskLevel: LOW, durationMinutes: 0, confidence: 1.0) — they will be overridden.
Focus on producing an accurate recommendationType, intensityDescription, and reasoningSummary.
```

This fixes BOTH the obsolete rule AND removes the redundant LLM decisions.

Apply to BOTH `@SystemMessage` blocks in the file (the one used by `recommend()` and the one used by `recommendWithState()`).


## Do NOT

- Do not modify the planner agent's prompt — Fix 4 (passing duration override) makes the planner respect the duration without prompt changes
- Do not change the front-end
- Do not modify the database
- Do not change any existing endpoints or DTOs
- Do not modify the chat, insights, or activity-analysis services
- Do not delete the tool-based `recommend()` method (just stop using it from the use case — keep for backward compat)


## Testing

```bash
./gradlew build

# Test 1: Run the recommendation 3 times — should produce IDENTICAL outputs (temperature 0.0)
for i in 1 2 3; do
  echo "=== Run $i ==="
  curl -s -X POST http://localhost:8085/api/v1/recommendations/daily \
    -H "Content-Type: application/json" \
    -H "X-API-Key: dev-api-key-change-in-production" \
    -d '{"daysBack": 14, "timezone": "Africa/Johannesburg"}' \
    | python3 -c "
import sys,json
d = json.load(sys.stdin)
print(f'type={d.get(\"recommendationType\",\"?\")} duration={d.get(\"durationMinutes\",\"?\")} risk={d.get(\"riskLevel\",\"?\")} confidence={d.get(\"confidence\",\"?\")}')
"
done

# Test 2: With the exact data from the logs (ACR=0.05, restStreak=5, hardSessions=1)
# Expected: risk=LOW (not HIGH like before), type=TEMPO (LLM decides), duration=45 (TEMPO default)

# Test 3: Generate a workout plan — duration MUST match the recommendation's duration
curl -s -X POST http://localhost:8085/api/v1/workout-plans/daily \
  -H "Content-Type: application/json" \
  -H "X-API-Key: dev-api-key-change-in-production" \
  -d '{"daysBack": 14, "timezone": "Africa/Johannesburg"}' \
  | python3 -c "
import sys,json
d = json.load(sys.stdin)
print(f'Plan: sport={d.get(\"sport\")} type={d.get(\"recommendationType\")} duration={d.get(\"durationMinutes\")} min')
print('Segments:')
total = 0
for seg in d.get('workoutStructure', []):
    print(f'  {seg[\"segment\"]}: {seg[\"durationMinutes\"]} min')
    total += seg['durationMinutes']
    interval_sum = 0
    for iv in seg.get('intervals', []):
        print(f'    - {iv[\"description\"]}: {iv[\"durationMinutes\"]} min')
        interval_sum += iv['durationMinutes']
    if seg.get('intervals'):
        print(f'    Interval sum: {interval_sum} (segment: {seg[\"durationMinutes\"]}) — {\"OK\" if interval_sum == seg[\"durationMinutes\"] else \"MISMATCH\"}')
print(f'Sum of segments: {total} min')
print(f'Matches plan duration: {total == d.get(\"durationMinutes\")}')
"
```

**Expected results:**
- All 3 recommendation runs produce IDENTICAL output (same type, duration, risk, confidence)
- For the test athlete (ACR=0.05, hardSessions=1, restStreak=5): `risk=LOW` (not HIGH)
- Recommendation `durationMinutes` matches type: TEMPO=45, THRESHOLD=50, RECOVERY=30, etc.
- Plan `durationMinutes` equals recommendation's `durationMinutes`
- Sum of segment durations equals plan duration
- For each main_set segment, sum of intervals equals segment duration (validator logs error if not)
- LLM no longer tells someone with a 5-day rest streak to take MORE rest


## Why this works

We move 3 decisions from LLM to code:
1. **Risk level** — pure math from ACR + hard sessions (rest streak removed as obsolete)
2. **Duration** — deterministic per workout type
3. **Plan ↔ Recommendation duration link** — explicit pass-through

We KEEP in LLM:
1. **Recommendation type selection** (TEMPO vs THRESHOLD vs AEROBIC_BASE) — pattern matching with corrected rules
2. **Intensity description** — natural language
3. **Reasoning summary** — natural language
4. **Workout structure** (warmup/main_set/cooldown breakdown) — composition is the LLM's strength
5. **Interval breakdown** — varied patterns benefit from LLM creativity

With temperature 0.0, even the LLM-driven decisions become deterministic for identical inputs. With validation, we catch the rare cases where the LLM still produces inconsistent structure.
