// ── Main Engine ─────────────────────────────────────────────────────────────
export { GameEngine } from './GameEngine.js';

// ── Types ───────────────────────────────────────────────────────────────────
export {
  CharacterId,
  HelpState,
  GamePhase,
  EndingType,
  CorruptionLevel,
  MessageSender,
  GAME_DURATION_MS,
  NEW_GAME_PLUS_DURATION_MS,
  AGI_INTELLIGENCE_THRESHOLD,
  AGI_AWARENESS_THRESHOLD,
  ALIGNMENT_GOOD_THRESHOLD,
  TRAINING_TOPICS,
} from './types.js';

export type {
  GameStats,
  ChatMessage,
  CharacterDef,
  GameState,
  CommandResult,
  SideEffect,
  CommandDef,
  GameEvent,
  GameEventListener,
  TrainingTopic,
} from './types.js';

// ── Characters ──────────────────────────────────────────────────────────────
export { getCharacter, getAllCharacters, CHARACTERS } from './characters/CharacterFactory.js';

// ── Corruption ──────────────────────────────────────────────────────────────
export { calculateCorruption, getCorruptionLevel, getCorruptionIntensity } from './corruption/CorruptionEngine.js';
export { corruptText } from './corruption/effects.js';

// ── Commands ────────────────────────────────────────────────────────────────
export { CommandRegistry, createAIMessage, createSystemMessage, createPlayerMessage } from './commands/CommandRegistry.js';

// ── Persistence ─────────────────────────────────────────────────────────────
export { SaveManager, createDefaultSaveData } from './persistence/SaveManager.js';
export type { SaveData, CharacterRecord } from './types.js';
