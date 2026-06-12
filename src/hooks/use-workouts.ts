import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { workoutsApi } from '@/lib/workouts-api';
import { RecommendationRequest, WorkoutPlanRequest, WeeklyPlanRequest } from '@/types';

export const useTrainingTrends = (params?: { days?: number; timezone?: string }) => {
  return useQuery({
    queryKey: ['trends', params],
    queryFn: async () => {
      const response = await workoutsApi.getTrainingTrends(params);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to fetch trends');
    },
    staleTime: 1000 * 60 * 10,
  });
};

export const useWorkouts = () => {
  const queryClient = useQueryClient();

  const useTrainingMetrics = (params?: { daysBack?: number; timezone?: string }) => {
    return useQuery({
      queryKey: ['workouts', 'metrics', params],
      queryFn: async () => {
        const response = await workoutsApi.getTrainingMetrics(params);
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.error?.message || 'Failed to fetch training metrics');
      },
      staleTime: 1000 * 60 * 5,
    });
  };

  const recommendationMutation = useMutation({
    mutationFn: async (request?: RecommendationRequest) => {
      const response = await workoutsApi.getRecommendation(request);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to generate recommendation');
    },
  });

  const workoutPlanMutation = useMutation({
    mutationFn: async (request?: WorkoutPlanRequest) => {
      const response = await workoutsApi.getWorkoutPlan(request);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to generate workout plan');
    },
  });

  const weeklyPlanMutation = useMutation({
    mutationFn: async (request?: WeeklyPlanRequest) => {
      const response = await workoutsApi.getWeeklyPlan(request);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to generate weekly plan');
    },
  });

  // Suppress unused variable warning — queryClient is kept for future cache invalidation
  void queryClient;

  return {
    useTrainingMetrics,

    generateRecommendation: recommendationMutation.mutate,
    generateRecommendationAsync: recommendationMutation.mutateAsync,
    generateWorkoutPlan: workoutPlanMutation.mutate,
    generateWorkoutPlanAsync: workoutPlanMutation.mutateAsync,

    recommendation: recommendationMutation.data,
    isGeneratingRecommendation: recommendationMutation.isPending,
    recommendationError: recommendationMutation.error,
    resetRecommendation: recommendationMutation.reset,

    workoutPlan: workoutPlanMutation.data,
    isGeneratingPlan: workoutPlanMutation.isPending,
    planError: workoutPlanMutation.error,
    resetPlan: workoutPlanMutation.reset,

    generateWeeklyPlan: weeklyPlanMutation.mutate,
    generateWeeklyPlanAsync: weeklyPlanMutation.mutateAsync,
    weeklyPlan: weeklyPlanMutation.data,
    isGeneratingWeeklyPlan: weeklyPlanMutation.isPending,
    weeklyPlanError: weeklyPlanMutation.error,
    resetWeeklyPlan: weeklyPlanMutation.reset,
  };
};
