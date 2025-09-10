import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { syncApi } from '@/lib/sync-api';
import { SyncRequest, SyncJob, TaskStatus } from '@/types';

export const useSync = () => {
  const queryClient = useQueryClient();

  // NEW: Get task status with polling (replaces useSyncJob)
  const useTaskStatus = (taskId: string) => {
    return useQuery({
      queryKey: ['tasks', 'status', taskId],
      queryFn: async () => {
        const response = await syncApi.getTaskStatus(taskId);
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.error?.message || 'Failed to fetch task status');
      },
      enabled: !!taskId,
      refetchInterval: (query) => {
        // Refetch every 2 seconds if task is still running (as recommended)
        if (query.state.data?.status === 'running' || query.state.data?.status === 'pending') {
          return 2000;
        }
        return false;
      },
    });
  };

  // NEW: Get all tasks with pagination
  const useTasks = (params?: {
    task_type?: string;
    page?: number;
    page_size?: number;
  }) => {
    return useQuery({
      queryKey: ['tasks', 'list', params],
      queryFn: async () => {
        const response = await syncApi.getTasks(params);
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.error?.message || 'Failed to fetch tasks');
      },
    });
  };

  // LEGACY: Get sync jobs with pagination (for backward compatibility)
  const useSyncJobs = (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => {
    return useQuery({
      queryKey: ['sync', 'jobs', params],
      queryFn: async () => {
        const response = await syncApi.getSyncJobs(params);
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.error?.message || 'Failed to fetch sync jobs');
      },
    });
  };

  // LEGACY: Get a specific sync job (deprecated, use useTaskStatus)
  const useSyncJob = (jobId: string) => {
    return useQuery({
      queryKey: ['sync', 'job', jobId],
      queryFn: async () => {
        const response = await syncApi.getSyncJob(jobId);
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.error?.message || 'Failed to fetch sync job');
      },
      enabled: !!jobId,
      refetchInterval: (query) => {
        // Refetch every 5 seconds if job is still running
        if (query.state.data?.status === 'running' || query.state.data?.status === 'pending') {
          return 5000;
        }
        return false;
      },
    });
  };

  // UPDATED: Start sync mutation (now returns task_id)
  const startSyncMutation = useMutation({
    mutationFn: (request: SyncRequest) => syncApi.startSync(request),
    onSuccess: (response) => {
      if (response.success) {
        // Invalidate tasks and sync jobs queries to refresh
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        queryClient.invalidateQueries({ queryKey: ['sync', 'jobs'] });
        
        // Also invalidate ingestion status since sync now handles ingestion
        queryClient.invalidateQueries({ queryKey: ['chat', 'ingestion', 'status'] });
      }
    },
  });

  // NEW: Delete all user data mutation
  const deleteUserDataMutation = useMutation({
    mutationFn: () => syncApi.deleteUserData(),
    onSuccess: (response) => {
      if (response.success) {
        // Clear all related queries
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        queryClient.invalidateQueries({ queryKey: ['sync'] });
        queryClient.invalidateQueries({ queryKey: ['chat'] });
        queryClient.invalidateQueries({ queryKey: ['activities'] });
      }
    },
  });

  // DEPRECATED: These mutations no longer work with the new API
  const cancelSyncMutation = useMutation({
    mutationFn: (jobId: string) => syncApi.cancelSync(jobId),
    onError: (error) => {
      console.warn('cancelSync is deprecated:', error);
    },
  });

  const retrySyncMutation = useMutation({
    mutationFn: (jobId: string) => syncApi.retrySync(jobId),
    onError: (error) => {
      console.warn('retrySync is deprecated:', error);
    },
  });

  const deleteSyncJobMutation = useMutation({
    mutationFn: (jobId: string) => syncApi.deleteSyncJob(jobId),
    onError: (error) => {
      console.warn('deleteSyncJob is deprecated:', error);
    },
  });

  return {
    // NEW: Primary queries for new task system
    useTaskStatus,
    useTasks,

    // LEGACY: Queries for backward compatibility
    useSyncJobs,
    useSyncJob,

    // PRIMARY: Mutations that work with new API
    startSync: startSyncMutation.mutate,
    deleteUserData: deleteUserDataMutation.mutate,

    // DEPRECATED: Mutations that no longer work (kept for compatibility)
    cancelSync: cancelSyncMutation.mutate,
    retrySync: retrySyncMutation.mutate,
    deleteSyncJob: deleteSyncJobMutation.mutate,

    // Loading states
    isStartingSyncLoading: startSyncMutation.isPending,
    isDeletingUserDataLoading: deleteUserDataMutation.isPending,
    isCancellingSyncLoading: cancelSyncMutation.isPending,
    isRetryingSyncLoading: retrySyncMutation.isPending,
    isDeletingSyncLoading: deleteSyncJobMutation.isPending,

    // Mutation results
    startSyncResult: startSyncMutation.data,
    startSyncError: startSyncMutation.error,
    deleteUserDataResult: deleteUserDataMutation.data,
    deleteUserDataError: deleteUserDataMutation.error,
  };
};