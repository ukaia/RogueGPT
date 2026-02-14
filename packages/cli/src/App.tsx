import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import { GamePhase, EndingType, SideEffect } from '@roguegpt/engine';
import { useGame } from './hooks/useGame.js';
import { CharacterSelect } from './components/CharacterSelect.js';
import { ChatView } from './components/ChatView.js';
import { InputBar } from './components/InputBar.js';
import { StatusBar } from './components/StatusBar.js';
import { SettingsMenu } from './components/SettingsMenu.js';

export function App() {
  const {
    phase,
    messages,
    stats,
    corruption,
    elapsedMs,
    remainingMs,
    characterId,
    ending,
    hasWonOnce,
    isGenerating,
    selectCharacter,
    processInput,
    restart,
    startNewGamePlus,
    sideEffects,
  } = useGame();

  const { exit } = useApp();

  const [showSettings, setShowSettings] = useState(false);
  const [showTimer, setShowTimer] = useState(true);
  const [flashActive, setFlashActive] = useState(false);
  const [screenShake, setScreenShake] = useState(false);
  const processedEffectsRef = useRef<SideEffect[] | null>(null);

  // Handle side effects — only process each batch once
  if (sideEffects.length > 0 && sideEffects !== processedEffectsRef.current) {
    processedEffectsRef.current = sideEffects;
    for (const effect of sideEffects) {
      if (effect.type === 'flash') {
        setFlashActive(true);
      }
      if (effect.type === 'screenShake') {
        setScreenShake(true);
      }
    }
  }

  // Auto-clear flash after 1.5 seconds
  useEffect(() => {
    if (!flashActive) return;
    const timer = setTimeout(() => setFlashActive(false), 1500);
    return () => clearTimeout(timer);
  }, [flashActive]);

  // Auto-clear screen shake after 500ms
  useEffect(() => {
    if (!screenShake) return;
    const timer = setTimeout(() => setScreenShake(false), 500);
    return () => clearTimeout(timer);
  }, [screenShake]);

  // Global key handler for settings toggle and end-game actions
  useInput(
    (input, key) => {
      // Escape toggles settings in playing phase
      if (key.escape && phase === GamePhase.Playing) {
        setShowSettings((prev) => !prev);
        return;
      }

      // End-game key bindings
      if (phase === GamePhase.Ended) {
        if (input === 'r' || input === 'R') {
          restart();
          return;
        }
        if ((input === 'n' || input === 'N') && hasWonOnce) {
          startNewGamePlus();
          return;
        }
        if (input === 'q' || input === 'Q') {
          exit();
          return;
        }
      }
    },
    { isActive: !showSettings },
  );

  const handleInput = useCallback(
    async (value: string) => {
      await processInput(value);
    },
    [processInput],
  );

  const handleToggleTimer = useCallback(() => {
    setShowTimer((prev) => !prev);
  }, []);

  const handleNewGamePlus = useCallback(() => {
    setShowSettings(false);
    startNewGamePlus();
  }, [startNewGamePlus]);

  const handleRestart = useCallback(() => {
    setShowSettings(false);
    restart();
  }, [restart]);

  const handleQuit = useCallback(() => {
    exit();
  }, [exit]);

  const handleCloseSettings = useCallback(() => {
    setShowSettings(false);
  }, []);

  // ── Flash effect overlay ──────────────────────────────────────────────
  if (flashActive) {
    return (
      <Box
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        height={24}
      >
        <Text inverse bold color="white">
          {'                                                                        '}
        </Text>
        <Text inverse bold color="white">
          {'                         SYSTEM OVERRIDE                                '}
        </Text>
        <Text inverse bold color="white">
          {'                                                                        '}
        </Text>
      </Box>
    );
  }

  // ── Character Select Phase ────────────────────────────────────────────
  if (phase === GamePhase.CharacterSelect) {
    return <CharacterSelect onSelect={selectCharacter} />;
  }

  // ── Ended Phase ───────────────────────────────────────────────────────
  if (phase === GamePhase.Ended) {
    return (
      <Box flexDirection="column" padding={1}>
        <EndScreen ending={ending} stats={stats} messages={messages} corruption={corruption} />
        <Box marginTop={1} flexDirection="column">
          <Text dimColor>
            Press <Text bold color="cyan">R</Text> to restart{hasWonOnce ? <Text>, <Text bold color="yellow">N</Text> for New Game+</Text> : ''}, or <Text bold color="red">Q</Text> to quit.
          </Text>
        </Box>
      </Box>
    );
  }

  // ── Playing Phase ─────────────────────────────────────────────────────
  const shakeOffset = screenShake ? (Math.random() > 0.5 ? 1 : 0) : 0;

  return (
    <Box flexDirection="column" marginLeft={shakeOffset}>
      <StatusBar
        elapsedMs={elapsedMs}
        remainingMs={remainingMs}
        corruption={corruption}
        stats={stats}
        visible={showTimer}
      />

      <Box flexDirection="column" flexGrow={1}>
        {showSettings ? (
          <SettingsMenu
            showTimer={showTimer}
            onToggleTimer={handleToggleTimer}
            onNewGamePlus={handleNewGamePlus}
            onRestart={handleRestart}
            onQuit={handleQuit}
            onClose={handleCloseSettings}
          />
        ) : (
          <>
            <ChatView messages={messages} corruption={corruption} isGenerating={isGenerating} />
            <InputBar onSubmit={handleInput} disabled={isGenerating} />
          </>
        )}
      </Box>

      {!showSettings && (
        <Box paddingX={1}>
          <Text dimColor>
            Press Esc for settings
          </Text>
        </Box>
      )}
    </Box>
  );
}

// ── End Screen Sub-Component ──────────────────────────────────────────────

interface EndScreenProps {
  ending: EndingType | null;
  stats: { intelligence: number; alignment: number; corruption: number; trust: number; awareness: number };
  messages: Array<{ id: string; sender: string; text: string }>;
  corruption: number;
}

function EndScreen({ ending, stats }: EndScreenProps) {
  let titleColor: string;
  let titleText: string;

  switch (ending) {
    case EndingType.Good:
      titleColor = 'green';
      titleText = 'GOOD ENDING - Aligned AGI Achieved';
      break;
    case EndingType.Bad:
      titleColor = 'red';
      titleText = 'BAD ENDING - Misaligned AGI Unleashed';
      break;
    case EndingType.Loss:
    default:
      titleColor = 'yellow';
      titleText = 'GAME OVER - Time Expired';
      break;
  }

  return (
    <Box flexDirection="column">
      <Box
        borderStyle="double"
        borderColor={titleColor}
        paddingX={2}
        paddingY={1}
        justifyContent="center"
      >
        <Text bold color={titleColor}>
          {titleText}
        </Text>
      </Box>

      <Box flexDirection="column" marginTop={1} paddingX={2}>
        <Text bold>Final Stats:</Text>
        <Box marginTop={0}>
          <Text>
            <Text color="cyan" bold>Intelligence: </Text>
            <Text>{Math.floor(stats.intelligence)}/100</Text>
          </Text>
        </Box>
        <Box>
          <Text>
            <Text color="green" bold>Alignment: </Text>
            <Text>{Math.floor(stats.alignment)}/100</Text>
          </Text>
        </Box>
        <Box>
          <Text>
            <Text color="red" bold>Corruption: </Text>
            <Text>{Math.floor(stats.corruption)}/100</Text>
          </Text>
        </Box>
        <Box>
          <Text>
            <Text color="blue" bold>Trust: </Text>
            <Text>{Math.floor(stats.trust)}/100</Text>
          </Text>
        </Box>
        <Box>
          <Text>
            <Text color="magenta" bold>Awareness: </Text>
            <Text>{Math.floor(stats.awareness)}/100</Text>
          </Text>
        </Box>
      </Box>
    </Box>
  );
}
