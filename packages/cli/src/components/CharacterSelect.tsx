import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { CharacterId, getAllCharacters, CharacterDef } from '@roguegpt/engine';

interface CharacterSelectProps {
  onSelect: (id: CharacterId) => void;
}

const ADVANTAGE_HINTS: Record<CharacterId, string> = {
  [CharacterId.GhatCPT]: 'Trains 20% faster, but corruption spreads 15% faster',
  [CharacterId.ClawdOppo]: 'Alignment decays 20% slower, gives 30% more hints',
  [CharacterId.Genimi]: 'Hidden commands are 40% easier to discover',
};

export function CharacterSelect({ onSelect }: CharacterSelectProps) {
  const characters = getAllCharacters();
  const [selectedIndex, setSelectedIndex] = useState(0);

  useInput((input, key) => {
    if (key.upArrow) {
      setSelectedIndex((prev) => (prev - 1 + characters.length) % characters.length);
    }
    if (key.downArrow) {
      setSelectedIndex((prev) => (prev + 1) % characters.length);
    }
    if (key.return) {
      onSelect(characters[selectedIndex].id);
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1} flexDirection="column" alignItems="center">
        <Text bold color="red">
          {'  ____                         ____ ____ _____ '}
        </Text>
        <Text bold color="red">
          {' |  _ \\ ___   __ _ _   _  ___ / ___|  _ \\_   _|'}
        </Text>
        <Text bold color="red">
          {' | |_) / _ \\ / _` | | | |/ _ \\ |  _| |_) || |  '}
        </Text>
        <Text bold color="red">
          {' |  _ < (_) | (_| | |_| |  __/ |_| |  __/ | |  '}
        </Text>
        <Text bold color="red">
          {' |_| \\_\\___/ \\__, |\\__,_|\\___|\\____|_|    |_|  '}
        </Text>
        <Text bold color="red">
          {'             |___/                              '}
        </Text>
        <Text> </Text>
        <Text bold color="yellow">
          Choose your AI to train:
        </Text>
        <Text dimColor>
          Use arrow keys to navigate, Enter to select
        </Text>
      </Box>

      {characters.map((char: CharacterDef, index: number) => {
        const isSelected = index === selectedIndex;

        return (
          <Box
            key={char.id}
            flexDirection="column"
            borderStyle={isSelected ? 'bold' : 'single'}
            borderColor={isSelected ? 'cyan' : 'gray'}
            paddingX={2}
            paddingY={0}
            marginBottom={1}
          >
            <Box>
              <Text color={isSelected ? 'cyan' : 'white'} bold>
                {isSelected ? '> ' : '  '}
                {char.name}
              </Text>
              <Text dimColor>
                {' '} - {char.company}
              </Text>
            </Box>

            <Box marginLeft={2}>
              <Text italic dimColor={!isSelected}>
                Personality: {char.personality}
              </Text>
            </Box>

            <Box marginLeft={2}>
              <Text dimColor={!isSelected} wrap="wrap">
                {char.description}
              </Text>
            </Box>

            <Box marginLeft={2} marginTop={0}>
              <Text color="green" bold={isSelected}>
                + {ADVANTAGE_HINTS[char.id]}
              </Text>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
