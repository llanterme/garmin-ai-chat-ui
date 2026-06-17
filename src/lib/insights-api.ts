import { apiClient, apiCall } from './api';
import { PostSyncInsight, MilestonesResponse, ApiResponse } from '@/types';

export const insightsApi = {
  async getPostSyncInsight(): Promise<ApiResponse<PostSyncInsight>> {
    return apiCall(apiClient.get<PostSyncInsight>('/insights/post-sync'));
  },

  async getMilestones(): Promise<ApiResponse<MilestonesResponse>> {
    return apiCall(apiClient.get<MilestonesResponse>('/insights/milestones'));
  },
};
