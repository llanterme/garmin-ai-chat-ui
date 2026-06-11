'use client';

import { useWorkouts } from '@/hooks/use-workouts';
import { TrainingSnapshot } from '@/components/workouts/training-snapshot';
import { RecommendationCard } from '@/components/workouts/recommendation-card';
import { WorkoutPlanCard } from '@/components/workouts/workout-plan-card';
import { WorkoutControls } from '@/components/workouts/workout-controls';
import { WorkoutPlanRequest } from '@/types';

export default function WorkoutsPage() {
  const {
    useTrainingMetrics,
    generateRecommendationAsync,
    generateWorkoutPlanAsync,
    recommendation,
    isGeneratingRecommendation,
    recommendationError,
    workoutPlan,
    isGeneratingPlan,
    planError,
  } = useWorkouts();

  const { data: metrics } = useTrainingMetrics();

  const subtitle = metrics
    ? `ACR ${metrics.acuteChronicRatio.toFixed(2)} · ${metrics.hardSessions7Days} hard session${metrics.hardSessions7Days !== 1 ? 's' : ''} this week · ${Math.round(metrics.totalLoad7Days)} load`
    : undefined;

  const handleGenerateRecommendation = async (request?: WorkoutPlanRequest) => {
    try {
      await generateRecommendationAsync(request);
    } catch {
      // error surfaced via recommendationError
    }
  };

  const handleGenerateWorkoutPlan = async (request?: WorkoutPlanRequest) => {
    try {
      await generateWorkoutPlanAsync(request);
    } catch {
      // error surfaced via planError
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold font-display tracking-tight text-foreground">Today&apos;s Training</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>

      {/* Training snapshot */}
      <TrainingSnapshot />

      {/* Controls */}
      <WorkoutControls
        onGenerateRecommendation={handleGenerateRecommendation}
        onGenerateWorkoutPlan={handleGenerateWorkoutPlan}
        isGeneratingRecommendation={isGeneratingRecommendation}
        isGeneratingPlan={isGeneratingPlan}
        hasRecommendation={!!recommendation}
      />

      {/* Errors */}
      {recommendationError && (
        <p className="text-sm text-muted-foreground">
          {recommendationError.message.includes('502') || recommendationError.message.includes('503')
            ? 'Workout service unavailable — make sure garmin-adapter is running.'
            : `Could not generate recommendation: ${recommendationError.message}`}
        </p>
      )}
      {planError && (
        <p className="text-sm text-muted-foreground">
          {planError.message.includes('502') || planError.message.includes('503')
            ? 'Workout service unavailable — make sure garmin-adapter is running.'
            : `Could not generate workout plan: ${planError.message}`}
        </p>
      )}

      {/* Recommendation */}
      {recommendation && <RecommendationCard recommendation={recommendation} />}

      {/* Workout plan */}
      {workoutPlan && <WorkoutPlanCard plan={workoutPlan} />}
    </div>
  );
}
