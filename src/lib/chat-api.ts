import { apiClient, apiCall } from './api';
import {
  ChatMessage,
  ChatConversation,
  ChatResponse,
  IngestionStatus,
  ApiResponse,
} from '@/types';

export const chatApi = {
  // DEPRECATED: Use activities endpoint instead to check sync status
  async getIngestionStatus(): Promise<ApiResponse<IngestionStatus>> {
    console.warn('getIngestionStatus is deprecated. Use activitiesApi.checkSyncStatus() instead.');
    throw new Error('This endpoint has been removed. Use GET /api/v1/activities/?page=1&page_size=1 to check sync status instead.');
  },

  // DEPRECATED: Ingestion is now handled by the sync API
  async startIngestion(): Promise<ApiResponse<{ message: string; jobId: string }>> {
    console.warn('startIngestion is deprecated. Use syncApi.startSync() instead which handles both sync and ingestion.');
    throw new Error('This endpoint has been removed. Use the unified sync flow via syncApi.startSync() instead.');
  },

  // Get all conversations
  async getConversations(): Promise<ApiResponse<ChatConversation[]>> {
    return apiCall(
      apiClient.get<ChatConversation[]>('/chat/conversations')
    );
  },

  // Get a specific conversation
  async getConversation(conversationId: string): Promise<ApiResponse<ChatConversation>> {
    return apiCall(
      apiClient.get<ChatConversation>(`/chat/conversations/${conversationId}`)
    );
  },

  // Create a new conversation
  async createConversation(title?: string): Promise<ApiResponse<ChatConversation>> {
    return apiCall(
      apiClient.post<ChatConversation>('/chat/conversations', { title })
    );
  },

  // Send a chat query (POST /chat/query)
  async sendMessage(
    query: string,
    conversationId?: string,
    options?: {
      search_limit?: number;
      include_follow_ups?: boolean;
    }
  ): Promise<ApiResponse<ChatResponse>> {
    return apiCall(
      apiClient.post<ChatResponse>('/chat/query', {
        query,
        conversation_id: conversationId,
        search_limit: options?.search_limit,
        include_follow_ups: options?.include_follow_ups,
      }, {
        timeout: 90000,  // 90 seconds — workout generation can take 20-30s
      })
    );
  },

  // Delete a conversation
  async deleteConversation(conversationId: string): Promise<ApiResponse<{ message: string }>> {
    return apiCall(
      apiClient.delete<{ message: string }>(`/chat/conversations/${conversationId}`)
    );
  },

  // Update conversation title
  async updateConversationTitle(
    conversationId: string,
    title: string
  ): Promise<ApiResponse<ChatConversation>> {
    return apiCall(
      apiClient.put<ChatConversation>(`/chat/conversations/${conversationId}`, {
        title,
      })
    );
  },

  // Get suggested questions
  async getSuggestedQuestions(): Promise<ApiResponse<string[]>> {
    return apiCall(
      apiClient.get<string[]>('/chat/suggestions')
    );
  },
};