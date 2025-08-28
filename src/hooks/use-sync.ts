import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { syncApi } from '@/lib/sync-api';
import { SyncRequest, SyncJob } from '@/types';

export const useSync = () => {
  const queryClient = useQueryClient();

  // Get sync jobs with pagination
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

  // Get a specific sync job
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

  // Start sync mutation
  const startSyncMutation = useMutation({
    mutationFn: (request: SyncRequest) => syncApi.startSync(request),
    onSuccess: (response) => {
      if (response.success) {
        // Invalidate sync jobs query to refresh the list
        queryClient.invalidateQueries({ queryKey: ['sync', 'jobs'] });
      }
    },
  });

  // Cancel sync mutation
  const cancelSyncMutation = useMutation({
    mutationFn: (jobId: string) => syncApi.cancelSync(jobId),
    onSuccess: (response, jobId) => {
      if (response.success) {
        // Invalidate queries related to the cancelled job
        queryClient.invalidateQueries({ queryKey: ['sync', 'job', jobId] });
        queryClient.invalidateQueries({ queryKey: ['sync', 'jobs'] });
      }
    },
  });

  // Retry sync mutation
  const retrySyncMutation = useMutation({
    mutationFn: (jobId: string) => syncApi.retrySync(jobId),
    onSuccess: (response, jobId) => {
      if (response.success) {
        // Invalidate queries to refresh the data
        queryClient.invalidateQueries({ queryKey: ['sync', 'job', jobId] });
        queryClient.invalidateQueries({ queryKey: ['sync', 'jobs'] });
      }
    },
  });

  // Delete sync job mutation
  const deleteSyncJobMutation = useMutation({
    mutationFn: (jobId: string) => syncApi.deleteSyncJob(jobId),
    onSuccess: (response, jobId) => {
      if (response.success) {
        // Remove from cache and refresh list
        queryClient.removeQueries({ queryKey: ['sync', 'job', jobId] });
        queryClient.invalidateQueries({ queryKey: ['sync', 'jobs'] });
      }
    },
  });

  return {
    // Queries
    useSyncJobs,
    useSyncJob,

    // Mutations
    startSync: startSyncMutation.mutate,
    cancelSync: cancelSyncMutation.mutate,
    retrySync: retrySyncMutation.mutate,
    deleteSyncJob: deleteSyncJobMutation.mutate,

    // Loading states
    isStartingSyncLoading: startSyncMutation.isPending,
    isCancellingSyncLoading: cancelSyncMutation.isPending,
    isRetryingSyncLoading: retrySyncMutation.isPending,
    isDeletingSyncLoading: deleteSyncJobMutation.isPending,

    // Mutation results
    startSyncResult: startSyncMutation.data,
    startSyncError: startSyncMutation.error,
  };
};