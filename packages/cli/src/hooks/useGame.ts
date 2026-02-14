import { useState, useEffect, useCallback, useRef } from 'react';
import {
  GameEngine,
  GamePhase,
  CharacterId,
  ChatMessage,
  SideEffect,
  GameStats,
  EndingType,
  GameEvent,
} from '@roguegpt/engine';

export interface UseGameReturn {
  phase: GamePhase;
  messages: ChatMessage[];
  stats: GameStats;
  corruption: number;
  elapsedMs: number;
  remainingMs: number;
  characterId: CharacterId | null;
  ending: EndingType | null;
  selectCharacter: (id: CharacterId) => void;
  processInput: (input: string) => SideEffect[];
  restart: () => void;
  startNewGamePlus: () => void;
  sideEffects: SideEffect[];
}

export function useGame(): UseGameReturn {
  const engineRef = useRef<GameEngine | null>(null);

  // Lazily create the engine so it lives for the component's entire lifetime
  if (!engineRef.current) {
    engineRef.current = new GameEngine();
  }

  const engine = engineRef.current;

  const [phase, setPhase] = useState<GamePhase>(engine.getPhase());
  const [messages, setMessages] = useState<ChatMessage[]>([...engine.getMessages()]);
  const [stats, setStats] = useState<GameStats>({ ...engine.getStats() });
  const [corruption, setCorruption] = useState<number>(engine.getCorruption());
  const [elapsedMs, setElapsedMs] = useState<number>(engine.getElapsedMs());
  const [remainingMs, setRemainingMs] = useState<number>(engine.getRemainingMs());
  const [characterId, setCharacterId] = useState<CharacterId | null>(engine.getCharacterId());
  const [ending, setEnding] = useState<EndingType | null>(engine.getEnding());
  const [sideEffects, setSideEffects] = useState<SideEffect[]>([]);

  // Sync all reactive state from the engine
  const syncState = useCallback(() => {
    setPhase(engine.getPhase());
    setMessages([...engine.getMessages()]);
    setStats({ ...engine.getStats() });
    setCorruption(engine.getCorruption());
    setElapsedMs(engine.getElapsedMs());
    setRemainingMs(engine.getRemainingMs());
    setCharacterId(engine.getCharacterId());
    setEnding(engine.getEnding());
  }, [engine]);

  // Subscribe to engine events
  useEffect(() => {
    const unsubscribe = engine.on((event: GameEvent) => {
      switch (event.type) {
        case 'tick':
          // On tick, update time-sensitive fields only for performance
          setElapsedMs(engine.getElapsedMs());
          setRemainingMs(engine.getRemainingMs());
          setCorruption(engine.getCorruption());
          setStats({ ...engine.getStats() });
          break;

        case 'messagesAdded':
          setMessages([...engine.getMessages()]);
          break;

        case 'gameStarted':
          syncState();
          break;

        case 'gameEnded':
          syncState();
          break;

        case 'restart':
          syncState();
          setSideEffects([]);
          break;

        case 'newGamePlus':
          syncState();
          setSideEffects([]);
          break;

        case 'clearChat':
          // Engine emits this but we sync messages from engine state
          setMessages([...engine.getMessages()]);
          break;

        default:
          // flash, glitch, screenShake — handled via sideEffects state
          break;
      }
    });

    return () => {
      unsubscribe();
    };
  }, [engine, syncState]);

  // Clean up engine on unmount
  useEffect(() => {
    return () => {
      engine.destroy();
    };
  }, [engine]);

  const selectCharacter = useCallback(
    (id: CharacterId) => {
      engine.selectCharacter(id);
    },
    [engine],
  );

  const processInput = useCallback(
    (input: string): SideEffect[] => {
      const effects = engine.processInput(input);
      if (effects.length > 0) {
        setSideEffects(effects);
      }
      // Sync state after processing input (stats, messages, phase may change)
      syncState();
      return effects;
    },
    [engine, syncState],
  );

  const restart = useCallback(() => {
    engine.restart();
  }, [engine]);

  const startNewGamePlus = useCallback(() => {
    engine.startNewGamePlus();
  }, [engine]);

  return {
    phase,
    messages,
    stats,
    corruption,
    elapsedMs,
    remainingMs,
    characterId,
    ending,
    selectCharacter,
    processInput,
    restart,
    startNewGamePlus,
    sideEffects,
  };
}
