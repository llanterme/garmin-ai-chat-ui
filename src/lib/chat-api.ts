import { apiClient, apiCall } from './api';
import {
  ChatMessage,
  ChatConversation,
  ChatResponse,
  IngestionStatus,
  ApiResponse,
} from '@/types';

export const chatApi = {
  // Check ingestion status
  async getIngestionStatus(): Promise<ApiResponse<IngestionStatus>> {
    return apiCall(
      apiClient.get<IngestionStatus>('/chat/ingestion/status')
    );
  },

  // Start activity ingestion into vector database
  async startIngestion(): Promise<ApiResponse<{ message: string; jobId: string }>> {
    return apiCall(
      apiClient.post<{ message: string; jobId: string }>('/chat/ingestion/start')
    );
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