'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Plus } from 'lucide-react';

import { useConversationHistory } from '@/hooks/use-chat';
import { chatApi } from '@/lib/chat-api';
import { ChatMessage as ChatMessageType } from '@/types';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface RecentConversationsProps {
  onSelectConversation: (conversationId: string, messages: ChatMessageType[]) => void;
  onNewConversation: () => void;
  activeConversationId?: string;
  layout?: 'sidebar' | 'pills';
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function RecentConversations({
  onSelectConversation,
  onNewConversation,
  activeConversationId,
  layout = 'pills',
}: RecentConversationsProps) {
  const { data, isLoading: isHistoryLoading } = useConversationHistory();
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);

  const cutoff = Date.now() - SEVEN_DAYS_MS;

  const recentConversations = data?.conversations.filter((c) => {
    return new Date(c.updated_at).getTime() >= cutoff;
  }) ?? [];

  const handleSelectConversation = async (conversationId: string) => {
    if (isLoadingConversation || conversationId === activeConversationId) return;

    setIsLoadingConversation(true);
    try {
      const response = await chatApi.getConversationMessages(conversationId);
      if (response.success && response.data) {
        const detail = response.data;
        const messages: ChatMessageType[] = detail.messages.map((m, i) => ({
          id: `loaded-${i}`,
          role: m.role as 'user' | 'assistant',
          content: m.content,
          timestamp: m.timestamp || new Date().toISOString(),
        }));
        onSelectConversation(conversationId, messages);
      }
    } catch {
      // Silent failure
    } finally {
      setIsLoadingConversation(false);
    }
  };

  const getLabel = (title: string | null | undefined, lastMessage: string | null): string => {
    const maxLen = layout === 'sidebar' ? 50 : 30;
    const raw = title ?? lastMessage ?? 'Conversation';
    return raw.length > maxLen ? raw.slice(0, maxLen) + '...' : raw;
  };

  const newChatDisabled = isLoadingConversation || !activeConversationId;
  const handleNewChat = () => {
    if (!activeConversationId) return;
    onNewConversation();
  };

  // --- Sidebar layout ---
  if (layout === 'sidebar') {
    return (
      <Card className="flex flex-col h-full overflow-hidden">
        <div className="p-3 border-b border-border shrink-0">
          <button
            onClick={handleNewChat}
            disabled={newChatDisabled}
            className={cn(
              'w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              'disabled:cursor-not-allowed',
              !activeConversationId
                ? 'bg-primary/10 text-primary ring-1 ring-primary/30'
                : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50'
            )}
          >
            <Plus className="h-4 w-4" />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {!isHistoryLoading && recentConversations.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No recent conversations
            </div>
          ) : (
            <div className="py-1">
              {recentConversations.map((conversation) => {
                const isActive = conversation.conversation_id === activeConversationId;
                const label = getLabel(conversation.title, conversation.last_message);
                const timeAgo = formatDistanceToNow(new Date(conversation.updated_at), {
                  addSuffix: true,
                });

                return (
                  <button
                    key={conversation.conversation_id}
                    onClick={() => handleSelectConversation(conversation.conversation_id)}
                    disabled={isLoadingConversation}
                    className={cn(
                      'w-full text-left px-3 py-2.5 transition-colors',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      isActive
                        ? 'bg-primary/10 text-foreground border-l-2 border-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <p className="text-sm font-medium truncate">{label}</p>
                    <p className="text-xs mt-0.5 text-muted-foreground/70">{timeAgo}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    );
  }

  // --- Pills layout (mobile / default) ---
  if (!isHistoryLoading && recentConversations.length === 0 && !activeConversationId) {
    return null;
  }

  return (
    <div className="overflow-x-auto pb-2 relative z-10">
      <div className="flex gap-2 flex-nowrap">
        {/* New Chat pill */}
        <button
          onClick={handleNewChat}
          disabled={newChatDisabled}
          className={cn(
            'inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0',
            'disabled:cursor-not-allowed',
            !activeConversationId
              ? 'bg-primary/10 text-primary ring-1 ring-primary/50'
              : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50'
          )}
        >
          <Plus className="h-3.5 w-3.5" />
          New Chat
        </button>

        {/* Conversation pills */}
        {recentConversations.map((conversation) => {
          const isActive = conversation.conversation_id === activeConversationId;
          const label = getLabel(conversation.title, conversation.last_message);
          const timeAgo = formatDistanceToNow(new Date(conversation.updated_at), {
            addSuffix: true,
          });

          return (
            <button
              key={conversation.conversation_id}
              onClick={() => handleSelectConversation(conversation.conversation_id)}
              disabled={isLoadingConversation}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors shrink-0',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                isActive
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <span className="max-w-[200px] truncate">{label}</span>
              <span
                className={cn(
                  'text-xs shrink-0',
                  isActive ? 'text-primary-foreground/70' : 'text-muted-foreground/70'
                )}
              >
                {timeAgo}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
