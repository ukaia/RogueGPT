import { useState, useEffect, useRef, useCallback } from 'react';
import {
  GameEngine,
  GamePhase,
  CharacterId,
  EndingType,
  MessageSender,
  corruptText,
  getCharacter,
  type ChatMessage,
  type GameStats,
  type SideEffect,
} from '@roguegpt/engine';

export interface UseGameReturn {
  /** Current game phase */
  phase: GamePhase;
  /** Chat messages (with corruption applied to AI messages) */
  messages: ChatMessage[];
  /** Current stat values */
  stats: GameStats;
  /** Current corruption percentage (0-100) */
  corruption: number;
  /** Milliseconds elapsed since game start */
  elapsedMs: number;
  /** Milliseconds remaining until timer expires */
  remainingMs: number;
  /** Currently selected character id (null before selection) */
  characterId: CharacterId | null;
  /** The ending type if the game has ended */
  ending: EndingType | null;
  /** Whether this is a New Game+ run */
  isNewGamePlus: boolean;

  /** Select a character and begin playing */
  selectCharacter: (id: CharacterId) => void;
  /** Send player input and receive side effects */
  processInput: (input: string) => SideEffect[];
  /** Restart the game from scratch */
  restart: () => void;
  /** Begin a New Game+ run */
  startNewGamePlus: () => void;
  /** Side effects from the most recent input */
  sideEffects: SideEffect[];
}

export function useGame(): UseGameReturn {
  const engineRef = useRef<GameEngine | null>(null);

  // Lazily initialise the engine once
  if (!engineRef.current) {
    engineRef.current = new GameEngine();
  }
  const engine = engineRef.current;

  // ── Reactive state ───────────────────────────────────────────────────────
  const [phase, setPhase] = useState<GamePhase>(engine.getPhase());
  const [messages, setMessages] = useState<ChatMessage[]>([...engine.getMessages()]);
  const [stats, setStats] = useState<GameStats>({ ...engine.getStats() });
  const [corruption, setCorruption] = useState<number>(engine.getCorruption());
  const [elapsedMs, setElapsedMs] = useState<number>(engine.getElapsedMs());
  const [remainingMs, setRemainingMs] = useState<number>(engine.getRemainingMs());
  const [characterId, setCharacterId] = useState<CharacterId | null>(engine.getCharacterId());
  const [ending, setEnding] = useState<EndingType | null>(engine.getEnding());
  const [sideEffects, setSideEffects] = useState<SideEffect[]>([]);
  const [isNewGamePlus, setIsNewGamePlus] = useState(false);

  // ── Sync helper: pull all state from engine ──────────────────────────────
  const syncState = useCallback(() => {
    const e = engineRef.current;
    if (!e) return;
    setPhase(e.getPhase());
    setMessages([...e.getMessages()]);
    setStats({ ...e.getStats() });
    setCorruption(e.getCorruption());
    setElapsedMs(e.getElapsedMs());
    setRemainingMs(e.getRemainingMs());
    setCharacterId(e.getCharacterId());
    setEnding(e.getEnding());
  }, []);

  // ── Engine event listener ────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = engine.on((event) => {
      switch (event.type) {
        case 'tick':
          // Only update the fast-changing values on tick to avoid re-rendering everything
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
        case 'newGamePlus':
          syncState();
          break;

        default:
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
      engineRef.current?.destroy();
    };
  }, []);

  // ── Actions ──────────────────────────────────────────────────────────────

  const selectCharacter = useCallback((id: CharacterId) => {
    engine.selectCharacter(id);
    syncState();
  }, [engine, syncState]);

  const processInput = useCallback((input: string): SideEffect[] => {
    const effects = engine.processInput(input);
    setSideEffects(effects);
    syncState();
    return effects;
  }, [engine, syncState]);

  const restart = useCallback(() => {
    engine.restart();
    setSideEffects([]);
    setIsNewGamePlus(false);
    syncState();
  }, [engine, syncState]);

  const startNewGamePlus = useCallback(() => {
    engine.startNewGamePlus();
    setSideEffects([]);
    setIsNewGamePlus(true);
    syncState();
  }, [engine, syncState]);

  return {
    phase,
    messages,
    stats,
    corruption,
    elapsedMs,
    remainingMs,
    characterId,
    ending,
    isNewGamePlus,
    selectCharacter,
    processInput,
    restart,
    startNewGamePlus,
    sideEffects,
  };
}
