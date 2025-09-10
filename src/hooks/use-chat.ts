import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '@/lib/chat-api';

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

  // Send message mutation (works with or without conversation ID)
  const sendMessageMutation = useMutation({
    mutationFn: ({ conversationId, message, options }: { 
      conversationId?: string; 
      message: string; 
      options?: { search_limit?: number; include_follow_ups?: boolean } 
    }) =>
      chatApi.sendMessage(message, conversationId, options),
    onSuccess: (response, { conversationId }) => {
      if (response.success) {
        // Invalidate conversation to refresh messages
        if (conversationId) {
          queryClient.invalidateQueries({ queryKey: ['chat', 'conversation', conversationId] });
        }
        queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] });
      }
    },
  });

  // Send message (new conversation) mutation - same as above but without conversation ID
  const sendMessageNewConversationMutation = useMutation({
    mutationFn: (message: string) => chatApi.sendMessage(message),
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
    sendMessage: sendMessageMutation.mutate,
    sendMessageNewConversation: sendMessageNewConversationMutation.mutate,
    deleteConversation: deleteConversationMutation.mutate,
    updateConversationTitle: updateConversationTitleMutation.mutate,

    // Loading states
    isStartingIngestion: startIngestionMutation.isPending,
    isCreatingConversation: createConversationMutation.isPending,
    isSendingMessage: sendMessageMutation.isPending,
    isSendingMessageNewConversation: sendMessageNewConversationMutation.isPending,
    isDeletingConversation: deleteConversationMutation.isPending,
    isUpdatingTitle: updateConversationTitleMutation.isPending,

    // Mutation results
    startIngestionResult: startIngestionMutation.data,
    sendMessageResult: sendMessageMutation.data,
    sendMessageNewConversationResult: sendMessageNewConversationMutation.data,
  };
};