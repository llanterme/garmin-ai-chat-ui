import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { activitiesApi } from '@/lib/activities-api';
import { ActivityFilters, PaginationParams, SortParams } from '@/types';

interface UseActivitiesParams extends PaginationParams, Partial<SortParams> {
  filters?: ActivityFilters;
}

export const useActivities = (params: UseActivitiesParams) => {
  const queryClient = useQueryClient();

  // Get activities with pagination and filtering
  const activitiesQuery = useQuery({
    queryKey: ['activities', params],
    queryFn: async () => {
      const response = await activitiesApi.getActivities(params);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to fetch activities');
    },
  });

  // Get single activity
  const useActivity = (activityId: string) => {
    return useQuery({
      queryKey: ['activity', activityId],
      queryFn: async () => {
        const response = await activitiesApi.getActivity(activityId);
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.error?.message || 'Failed to fetch activity');
      },
      enabled: !!activityId,
    });
  };

  // Get activity statistics
  const useActivityStats = (params?: {
    dateFrom?: string;
    dateTo?: string;
    activityType?: string;
  }) => {
    return useQuery({
      queryKey: ['activities', 'stats', params],
      queryFn: async () => {
        const response = await activitiesApi.getActivityStats(params);
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.error?.message || 'Failed to fetch activity stats');
      },
    });
  };

  // Get activity types
  const useActivityTypes = () => {
    return useQuery({
      queryKey: ['activities', 'types'],
      queryFn: async () => {
        const response = await activitiesApi.getActivityTypes();
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.error?.message || 'Failed to fetch activity types');
      },
    });
  };

  // Check sync status (replaces ingestion status check)
  const useSyncStatus = () => {
    return useQuery({
      queryKey: ['activities', 'sync-status'],
      queryFn: async () => {
        const response = await activitiesApi.checkSyncStatus();
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.error?.message || 'Failed to check sync status');
      },
      staleTime: 1000 * 60 * 5, // Consider fresh for 5 minutes
      refetchInterval: 1000 * 30, // Refetch every 30 seconds to catch new syncs
    });
  };

  // Delete activity mutation
  const deleteActivityMutation = useMutation({
    mutationFn: (activityId: string) => activitiesApi.deleteActivity(activityId),
    onSuccess: () => {
      // Invalidate and refetch activities and sync status
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });

  return {
    // Query data
    activities: activitiesQuery.data?.items || [],
    totalActivities: activitiesQuery.data?.total || 0,
    currentPage: activitiesQuery.data?.page || 1,
    totalPages: activitiesQuery.data?.pages || 1,
    hasNext: activitiesQuery.data?.has_next || false,
    hasPrev: activitiesQuery.data?.has_prev || false,
    
    // Query states
    isLoading: activitiesQuery.isLoading,
    error: activitiesQuery.error,
    isError: activitiesQuery.isError,
    
    // Refetch function
    refetch: activitiesQuery.refetch,

    // Additional hooks
    useActivity,
    useActivityStats,
    useActivityTypes,
    useSyncStatus, // NEW: Replaces ingestion status check

    // Mutations
    deleteActivity: deleteActivityMutation.mutate,
    isDeleting: deleteActivityMutation.isPending,
  };
};