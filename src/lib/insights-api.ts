import { apiClient, apiCall } from './api';
import { PostSyncInsight, ApiResponse } from '@/types';

export const insightsApi = {
  async getPostSyncInsight(): Promise<ApiResponse<PostSyncInsight>> {
    return apiCall(apiClient.get<PostSyncInsight>('/insights/post-sync'));
  },
};
