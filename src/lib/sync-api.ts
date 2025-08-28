import { apiClient, apiCall } from './api';
import {
  SyncRequest,
  SyncJob,
  ApiResponse,
} from '@/types';

export const syncApi = {
  // Start activity sync (POST /sync/activities)
  async startSync(request: SyncRequest): Promise<ApiResponse<{ sync_id: string; status: string; message: string }>> {
    return apiCall(
      apiClient.post<{ sync_id: string; status: string; message: string }>('/sync/activities', request)
    );
  },

  // Get sync history (GET /sync/history) - replaces getSyncJobs
  async getSyncJobs(params?: {
    page?: number;
    limit?: number;
    sync_type?: string;
  }): Promise<ApiResponse<{ jobs: SyncJob[]; total: number; page: number; size: number }>> {
    // Convert limit to size parameter for backend compatibility
    const apiParams = {
      page: params?.page,
      size: params?.limit, // Backend uses 'size' not 'limit'
      sync_type: params?.sync_type,
    };
    
    return apiCall(
      apiClient.get('/sync/history', { params: apiParams })
    );
  },

  // Get sync status by ID (GET /sync/status/{sync_id})
  async getSyncJob(syncId: string): Promise<ApiResponse<SyncJob>> {
    return apiCall(
      apiClient.get<SyncJob>(`/sync/status/${syncId}`)
    );
  },

  // Get sync stats (GET /sync/stats)
  async getSyncStats(): Promise<ApiResponse<any>> {
    return apiCall(
      apiClient.get('/sync/stats')
    );
  },

  // Note: The following methods may not exist in the backend based on Swagger analysis
  // TODO: Verify if these are needed or implement differently

  // Cancel sync - may not be available
  async cancelSync(jobId: string): Promise<ApiResponse<{ message: string }>> {
    // This endpoint may not exist - need to check with backend
    return apiCall(
      apiClient.post<{ message: string }>(`/sync/cancel/${jobId}`)
    );
  },

  // Retry sync - may not be available  
  async retrySync(jobId: string): Promise<ApiResponse<SyncJob>> {
    // This endpoint may not exist - need to check with backend
    return apiCall(
      apiClient.post<SyncJob>(`/sync/retry/${jobId}`)
    );
  },

  // Delete sync job - may not be available
  async deleteSyncJob(jobId: string): Promise<ApiResponse<{ message: string }>> {
    // This endpoint may not exist - need to check with backend
    return apiCall(
      apiClient.delete<{ message: string }>(`/sync/history/${jobId}`)
    );
  },
};