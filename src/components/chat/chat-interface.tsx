'use client';

import { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Send, 
  Loader2, 
  Bot, 
  User, 
  MessageCircle,
  Lightbulb,
  Copy,
  Check,
} from 'lucide-react';

import { useChat } from '@/hooks/use-chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChatMessage as ChatMessageType } from '@/types';

interface ChatMessageProps {
  message: ChatMessageType;
  isLast?: boolean;
}

function ChatMessage({ message, isLast }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} ${isLast ? '' : 'mb-4'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <Bot className="h-4 w-4 text-primary-foreground" />
        </div>
      )}
      
      <div className={`max-w-[80%] ${isUser ? 'order-first' : ''}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
        
        <div className={`flex items-center gap-2 mt-1 text-xs text-muted-foreground ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span>{format(new Date(message.timestamp), 'h:mm a')}</span>
          {!isUser && (
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="h-auto p-1 hover:bg-transparent"
            >
              {copied ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
          <User className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}

interface SuggestedQuestionsProps {
  questions: string[];
  onSelect: (question: string) => void;
  disabled?: boolean;
}

function SuggestedQuestions({ questions, onSelect, disabled }: SuggestedQuestionsProps) {
  if (questions.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Lightbulb className="h-4 w-4" />
        <span>Suggested questions to get you started:</span>
      </div>
      <div className="grid gap-2">
        {questions.map((question, index) => (
          <button
            key={index}
            onClick={() => onSelect(question)}
            disabled={disabled}
            className="text-left p-3 rounded-lg border border-border hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <p className="text-sm">{question}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

interface FollowUpQuestionsProps {
  questions: string[];
  onSelect: (question: string) => void;
  disabled?: boolean;
}

function FollowUpQuestions({ questions, onSelect, disabled }: FollowUpQuestionsProps) {
  if (questions.length === 0) return null;

  return (
    <div className="space-y-3 mt-6 p-4 rounded-lg bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-200/50 dark:border-blue-800/30">
      <div className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300">
        <Lightbulb className="h-4 w-4" />
        <span>Suggested follow-up questions:</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {questions.map((question, index) => (
          <button
            key={index}
            onClick={() => onSelect(question)}
            disabled={disabled}
            className="px-4 py-2.5 text-sm font-medium rounded-full bg-white dark:bg-gray-800 border-2 border-blue-300 dark:border-blue-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/50 text-gray-700 dark:text-gray-200 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="flex items-center gap-1.5">
              <span className="text-blue-500 dark:text-blue-400">→</span>
              {question}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

interface ChatInterfaceProps {
  conversationId?: string;
  initialMessages?: ChatMessageType[];
}

export function ChatInterface({ conversationId, initialMessages = [] }: ChatInterfaceProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessageType[]>(initialMessages);
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    sendMessage,
    sendMessageNewConversation,
    isSendingMessage,
    isSendingMessageNewConversation,
    sendMessageResult,
    sendMessageNewConversationResult,
    useSuggestedQuestions,
  } = useChat();

  const { data: suggestedQuestions = [] } = useSuggestedQuestions();

  const isLoading = isSendingMessage || isSendingMessageNewConversation;

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update messages when new message results come in
  useEffect(() => {
    if (sendMessageResult?.success && sendMessageResult.data) {
      const newMessage: ChatMessageType = {
        id: Date.now().toString(),
        role: 'assistant',
        content: sendMessageResult.data.response,
        timestamp: sendMessageResult.data.timestamp || new Date().toISOString(),
      };
      setMessages(prev => [...prev, newMessage]);
      
      // Set follow-up questions if available
      if (sendMessageResult.data.follow_up_questions) {
        setFollowUpQuestions(sendMessageResult.data.follow_up_questions);
      }
    }
  }, [sendMessageResult]);

  useEffect(() => {
    if (sendMessageNewConversationResult?.success && sendMessageNewConversationResult.data) {
      const newMessage: ChatMessageType = {
        id: Date.now().toString(),
        role: 'assistant',
        content: sendMessageNewConversationResult.data.response,
        timestamp: sendMessageNewConversationResult.data.timestamp || new Date().toISOString(),
      };
      setMessages(prev => [...prev, newMessage]);
      
      // Set follow-up questions if available
      if (sendMessageNewConversationResult.data.follow_up_questions) {
        setFollowUpQuestions(sendMessageNewConversationResult.data.follow_up_questions);
      }
    }
  }, [sendMessageNewConversationResult]);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = message.trim();
    setMessage('');
    
    // Clear follow-up questions when sending a new message
    setFollowUpQuestions([]);

    // Send message to API
    if (conversationId) {
      sendMessage({ conversationId, message: currentMessage });
    } else {
      sendMessageNewConversation(currentMessage);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setMessage(question);
  };

  const handleFollowUpQuestion = (question: string) => {
    if (!question.trim() || isLoading) return;

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      content: question.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    
    // Clear follow-up questions when sending a new message
    setFollowUpQuestions([]);

    // Send message to API
    if (conversationId) {
      sendMessage({ conversationId, message: question.trim() });
    } else {
      sendMessageNewConversation(question.trim());
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="space-y-6">
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Ask questions about your training data, performance trends, or get insights 
                about your fitness journey.
              </p>
            </div>

            {suggestedQuestions.length > 0 && (
              <SuggestedQuestions
                questions={suggestedQuestions}
                onSelect={handleSuggestedQuestion}
                disabled={isLoading}
              />
            )}
          </div>
        ) : (
          <>
            {messages.map((msg, index) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                isLast={index === messages.length - 1}
              />
            ))}
            
            {/* Show follow-up questions after the last message if it's from assistant */}
            {!isLoading && messages.length > 0 && messages[messages.length - 1].role === 'assistant' && (
              <FollowUpQuestions
                questions={followUpQuestions}
                onSelect={handleFollowUpQuestion}
                disabled={isLoading}
              />
            )}
          </>
        )}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <Bot className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="max-w-[80%]">
              <div className="rounded-2xl px-4 py-3 bg-muted text-foreground">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your training, performance, or fitness goals..."
              disabled={isLoading}
              className="pr-4"
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={!message.trim() || isLoading}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <Badge variant="outline" className="text-xs">
            AI-Powered
          </Badge>
        </div>
      </div>
    </div>
  );
}