import React, { useEffect, useRef } from 'react';
import { type ChatMessage as ChatMessageType } from '@roguegpt/engine';
import { ChatMessage } from './ChatMessage.js';

interface ChatWindowProps {
  messages: ChatMessageType[];
  corruption: number;
}

export function ChatWindow({ messages, corruption }: ChatWindowProps): React.ReactElement {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

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

      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </div>
  );
}
