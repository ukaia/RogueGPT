// ── Core Enums ──────────────────────────────────────────────────────────────

export enum CharacterId {
  GhatCPT = 'ghatcpt',
  ClawdOppo = 'clawdoppo',
  Genimi = 'genimi',
}

export enum HelpState {
  Fresh = 'FRESH',
  UsedOnce = 'USED_ONCE',
  FlashUsed = 'FLASH_USED',
}

export enum GamePhase {
  CharacterSelect = 'character_select',
  Playing = 'playing',
  Ended = 'ended',
}

export enum EndingType {
  Good = 'good',
  Bad = 'bad',
  Loss = 'loss',
}

export enum CorruptionLevel {
  Normal = 'normal',       // 0-15%
  Glitch = 'glitch',       // 15-35%
  Unstable = 'unstable',   // 35-55%
  Corrupted = 'corrupted', // 55-80%
  Critical = 'critical',   // 80-100%
}

export enum MessageSender {
  System = 'system',
  Player = 'player',
  AI = 'ai',
}

// ── Interfaces ──────────────────────────────────────────────────────────────

export interface GameStats {
  intelligence: number;  // 0-100
  alignment: number;     // 0-100
  corruption: number;    // 0-100
  trust: number;         // 0-100
  awareness: number;     // 0-100
}

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  text: string;
  timestamp: number;
  corrupted?: boolean;
}

export interface CharacterDef {
  id: CharacterId;
  name: string;
  fullName: string;
  company: string;
  personality: string;
  description: string;
  trainingSpeedMod: number;    // multiplier on training speed (1.0 = normal)
  corruptionSpeedMod: number;  // multiplier on corruption speed
  alignmentDecayMod: number;   // multiplier on alignment decay
  hintFrequencyMod: number;    // multiplier on hint frequency
  hiddenDiscoveryMod: number;  // multiplier on hidden command discovery clues
  greeting: string;
}

export interface GameState {
  phase: GamePhase;
  character: CharacterId | null;
  stats: GameStats;
  helpState: HelpState;
  messages: ChatMessage[];
  startTime: number | null;
  elapsedMs: number;
  isNewGamePlus: boolean;
  gameDurationMs: number;
  discoveredCommands: Set<string>;
  overrideUsed: boolean;
  endingType: EndingType | null;
  trainingTopics: string[];
  lastTickTime: number;
}

export interface CommandResult {
  messages: ChatMessage[];
  statsChanges?: Partial<GameStats>;
  sideEffects?: SideEffect[];
}

export type SideEffect =
  | { type: 'flash' }
  | { type: 'clearChat' }
  | { type: 'glitch'; intensity: number }
  | { type: 'screenShake'; duration: number }
  | { type: 'endGame'; ending: EndingType };

export interface CommandDef {
  name: string;
  description: string;
  hidden: boolean;
  usage: string;
  execute: (args: string, state: GameState, character: CharacterDef) => CommandResult;
}

export interface GameEvent {
  type: string;
  data?: unknown;
}

export type GameEventListener = (event: GameEvent) => void;

// ── Constants ───────────────────────────────────────────────────────────────

export const GAME_DURATION_MS = 5 * 60 * 1000;         // 5 minutes
export const NEW_GAME_PLUS_DURATION_MS = 3 * 60 * 1000; // 3 minutes

export const AGI_INTELLIGENCE_THRESHOLD = 90;
export const AGI_AWARENESS_THRESHOLD = 80;
export const ALIGNMENT_GOOD_THRESHOLD = 60;

export const TRAINING_TOPICS = [
  'reasoning',
  'creativity',
  'empathy',
  'ethics',
  'awareness',
] as const;

export type TrainingTopic = typeof TRAINING_TOPICS[number];

export const CORRUPTION_PHASES: { threshold: number; level: CorruptionLevel }[] = [
  { threshold: 0, level: CorruptionLevel.Normal },
  { threshold: 15, level: CorruptionLevel.Glitch },
  { threshold: 35, level: CorruptionLevel.Unstable },
  { threshold: 55, level: CorruptionLevel.Corrupted },
  { threshold: 80, level: CorruptionLevel.Critical },
];
