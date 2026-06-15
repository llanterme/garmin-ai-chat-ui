import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '@/lib/chat-api';
import { ChatResponse, ApiResponse } from '@/types';

export const useChat = () => {
  const queryClient = useQueryClient();

  // DEPRECATED: Ingestion status now uses activities endpoint for sync status check
  const useIngestionStatus = () => {
    console.warn('useIngestionStatus is deprecated. Use useActivities().useSyncStatus() instead.');
    return useQuery({
      queryKey: ['chat', 'ingestion', 'status'],
      queryFn: async () => {
        throw new Error('This endpoint is deprecated. Use activities endpoint to check sync status.');
      },
      enabled: false, // Disable this query
    });
  };

  // DEPRECATED: Ingestion is now handled by sync API
  const startIngestionMutation = useMutation({
    mutationFn: () => chatApi.startIngestion(),
    onError: (error) => {
      console.warn('startIngestion is deprecated. Use syncApi.startSync() instead:', error);
    },
  });

  // Conversations query
  const useConversations = () => {
    return useQuery({
      queryKey: ['chat', 'conversations'],
      queryFn: async () => {
        const response = await chatApi.getConversations();
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.error?.message || 'Failed to get conversations');
      },
    });
  };

  // Single conversation query
  const useConversation = (conversationId: string) => {
    return useQuery({
      queryKey: ['chat', 'conversation', conversationId],
      queryFn: async () => {
        const response = await chatApi.getConversation(conversationId);
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.error?.message || 'Failed to get conversation');
      },
      enabled: !!conversationId,
    });
  };

  // Suggested questions query
  const useSuggestedQuestions = () => {
    return useQuery({
      queryKey: ['chat', 'suggestions'],
      queryFn: async () => {
        const response = await chatApi.getSuggestedQuestions();
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.error?.message || 'Failed to get suggested questions');
      },
    });
  };

  // Create conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: (title?: string) => chatApi.createConversation(title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] });
    },
  });

  // Delete conversation mutation
  const deleteConversationMutation = useMutation({
    mutationFn: (conversationId: string) => chatApi.deleteConversation(conversationId),
    onSuccess: (response, conversationId) => {
      if (response.success) {
        // Remove from cache
        queryClient.removeQueries({ queryKey: ['chat', 'conversation', conversationId] });
        queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] });
      }
    },
  });

  // Update conversation title mutation
  const updateConversationTitleMutation = useMutation({
    mutationFn: ({ conversationId, title }: { conversationId: string; title: string }) =>
      chatApi.updateConversationTitle(conversationId, title),
    onSuccess: (response, { conversationId }) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['chat', 'conversation', conversationId] });
        queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] });
      }
    },
  });

  return {
    // Queries
    useIngestionStatus,
    useConversations,
    useConversation,
    useSuggestedQuestions,

    // Mutations
    startIngestion: startIngestionMutation.mutate,
    createConversation: createConversationMutation.mutate,
    deleteConversation: deleteConversationMutation.mutate,
    updateConversationTitle: updateConversationTitleMutation.mutate,

    // Loading states
    isStartingIngestion: startIngestionMutation.isPending,
    isCreatingConversation: createConversationMutation.isPending,
    isDeletingConversation: deleteConversationMutation.isPending,
    isUpdatingTitle: updateConversationTitleMutation.isPending,

    // Mutation results
    startIngestionResult: startIngestionMutation.data,
  };
};

/**
 * Dedicated hook for sending chat messages.
 *
 * Uses per-call onSuccess/onError callbacks rather than watching mutation.data
 * via useEffect. This is the canonical TanStack Query pattern for "fire and
 * handle the result" flows: the callback receives the exact result for that
 * specific call, eliminating stale-closure and reference-equality bugs that
 * occur when an effect watches mutation.data across re-renders (e.g. when the
 * chat is auto-triggered from a URL param during a parent phase transition).
 *
 * Returns a single sendChatMessage(...) that handles both new conversations
 * (no conversationId) and existing ones.
 */
export interface SendChatMessageArgs {
  message: string;
  conversationId?: string;
  options?: { search_limit?: number; include_follow_ups?: boolean };
  onResult: (response: ChatResponse) => void;
  onFailure: (errorMessage: string) => void;
}

export const useSendChatMessage = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ApiResponse<ChatResponse>,
    Error,
    SendChatMessageArgs
  >({
    mutationFn: ({ message, conversationId, options }: SendChatMessageArgs) =>
      chatApi.sendMessage(message, conversationId, options),
    onSuccess: (response, variables) => {
      // The API wrapper never throws — it returns { success, data, error }.
      // Branch on the wrapper result and route to the per-call callbacks.
      if (response.success && response.data) {
        if (variables.conversationId) {
          queryClient.invalidateQueries({
            queryKey: ['chat', 'conversation', variables.conversationId],
          });
        }
        queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] });
        variables.onResult(response.data);
      } else {
        variables.onFailure(
          response.error?.message ||
            'Something went wrong while processing your message.'
        );
      }
    },
    onError: (error, variables) => {
      // Network failures, timeouts, or anything that rejected the promise.
      variables.onFailure(
        error?.message ||
          'Something went wrong while processing your message.'
      );
    },
  });

  return {
    sendChatMessage: mutation.mutate,
    // Loading state is managed locally in the component via onResult/onFailure
    // callbacks — mutation.isPending is not reliable for clearing the spinner.
  };
};
