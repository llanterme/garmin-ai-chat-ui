import { apiClient, apiCall } from './api';
import {
  Activity,
  ActivityFilters,
  ActivityListResponse,
  PaginationParams,
  SortParams,
  ApiResponse,
  ActivityAnalysis,
  ActivitiesSummary,
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
      search: params.filters?.search, // Search parameter
      date_from: params.filters?.dateFrom, // Date range filters
      date_to: params.filters?.dateTo,
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
  async getActivityTypes(): Promise<ApiResponse<string[]>> {
    return apiCall(
      apiClient.get<string[]>('/activities/types/')
    );
  },

  // Check if user has synced activities (replaces ingestion status check)
  async checkSyncStatus(): Promise<ApiResponse<{
    hasSynced: boolean;
    totalActivities: number;
    mostRecentActivity: Activity | null;
  }>> {
    return apiCall(
      apiClient.get<ActivityListResponse>('/activities/', {
        params: { page: 1, page_size: 1 }
      })
    ).then(response => {
      if (response.success && response.data) {
        return {
          success: true,
          data: {
            hasSynced: response.data.total > 0,
            totalActivities: response.data.total,
            mostRecentActivity: response.data.items[0] || null,
          }
        };
      }
      return {
        success: false,
        data: {
          hasSynced: false,
          totalActivities: 0,
          mostRecentActivity: null,
        },
        error: response.error
      };
    });
  },

  // Get AI-generated analysis for an activity
  async getActivityAnalysis(activityId: string): Promise<ApiResponse<ActivityAnalysis>> {
    return apiCall(
      apiClient.get<ActivityAnalysis>(`/activities/${activityId}/analysis`)
    );
  },

  // Get activities summary statistics
  async getActivitiesSummary(): Promise<ApiResponse<ActivitiesSummary>> {
    return apiCall(
      apiClient.get<ActivitiesSummary>('/activities/summary')
    );
  },
};