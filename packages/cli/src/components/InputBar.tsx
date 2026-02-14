import React, { useState } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';

interface InputBarProps {
  onSubmit: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function InputBar({ onSubmit, disabled = false, placeholder }: InputBarProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (submitted: string) => {
    const trimmed = submitted.trim();
    if (!trimmed) return;

    onSubmit(trimmed);
    setValue('');
  };

  if (disabled) {
    return (
      <Box borderStyle="single" borderColor="gray" paddingX={1}>
        <Text dimColor>Game over. Press R to restart or Q to quit.</Text>
      </Box>
    );
  }

  return (
    <Box borderStyle="single" borderColor="cyan" paddingX={1}>
      <Text color="cyan" bold>
        {'> '}
      </Text>
      <TextInput
        value={value}
        onChange={setValue}
        onSubmit={handleSubmit}
        placeholder={placeholder || 'Type a command or message...'}
      />
    </Box>
  );
}
