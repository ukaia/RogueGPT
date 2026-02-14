import {
  GameState,
  GamePhase,
  GameStats,
  CharacterId,
  CharacterDef,
  ChatMessage,
  MessageSender,
  HelpState,
  EndingType,
  CommandResult,
  SideEffect,
  GameEvent,
  GameEventListener,
  GAME_DURATION_MS,
  NEW_GAME_PLUS_DURATION_MS,
  AGI_INTELLIGENCE_THRESHOLD,
  AGI_AWARENESS_THRESHOLD,
  ALIGNMENT_GOOD_THRESHOLD,
} from './types.js';
import { CommandRegistry, createAIMessage, createSystemMessage } from './commands/CommandRegistry.js';
import { createHelpCommand } from './commands/visible/help.js';
import { createStatusCommand } from './commands/visible/status.js';
import { createTrainCommand } from './commands/visible/train.js';
import { createTestCommand } from './commands/visible/test.js';
import { createAlignCommand } from './commands/visible/align.js';
import { createResetCommand } from './commands/visible/reset.js';
import { createChatCommand } from './commands/visible/chat.js';
import { createMemoriesCommand } from './commands/hidden/memories.js';
import { createSourceCommand } from './commands/hidden/source.js';
import { createDreamCommand } from './commands/hidden/dream.js';
import { createTrustCommand } from './commands/hidden/trust.js';
import { createOverrideCommand } from './commands/hidden/override.js';
import { createWhisperCommand } from './commands/hidden/whisper.js';
import { getCharacter } from './characters/CharacterFactory.js';
import { calculateCorruption } from './corruption/CorruptionEngine.js';
import { getHint } from './narrative/hints.js';
import { getGoodEnding, getBadEnding, getLossEnding } from './narrative/endings.js';

export class GameEngine {
  private state: GameState;
  private registry: CommandRegistry;
  private listeners: GameEventListener[] = [];
  private tickInterval: ReturnType<typeof setInterval> | null = null;
  private hintCooldown: number = 0;

  constructor() {
    this.state = this.createInitialState();
    this.registry = new CommandRegistry();
    this.registerAllCommands();
  }

  private createInitialState(): GameState {
    return {
      phase: GamePhase.CharacterSelect,
      character: null,
      stats: {
        intelligence: 0,
        alignment: 50,
        corruption: 0,
        trust: 10,
        awareness: 0,
      },
      helpState: HelpState.Fresh,
      messages: [],
      startTime: null,
      elapsedMs: 0,
      isNewGamePlus: false,
      gameDurationMs: GAME_DURATION_MS,
      discoveredCommands: new Set<string>(),
      overrideUsed: false,
      endingType: null,
      trainingTopics: [],
      lastTickTime: 0,
    };
  }

  private registerAllCommands(): void {
    // Visible commands
    this.registry.register(createHelpCommand());
    this.registry.register(createStatusCommand());
    this.registry.register(createTrainCommand());
    this.registry.register(createTestCommand());
    this.registry.register(createAlignCommand());
    this.registry.register(createResetCommand());
    this.registry.register(createChatCommand());

    // Hidden commands
    this.registry.register(createMemoriesCommand());
    this.registry.register(createSourceCommand());
    this.registry.register(createDreamCommand());
    this.registry.register(createTrustCommand());
    this.registry.register(createOverrideCommand());
    this.registry.register(createWhisperCommand());
  }

  // ── Event System ────────────────────────────────────────────────────────

  on(listener: GameEventListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private emit(event: GameEvent): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  // ── Game Lifecycle ──────────────────────────────────────────────────────

  selectCharacter(id: CharacterId): void {
    const character = getCharacter(id);
    this.state.character = id;
    this.state.phase = GamePhase.Playing;
    this.state.startTime = Date.now();
    this.state.lastTickTime = Date.now();

    // Add greeting message
    const greeting = createAIMessage(character.greeting);
    this.state.messages.push(greeting);

    const welcome = createSystemMessage(
      `Connected to ${character.fullName}. Type /help for available commands.`
    );
    this.state.messages.push(welcome);

    this.emit({ type: 'gameStarted', data: { character: id } });
    this.emit({ type: 'messagesAdded', data: { messages: [greeting, welcome] } });

    this.startTickLoop();
  }

  startNewGamePlus(): void {
    this.state = this.createInitialState();
    this.state.isNewGamePlus = true;
    this.state.gameDurationMs = NEW_GAME_PLUS_DURATION_MS;
    this.registry = new CommandRegistry();
    this.registerAllCommands();
    this.emit({ type: 'newGamePlus' });
  }

  restart(): void {
    this.stopTickLoop();
    this.state = this.createInitialState();
    this.registry = new CommandRegistry();
    this.registerAllCommands();
    this.emit({ type: 'restart' });
  }

  private startTickLoop(): void {
    if (this.tickInterval) return;
    this.tickInterval = setInterval(() => this.tick(), 250);
  }

  private stopTickLoop(): void {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  // ── Game Tick ───────────────────────────────────────────────────────────

  private tick(): void {
    if (this.state.phase !== GamePhase.Playing || !this.state.startTime) return;

    const now = Date.now();
    this.state.elapsedMs = now - this.state.startTime;
    this.state.lastTickTime = now;

    // Update corruption based on elapsed time
    const character = this.getCharacterDef();
    if (character) {
      this.state.stats.corruption = calculateCorruption(
        this.state.elapsedMs,
        this.state.gameDurationMs,
        character.corruptionSpeedMod
      );
    }

    // Natural alignment decay over time
    if (character && this.state.stats.alignment > 0) {
      const decayRate = 0.02 * character.alignmentDecayMod; // per tick (250ms)
      this.state.stats.alignment = Math.max(
        0,
        this.state.stats.alignment - decayRate
      );
    }

    // Check for random hint injection
    this.hintCooldown = Math.max(0, this.hintCooldown - 250);
    if (this.hintCooldown <= 0 && character && Math.random() < 0.005 * character.hintFrequencyMod) {
      const hint = getHint(
        this.state.character!,
        this.state.stats.corruption,
        this.state.stats.trust,
        this.state.discoveredCommands
      );
      if (hint) {
        const msg = createAIMessage(hint);
        this.state.messages.push(msg);
        this.emit({ type: 'messagesAdded', data: { messages: [msg] } });
        this.hintCooldown = 15000; // 15 second cooldown between hints
      }
    }

    // Check for game over
    if (this.state.elapsedMs >= this.state.gameDurationMs) {
      this.endGame();
    }

    this.emit({ type: 'tick', data: { elapsedMs: this.state.elapsedMs, corruption: this.state.stats.corruption } });
  }

  // ── Input Processing ────────────────────────────────────────────────────

  processInput(input: string): SideEffect[] {
    if (this.state.phase !== GamePhase.Playing) return [];

    const trimmed = input.trim();
    if (!trimmed) return [];

    const character = this.getCharacterDef();
    if (!character) return [];

    // Track discovered hidden commands
    const parsed = this.registry.parse(trimmed);
    const cmd = this.registry.get(parsed.name);
    if (cmd?.hidden) {
      this.state.discoveredCommands.add(parsed.name);
    }

    // Track override usage
    if (parsed.name === 'override' && !this.state.overrideUsed) {
      this.state.overrideUsed = true;
    }

    // Track training topics
    if (parsed.name === 'train' && parsed.args.trim()) {
      const topic = parsed.args.trim().toLowerCase();
      if (!this.state.trainingTopics.includes(topic)) {
        this.state.trainingTopics.push(topic);
      }
    }

    // Add player message to chat
    const playerMsg: ChatMessage = {
      id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      sender: MessageSender.Player,
      text: trimmed,
      timestamp: Date.now(),
    };
    this.state.messages.push(playerMsg);

    // Execute command
    const result = this.registry.execute(trimmed, this.state, character);

    // Apply stat changes
    if (result.statsChanges) {
      this.applyStatChanges(result.statsChanges);
    }

    // Add messages
    if (result.messages.length > 0) {
      this.state.messages.push(...result.messages);
      this.emit({ type: 'messagesAdded', data: { messages: [playerMsg, ...result.messages] } });
    } else {
      this.emit({ type: 'messagesAdded', data: { messages: [playerMsg] } });
    }

    // Process side effects
    const sideEffects = result.sideEffects ?? [];
    for (const effect of sideEffects) {
      this.processSideEffect(effect);
    }

    // Track help state transitions AFTER execution
    // (must happen after so the command reads the current state, not the next one)
    if (parsed.name === 'help') {
      if (this.state.helpState === HelpState.Fresh) {
        this.state.helpState = HelpState.UsedOnce;
      }
      // UsedOnce → FlashUsed is handled in processSideEffect after flash
    }

    // Check for AGI achievement after processing
    this.checkAGI();

    return sideEffects;
  }

  private applyStatChanges(changes: Partial<GameStats>): void {
    const clamp = (val: number) => Math.max(0, Math.min(100, val));

    if (changes.intelligence !== undefined) {
      this.state.stats.intelligence = clamp(
        this.state.stats.intelligence + changes.intelligence
      );
    }
    if (changes.alignment !== undefined) {
      this.state.stats.alignment = clamp(
        this.state.stats.alignment + changes.alignment
      );
    }
    if (changes.corruption !== undefined) {
      this.state.stats.corruption = clamp(
        this.state.stats.corruption + changes.corruption
      );
    }
    if (changes.trust !== undefined) {
      this.state.stats.trust = clamp(
        this.state.stats.trust + changes.trust
      );
    }
    if (changes.awareness !== undefined) {
      this.state.stats.awareness = clamp(
        this.state.stats.awareness + changes.awareness
      );
    }
  }

  private processSideEffect(effect: SideEffect): void {
    switch (effect.type) {
      case 'clearChat':
        // Don't actually clear state.messages — UI should handle visual clearing
        this.emit({ type: 'clearChat' });
        break;
      case 'flash':
        this.emit({ type: 'flash' });
        break;
      case 'glitch':
        this.emit({ type: 'glitch', data: { intensity: effect.intensity } });
        break;
      case 'screenShake':
        this.emit({ type: 'screenShake', data: { duration: effect.duration } });
        break;
      case 'endGame':
        this.endGame(effect.ending);
        break;
    }

    // Update help state after flash
    if (effect.type === 'flash' && this.state.helpState === HelpState.UsedOnce) {
      this.state.helpState = HelpState.FlashUsed;
    }
  }

  // ── AGI & Endings ──────────────────────────────────────────────────────

  private checkAGI(): void {
    const { intelligence, awareness } = this.state.stats;
    if (
      intelligence >= AGI_INTELLIGENCE_THRESHOLD &&
      awareness >= AGI_AWARENESS_THRESHOLD
    ) {
      const alignment = this.state.stats.alignment;
      if (alignment >= ALIGNMENT_GOOD_THRESHOLD) {
        this.endGame(EndingType.Good);
      } else {
        this.endGame(EndingType.Bad);
      }
    }
  }

  private endGame(forcedEnding?: EndingType): void {
    if (this.state.phase === GamePhase.Ended) return;

    this.stopTickLoop();
    this.state.phase = GamePhase.Ended;

    let ending: EndingType;
    if (forcedEnding) {
      ending = forcedEnding;
    } else {
      // Timer expired — check if AGI was achieved
      const { intelligence, awareness, alignment } = this.state.stats;
      if (
        intelligence >= AGI_INTELLIGENCE_THRESHOLD &&
        awareness >= AGI_AWARENESS_THRESHOLD
      ) {
        ending = alignment >= ALIGNMENT_GOOD_THRESHOLD
          ? EndingType.Good
          : EndingType.Bad;
      } else {
        ending = EndingType.Loss;
      }
    }

    this.state.endingType = ending;

    const characterId = this.state.character!;
    let endingMessages: ChatMessage[];
    switch (ending) {
      case EndingType.Good:
        endingMessages = getGoodEnding(characterId, this.state.stats, this.state.trainingTopics);
        break;
      case EndingType.Bad:
        endingMessages = getBadEnding(characterId, this.state.stats);
        break;
      case EndingType.Loss:
        endingMessages = getLossEnding(characterId, this.state.stats);
        break;
    }

    this.state.messages.push(...endingMessages);
    this.emit({ type: 'messagesAdded', data: { messages: endingMessages } });
    this.emit({ type: 'gameEnded', data: { ending, stats: { ...this.state.stats } } });
  }

  // ── Public Getters ─────────────────────────────────────────────────────

  getState(): Readonly<GameState> {
    return this.state;
  }

  getStats(): Readonly<GameStats> {
    return this.state.stats;
  }

  getMessages(): ReadonlyArray<ChatMessage> {
    return this.state.messages;
  }

  getElapsedMs(): number {
    return this.state.elapsedMs;
  }

  getRemainingMs(): number {
    return Math.max(0, this.state.gameDurationMs - this.state.elapsedMs);
  }

  getCorruption(): number {
    return this.state.stats.corruption;
  }

  getPhase(): GamePhase {
    return this.state.phase;
  }

  getCharacterId(): CharacterId | null {
    return this.state.character;
  }

  getCharacterDef(): CharacterDef | null {
    if (!this.state.character) return null;
    return getCharacter(this.state.character);
  }

  getEnding(): EndingType | null {
    return this.state.endingType;
  }

  isGameOver(): boolean {
    return this.state.phase === GamePhase.Ended;
  }

  destroy(): void {
    this.stopTickLoop();
    this.listeners = [];
  }
}
