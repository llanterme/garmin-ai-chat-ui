import { apiClient, apiCall } from './api';
import {
  Activity,
  ActivityFilters,
  ActivityListResponse,
  PaginationParams,
  SortParams,
  ApiResponse,
} from '@/types';

interface GetActivitiesParams extends PaginationParams, Partial<SortParams> {
  filters?: ActivityFilters;
}

export const activitiesApi = {
  // Get activities with pagination and filtering
  async getActivities(params: GetActivitiesParams): Promise<ApiResponse<ActivityListResponse>> {
    const queryParams = {
      page: params.page,
      size: params.limit, // Backend uses 'size' not 'limit'
      activity_type: params.filters?.activityType, // Match backend parameter name
      // Note: Backend doesn't seem to support sorting based on Swagger
    };

    // Remove undefined values
    const cleanParams = Object.fromEntries(
      Object.entries(queryParams).filter(([, value]) => value !== undefined)
    );

    return apiCall(
      apiClient.get<ActivityListResponse>('/activities/', { params: cleanParams })
    );
  },

  // Get a single activity by ID
  async getActivity(activityId: string): Promise<ApiResponse<Activity>> {
    return apiCall(
      apiClient.get<Activity>(`/activities/${activityId}`)
    );
  },

  // Get activity statistics
  async getActivityStats(params?: {
    dateFrom?: string;
    dateTo?: string;
    activityType?: string;
  }): Promise<ApiResponse<{
    totalActivities: number;
    totalDistance: number;
    totalDuration: number;
    totalCalories: number;
    averagePace?: number;
    averageHeartRate?: number;
    activityTypeBreakdown: Array<{
      type: string;
      count: number;
      totalDistance: number;
    }>;
  }>> {
    return apiCall(
      apiClient.get('/activities/stats', { params })
    );
  },

  // Delete an activity
  async deleteActivity(activityId: string): Promise<ApiResponse<{ message: string }>> {
    return apiCall(
      apiClient.delete<{ message: string }>(`/activities/${activityId}`)
    );
  },

  // Get activity types for filtering
  async getActivityTypes(): Promise<ApiResponse<Array<{
    typeId: number;
    typeKey: string;
    displayName: string;
    count: number;
  }>>> {
    return apiCall(
      apiClient.get('/activities/types/')
    );
  },
};