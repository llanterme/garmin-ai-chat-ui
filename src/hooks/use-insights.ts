import { useQuery } from '@tanstack/react-query';
import { insightsApi } from '@/lib/insights-api';

export const usePostSyncInsight = () => {
  return useQuery({
    queryKey: ['insights', 'post-sync'],
    queryFn: async () => {
      const response = await insightsApi.getPostSyncInsight();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to load insight');
    },
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });
};

export const useMilestones = () => {
  return useQuery({
    queryKey: ['insights', 'milestones'],
    queryFn: async () => {
      const response = await insightsApi.getMilestones();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to load milestones');
    },
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });
};
