import { apiClient, apiCall } from './api';
import {
  WorkoutRecommendation,
  WorkoutPlan,
  TrainingMetrics,
  RecommendationRequest,
  WorkoutPlanRequest,
  ApiResponse,
} from '@/types';

export const workoutsApi = {
  async getTrainingMetrics(params?: {
    daysBack?: number;
    timezone?: string;
  }): Promise<ApiResponse<TrainingMetrics>> {
    const queryParams: Record<string, unknown> = {};
    if (params?.daysBack) queryParams.days_back = params.daysBack;
    if (params?.timezone) queryParams.timezone = params.timezone;

    return apiCall(
      apiClient.get<TrainingMetrics>('/workouts/metrics', { params: queryParams })
    );
  },

  async getRecommendation(
    request?: RecommendationRequest
  ): Promise<ApiResponse<WorkoutRecommendation>> {
    return apiCall(
      apiClient.post<WorkoutRecommendation>('/workouts/recommendation', {
        daysBack: request?.daysBack ?? 14,
        timezone: request?.timezone ?? 'Africa/Johannesburg',
      })
    );
  },

  async getWorkoutPlan(
    request?: WorkoutPlanRequest
  ): Promise<ApiResponse<WorkoutPlan>> {
    const payload: Record<string, unknown> = {
      daysBack: request?.daysBack ?? 14,
      timezone: request?.timezone ?? 'Africa/Johannesburg',
    };
    if (request?.sportOverride) payload.sportOverride = request.sportOverride;
    if (request?.durationOverride != null) payload.durationOverride = request.durationOverride;
    if (request?.recommendationTypeOverride) payload.recommendationTypeOverride = request.recommendationTypeOverride;

    return apiCall(
      apiClient.post<WorkoutPlan>('/workouts/plan', payload)
    );
  },
};
