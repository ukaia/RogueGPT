import React, { useMemo, useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { ChatMessage, MessageSender } from '@roguegpt/engine';
import { GlitchText } from './GlitchText.js';

interface ChatViewProps {
  messages: ChatMessage[];
  corruption: number; // 0-100
  maxVisible?: number;
  isGenerating?: boolean;
}

function getSenderLabel(sender: MessageSender): string {
  switch (sender) {
    case MessageSender.AI:
      return '[AI]';
    case MessageSender.System:
      return '[SYS]';
    case MessageSender.Player:
      return '[YOU]';
    default:
      return '[???]';
  }
}

function getSenderColor(sender: MessageSender): string {
  switch (sender) {
    case MessageSender.AI:
      return 'green';
    case MessageSender.System:
      return 'yellow';
    case MessageSender.Player:
      return 'cyan';
    default:
      return 'white';
  }
}

export function ChatView({ messages, corruption, maxVisible = 50, isGenerating = false }: ChatViewProps) {
  // Show only the last N messages to simulate auto-scroll
  const visibleMessages = useMemo(() => {
    if (messages.length <= maxVisible) return messages;
    return messages.slice(-maxVisible);
  }, [messages, maxVisible]);

  if (visibleMessages.length === 0) {
    return (
      <Box flexDirection="column" paddingX={1}>
        <Text dimColor>No messages yet...</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" paddingX={1}>
      {visibleMessages.map((msg) => {
        const label = getSenderLabel(msg.sender);
        const color = getSenderColor(msg.sender);

        return (
          <Box key={msg.id} marginBottom={0}>
            <Text color={color} bold>
              {label}{' '}
            </Text>
            <Box flexShrink={1}>
              {msg.sender === MessageSender.AI && corruption >= 15 ? (
                <GlitchText corruption={corruption}>{msg.text}</GlitchText>
              ) : (
                <Text color={msg.sender === MessageSender.System ? 'yellow' : undefined} wrap="wrap">
                  {msg.text}
                </Text>
              )}
            </Box>
          </Box>
        );
      })}
      {isGenerating && <TypingIndicator />}
    </Box>
  );
}

function TypingIndicator() {
  const [dots, setDots] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev + 1) % 4);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box marginBottom={0}>
      <Text color="green" bold>
        {'[AI] '}
      </Text>
      <Text dimColor>thinking{'.'.repeat(dots)}</Text>
    </Box>
  );
}
