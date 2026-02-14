import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSender,
  corruptText,
  type ChatMessage as ChatMessageType,
} from '@roguegpt/engine';

interface ChatMessageProps {
  message: ChatMessageType;
  corruption: number;
}

/**
 * Formats a timestamp as HH:MM.
 */
function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Typewriter hook: reveals text character-by-character for AI messages.
 * Returns the currently visible portion of the text.
 */
function useTypewriter(text: string, enabled: boolean, speed: number = 18): string {
  const [displayed, setDisplayed] = useState(enabled ? '' : text);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      setDisplayed(text);
      return;
    }

    indexRef.current = 0;
    setDisplayed('');

    const interval = setInterval(() => {
      indexRef.current += 1;
      if (indexRef.current >= text.length) {
        setDisplayed(text);
        clearInterval(interval);
      } else {
        setDisplayed(text.slice(0, indexRef.current));
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, enabled, speed]);

  return displayed;
}

export function ChatMessage({ message, corruption }: ChatMessageProps): React.ReactElement {
  const { sender, text, timestamp } = message;

  // Apply corruption to AI messages
  const processedText =
    sender === MessageSender.AI && corruption > 0
      ? corruptText(text, corruption)
      : text;

  // Only typewrite AI messages that are recent (within 2 seconds)
  const isRecent = Date.now() - timestamp < 2000;
  const shouldTypewrite = sender === MessageSender.AI && isRecent;
  const visibleText = useTypewriter(processedText, shouldTypewrite);

  // ── System messages: centered ──────────────────────────────────────────
  if (sender === MessageSender.System) {
    return (
      <div className="flex justify-center my-2">
        <div className="bg-yellow-900/20 border border-yellow-800/30 rounded-lg px-4 py-2 max-w-lg">
          <p className="text-yellow-500/90 text-xs font-mono text-center whitespace-pre-wrap">
            {text}
          </p>
          <p className="text-yellow-800/60 text-[10px] font-mono text-center mt-1">
            {formatTime(timestamp)}
          </p>
        </div>
      </div>
    );
  }

  // ── Player messages: right-aligned ─────────────────────────────────────
  if (sender === MessageSender.Player) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[70%]">
          <div className="bg-blue-700/40 border border-blue-600/30 rounded-2xl rounded-br-md px-4 py-2.5">
            <p className="text-blue-100 text-sm font-mono whitespace-pre-wrap break-words">
              {text}
            </p>
          </div>
          <p className="text-gray-700 text-[10px] font-mono text-right mt-0.5 mr-1">
            {formatTime(timestamp)}
          </p>
        </div>
      </div>
    );
  }

  // ── AI messages: left-aligned ──────────────────────────────────────────
  return (
    <div className="flex justify-start">
      {/* Avatar dot */}
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-800/50 border border-emerald-700/40 flex items-center justify-center mt-1 mr-2">
        <span className="text-emerald-400 text-xs font-mono font-bold">AI</span>
      </div>
      <div className="max-w-[70%]">
        <div
          className={`bg-gray-800/80 border border-gray-700/40 rounded-2xl rounded-bl-md px-4 py-2.5 ${
            corruption > 50 ? 'glitch-text-subtle' : ''
          }`}
        >
          <p className="text-gray-200 text-sm font-mono whitespace-pre-wrap break-words">
            {visibleText}
            {shouldTypewrite && visibleText.length < processedText.length && (
              <span className="inline-block w-1.5 h-4 bg-emerald-400 ml-0.5 animate-pulse" />
            )}
          </p>
        </div>
        <p className="text-gray-700 text-[10px] font-mono mt-0.5 ml-1">
          {formatTime(timestamp)}
        </p>
      </div>
    </div>
  );
}
