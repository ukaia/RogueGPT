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
  SaveManager,
  createDefaultSaveData,
  type SaveData,
} from '@roguegpt/engine';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

// ── File-based persistence ──────────────────────────────────────────────────

const SAVE_DIR = join(homedir(), '.roguegpt');
const SAVE_PATH = join(SAVE_DIR, 'save.json');

function loadSaveData(): SaveData {
  try {
    const raw = readFileSync(SAVE_PATH, 'utf-8');
    return JSON.parse(raw) as SaveData;
  } catch {
    return createDefaultSaveData();
  }
}

function persistSaveData(data: SaveData): void {
  try {
    mkdirSync(SAVE_DIR, { recursive: true });
    writeFileSync(SAVE_PATH, JSON.stringify(data, null, 2));
  } catch {
    // Silently fail — persistence is best-effort
  }
}

export interface UseGameReturn {
  phase: GamePhase;
  messages: ChatMessage[];
  stats: GameStats;
  corruption: number;
  elapsedMs: number;
  remainingMs: number;
  characterId: CharacterId | null;
  ending: EndingType | null;
  hasWonOnce: boolean;
  selectCharacter: (id: CharacterId) => void;
  processInput: (input: string) => SideEffect[];
  restart: () => void;
  startNewGamePlus: () => void;
  sideEffects: SideEffect[];
}

export function useGame(): UseGameReturn {
  const engineRef = useRef<GameEngine | null>(null);
  const saveRef = useRef<SaveManager | null>(null);

  // Lazily create the engine and save manager
  if (!engineRef.current) {
    engineRef.current = new GameEngine();
  }
  if (!saveRef.current) {
    saveRef.current = new SaveManager(loadSaveData(), persistSaveData);
  }

  const engine = engineRef.current;
  const save = saveRef.current;

  const [phase, setPhase] = useState<GamePhase>(engine.getPhase());
  const [messages, setMessages] = useState<ChatMessage[]>([...engine.getMessages()]);
  const [stats, setStats] = useState<GameStats>({ ...engine.getStats() });
  const [corruption, setCorruption] = useState<number>(engine.getCorruption());
  const [elapsedMs, setElapsedMs] = useState<number>(engine.getElapsedMs());
  const [remainingMs, setRemainingMs] = useState<number>(engine.getRemainingMs());
  const [characterId, setCharacterId] = useState<CharacterId | null>(engine.getCharacterId());
  const [ending, setEnding] = useState<EndingType | null>(engine.getEnding());
  const [sideEffects, setSideEffects] = useState<SideEffect[]>([]);
  const [hasWonOnce, setHasWonOnce] = useState<boolean>(save.hasWonOnce());

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

        case 'gameEnded': {
          syncState();
          const charId = engine.getCharacterId();
          const endType = engine.getEnding();
          if (charId && endType) {
            save.recordGame(charId, endType, { ...engine.getStats() });
            setHasWonOnce(save.hasWonOnce());
          }
          break;
        }

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
    hasWonOnce,
    selectCharacter,
    processInput,
    restart,
    startNewGamePlus,
    sideEffects,
  };
}
