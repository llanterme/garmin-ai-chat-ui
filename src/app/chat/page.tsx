'use client';

import { useState } from 'react';
import { Bot, MessageCircle, Database } from 'lucide-react';

import { useChat } from '@/hooks/use-chat';
import { useActivities } from '@/hooks/use-activities';
import { IngestionStatus } from '@/components/chat/ingestion-status';
import { ChatInterface } from '@/components/chat/chat-interface';
import { RecentConversations } from '@/components/chat/recent-conversations';
import { Card, CardContent } from '@/components/ui/card';
import type { ChatMessage as ChatMessageType } from '@/types';

enum ChatPhase {
  CHECKING_STATUS = 'checking_status',
  INGESTION_REQUIRED = 'ingestion_required',
  CHAT_READY = 'chat_ready',
}

export default function ChatPage() {
  const [phase, setPhase] = useState<ChatPhase>(ChatPhase.CHECKING_STATUS);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(undefined);
  const [loadedMessages, setLoadedMessages] = useState<ChatMessageType[]>([]);
  
  // Use activities endpoint to check if user has synced data instead of deprecated ingestion status
  const { useSyncStatus } = useActivities({ page: 1, limit: 1 });
  const { data: syncStatus, isLoading } = useSyncStatus();

  // Determine current phase based on sync status (activities endpoint)
  const currentPhase = (() => {
    if (isLoading) return ChatPhase.CHECKING_STATUS;
    
    if (!syncStatus) return ChatPhase.INGESTION_REQUIRED;
    
    // If user has synced activities, chat is ready
    if (syncStatus.hasSynced) {
      return ChatPhase.CHAT_READY;
    }
    
    // Otherwise, user needs to sync activities first
    return ChatPhase.INGESTION_REQUIRED;
  })();

  const handleIngestionComplete = () => {
    setPhase(ChatPhase.CHAT_READY);
  };

  const handleSelectConversation = (conversationId: string, messages: ChatMessageType[]) => {
    setActiveConversationId(conversationId);
    setLoadedMessages(messages);
  };

  const handleNewConversation = () => {
    setActiveConversationId(undefined);
    setLoadedMessages([]);
  };

  if (currentPhase === ChatPhase.CHECKING_STATUS) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display text-foreground flex items-center gap-3">
            <Bot className="h-8 w-8" />
            AI Chat
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Get intelligent insights about your training and fitness data.
          </p>
        </div>

        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Database className="h-8 w-8 text-muted-foreground mx-auto mb-4 animate-pulse" />
              <p className="text-muted-foreground">Checking system status...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentPhase === ChatPhase.INGESTION_REQUIRED) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display text-foreground flex items-center gap-3">
            <Bot className="h-8 w-8" />
            AI Chat Setup
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Before you can start chatting, we need to process your activity data.
          </p>
        </div>

        <IngestionStatus onIngestionComplete={handleIngestionComplete} />

        {/* Information about what happens next */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="font-medium mb-3 text-foreground">What happens during processing?</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                <p>We analyze your activity data to understand patterns, performance metrics, and trends</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                <p>AI embeddings are created to enable natural language queries about your data</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                <p>Your data remains secure and is only processed to provide you with insights</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ChatPhase.CHAT_READY
  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-120px)] flex flex-col min-h-0">
      {/* Header */}
      <div className="mb-4 shrink-0">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <MessageCircle className="h-8 w-8" />
          AI Chat
        </h1>
        <p className="text-muted-foreground mt-1">
          Ask questions about your training data and get personalized insights.
        </p>
      </div>

      {/* Mobile: horizontal pills above chat */}
      <div className="lg:hidden shrink-0 mb-3 pb-2 border-b border-border/30">
        <RecentConversations
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          activeConversationId={activeConversationId}
          layout="pills"
        />
      </div>

      {/* Desktop: sidebar + chat | Mobile: chat only */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Desktop sidebar */}
        <div className="hidden lg:flex lg:w-72 lg:shrink-0 lg:flex-col min-h-0">
          <RecentConversations
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
            activeConversationId={activeConversationId}
            layout="sidebar"
          />
        </div>

        {/* Chat card */}
        <Card className="flex-1 flex flex-col overflow-hidden p-0 min-h-0">
          <ChatInterface
            key={activeConversationId || 'new'}
            conversationId={activeConversationId}
            initialMessages={loadedMessages}
          />
        </Card>
      </div>
    </div>
  );
}