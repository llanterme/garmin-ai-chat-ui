import { apiClient, apiCall } from './api';
import {
  SyncRequest,
  SyncResponse,
  TaskStatus,
  TaskListResponse,
  SyncJob,
  ApiResponse,
} from '@/types';

export const syncApi = {
  // NEW: Start unified sync + ingestion (POST /sync/activities)
  async startSync(request: SyncRequest): Promise<ApiResponse<SyncResponse>> {
    return apiCall(
      apiClient.post<SyncResponse>('/sync/activities', request)
    );
  },

  // NEW: Get task status by ID (GET /tasks/{task_id})
  async getTaskStatus(taskId: string): Promise<ApiResponse<TaskStatus>> {
    return apiCall(
      apiClient.get<TaskStatus>(`/tasks/${taskId}`)
    );
  },

  // NEW: List all tasks for user (GET /tasks)
  async getTasks(params?: {
    task_type?: string;
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<TaskListResponse>> {
    return apiCall(
      apiClient.get<TaskListResponse>('/tasks', { params })
    );
  },

  // NEW: Delete all user data (DELETE /auth/me/data)
  async deleteUserData(): Promise<ApiResponse<{ message: string }>> {
    return apiCall(
      apiClient.delete<{ message: string }>('/auth/me/data')
    );
  },

  // LEGACY: Get sync history (GET /sync/history) - keeping for backward compatibility
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

  // DEPRECATED: Get sync status by ID - use getTaskStatus instead
  async getSyncJob(syncId: string): Promise<ApiResponse<SyncJob>> {
    console.warn('getSyncJob is deprecated, use getTaskStatus instead');
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

  // DEPRECATED: These endpoints no longer exist in the new API
  async cancelSync(jobId: string): Promise<ApiResponse<{ message: string }>> {
    console.warn('cancelSync endpoint no longer exists');
    throw new Error('This endpoint has been removed. Tasks cannot be cancelled.');
  },

  async retrySync(jobId: string): Promise<ApiResponse<SyncJob>> {
    console.warn('retrySync endpoint no longer exists, use startSync instead');
    throw new Error('This endpoint has been removed. Use startSync with force_resync: true instead.');
  },

  async deleteSyncJob(jobId: string): Promise<ApiResponse<{ message: string }>> {
    console.warn('deleteSyncJob endpoint no longer exists');
    throw new Error('This endpoint has been removed. Individual jobs cannot be deleted.');
  },
};