import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';

interface SettingsMenuProps {
  showTimer: boolean;
  onToggleTimer: () => void;
  onNewGamePlus: () => void;
  onRestart: () => void;
  onQuit: () => void;
  onClose: () => void;
}

interface MenuItem {
  label: string;
  action: () => void;
}

export function SettingsMenu({
  showTimer,
  onToggleTimer,
  onNewGamePlus,
  onRestart,
  onQuit,
  onClose,
}: SettingsMenuProps) {
  const items: MenuItem[] = [
    {
      label: showTimer ? 'Hide Timer & Corruption Info' : 'Show Timer & Corruption Info',
      action: onToggleTimer,
    },
    { label: 'New Game+', action: onNewGamePlus },
    { label: 'Restart Game', action: onRestart },
    { label: 'Quit', action: onQuit },
    { label: 'Back to Game', action: onClose },
  ];

  const [selectedIndex, setSelectedIndex] = useState(0);

  useInput((input, key) => {
    if (key.upArrow) {
      setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
    }
    if (key.downArrow) {
      setSelectedIndex((prev) => (prev + 1) % items.length);
    }
    if (key.return) {
      items[selectedIndex].action();
    }
    if (key.escape) {
      onClose();
    }
  });

  return (
    <Box
      flexDirection="column"
      borderStyle="double"
      borderColor="yellow"
      paddingX={2}
      paddingY={1}
    >
      <Box marginBottom={1}>
        <Text bold color="yellow">
          Settings
        </Text>
        <Text dimColor> (Esc to close)</Text>
      </Box>

      {items.map((item, index) => {
        const isSelected = index === selectedIndex;
        return (
          <Box key={index}>
            <Text
              color={isSelected ? 'cyan' : 'white'}
              bold={isSelected}
            >
              {isSelected ? '> ' : '  '}
              {item.label}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
}
