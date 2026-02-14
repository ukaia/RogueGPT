import React, { useEffect, useRef } from 'react';
import { type ChatMessage as ChatMessageType } from '@roguegpt/engine';
import { ChatMessage } from './ChatMessage.js';

interface ChatWindowProps {
  messages: ChatMessageType[];
  corruption: number;
  isGenerating?: boolean;
}

export function ChatWindow({ messages, corruption, isGenerating = false }: ChatWindowProps): React.ReactElement {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom when new messages arrive or when generating starts
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isGenerating]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin"
    >
      {/* Empty state */}
      {messages.length === 0 && (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-700 font-mono text-sm">
            Waiting for connection...
          </p>
        </div>
      )}

      {/* Messages */}
      {messages.map((msg) => (
        <ChatMessage
          key={msg.id}
          message={msg}
          corruption={corruption}
        />
      ))}

      {/* Typing indicator */}
      {isGenerating && (
        <div className="flex items-start gap-2 px-2">
          <span className="text-emerald-500 font-mono text-xs font-bold mt-0.5">[AI]</span>
          <div className="flex items-center gap-1 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}

      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </div>
  );
}
