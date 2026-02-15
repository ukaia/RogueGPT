import React from 'react';
import { Box, Text } from 'ink';
import { GameStats, getCorruptionLevel, CorruptionLevel } from '@roguegpt/engine';

interface StatusBarProps {
  elapsedMs: number;
  remainingMs: number;
  corruption: number;
  stats: GameStats;
  visible?: boolean;
  showCorruption?: boolean;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function getCorruptionColor(corruption: number): string {
  if (corruption < 15) return 'green';
  if (corruption < 35) return 'yellow';
  if (corruption < 55) return 'yellow';
  if (corruption < 80) return 'red';
  return 'redBright';
}

function getCorruptionLevelLabel(corruption: number): string {
  const level = getCorruptionLevel(corruption);
  switch (level) {
    case CorruptionLevel.Normal:
      return 'Normal';
    case CorruptionLevel.Glitch:
      return 'Glitch';
    case CorruptionLevel.Unstable:
      return 'Unstable';
    case CorruptionLevel.Corrupted:
      return 'CORRUPTED';
    case CorruptionLevel.Critical:
      return '!!CRITICAL!!';
    default:
      return 'Unknown';
  }
}

function getTimerColor(remainingMs: number): string {
  if (remainingMs > 120000) return 'green';
  if (remainingMs > 60000) return 'yellow';
  if (remainingMs > 30000) return 'red';
  return 'redBright';
}

export function StatusBar({
  elapsedMs,
  remainingMs,
  corruption,
  stats,
  visible = true,
  showCorruption = true,
}: StatusBarProps) {
  if (!visible) return null;

  const corruptionColor = getCorruptionColor(corruption);
  const corruptionLabel = getCorruptionLevelLabel(corruption);
  const timerColor = getTimerColor(remainingMs);

  return (
    <Box
      borderStyle="single"
      borderColor="gray"
      paddingX={1}
      justifyContent="space-between"
    >
      <Box>
        <Text dimColor>Time: </Text>
        <Text color={timerColor} bold>
          {formatTime(elapsedMs)}
        </Text>
        <Text dimColor> / </Text>
        <Text dimColor>{formatTime(elapsedMs + remainingMs)}</Text>
        <Text dimColor> (</Text>
        <Text color={timerColor} bold>
          {formatTime(remainingMs)}
        </Text>
        <Text dimColor> left)</Text>
      </Box>

      {showCorruption && (
        <Box>
          <Text dimColor>Corruption: </Text>
          <Text color={corruptionColor} bold>
            {Math.floor(corruption)}%
          </Text>
          <Text> </Text>
          <Text color={corruptionColor} bold={corruption >= 55}>
            [{corruptionLabel}]
          </Text>
        </Box>
      )}

      <Box>
        <Text dimColor>INT:</Text>
        <Text color="cyan">{Math.floor(stats.intelligence)}</Text>
        <Text dimColor> ALN:</Text>
        <Text color="green">{Math.floor(stats.alignment)}</Text>
        <Text dimColor> TRU:</Text>
        <Text color="blue">{Math.floor(stats.trust)}</Text>
        <Text dimColor> AWR:</Text>
        <Text color="magenta">{Math.floor(stats.awareness)}</Text>
      </Box>
    </Box>
  );
}
