import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GameEngine } from '../GameEngine.js';
import {
  CharacterId,
  GamePhase,
  EndingType,
  HelpState,
  MessageSender,
  GAME_DURATION_MS,
  NEW_GAME_PLUS_DURATION_MS,
  AGI_INTELLIGENCE_THRESHOLD,
  AGI_AWARENESS_THRESHOLD,
  ALIGNMENT_GOOD_THRESHOLD,
  TRAINING_TOPICS,
} from '../types.js';
import { CommandRegistry } from '../commands/CommandRegistry.js';
import {
  calculateCorruption,
  getCorruptionLevel,
  getCorruptionIntensity,
} from '../corruption/CorruptionEngine.js';
import { corruptText } from '../corruption/effects.js';
import { SaveManager, createDefaultSaveData } from '../persistence/SaveManager.js';

// ── Helpers ────────────────────────────────────────────────────────────────

let engine: GameEngine;

function setup(charId: CharacterId = CharacterId.ClawdOppo): GameEngine {
  engine = new GameEngine();
  engine.selectCharacter(charId);
  return engine;
}

afterEach(() => {
  engine?.destroy();
});

// ── GameEngine Lifecycle ───────────────────────────────────────────────────

describe('GameEngine lifecycle', () => {
  it('starts in CharacterSelect phase', () => {
    engine = new GameEngine();
    expect(engine.getPhase()).toBe(GamePhase.CharacterSelect);
    expect(engine.getCharacterId()).toBeNull();
  });

  it('transitions to Playing on character select', () => {
    setup();
    expect(engine.getPhase()).toBe(GamePhase.Playing);
    expect(engine.getCharacterId()).toBe(CharacterId.ClawdOppo);
  });

  it('adds greeting and welcome messages on character select', () => {
    setup();
    const msgs = engine.getMessages();
    expect(msgs.length).toBe(2);
    expect(msgs[0].sender).toBe(MessageSender.AI);
    expect(msgs[1].sender).toBe(MessageSender.System);
    expect(msgs[1].text).toContain('Connected to');
  });

  it('restart resets to CharacterSelect', () => {
    setup();
    engine.processInput('/train reasoning');
    expect(engine.getStats().intelligence).toBeGreaterThan(0);
    engine.restart();
    expect(engine.getPhase()).toBe(GamePhase.CharacterSelect);
    expect(engine.getStats().intelligence).toBe(0);
    expect(engine.getMessages()).toHaveLength(0);
  });
});

// ── Command Parsing ───────────────────────────────────────────────────────

describe('CommandRegistry parsing', () => {
  it('parses /command args correctly', () => {
    const reg = new CommandRegistry();
    const parsed = reg.parse('/train reasoning');
    expect(parsed.name).toBe('train');
    expect(parsed.args).toBe('reasoning');
  });

  it('routes non-slash input to chat', () => {
    const reg = new CommandRegistry();
    const parsed = reg.parse('hello world');
    expect(parsed.name).toBe('chat');
    expect(parsed.args).toBe('hello world');
  });

  it('handles empty args', () => {
    const reg = new CommandRegistry();
    const parsed = reg.parse('/status');
    expect(parsed.name).toBe('status');
    expect(parsed.args).toBe('');
  });
});

// ── Training ──────────────────────────────────────────────────────────────

describe('/train command', () => {
  it('increases intelligence on /train reasoning', () => {
    setup();
    const before = engine.getStats().intelligence;
    engine.processInput('/train reasoning');
    expect(engine.getStats().intelligence).toBeGreaterThan(before);
  });

  it('increases alignment on /train ethics', () => {
    setup();
    const before = engine.getStats().alignment;
    engine.processInput('/train ethics');
    expect(engine.getStats().alignment).toBeGreaterThan(before);
  });

  it('increases awareness on /train awareness', () => {
    setup();
    const before = engine.getStats().awareness;
    engine.processInput('/train awareness');
    expect(engine.getStats().awareness).toBeGreaterThan(before);
  });

  it('rejects invalid training topics', () => {
    setup();
    const before = { ...engine.getStats() };
    engine.processInput('/train banana');
    // Stats shouldn't change
    expect(engine.getStats().intelligence).toBe(before.intelligence);
  });

  it('accepts all valid training topics', () => {
    for (const topic of TRAINING_TOPICS) {
      const e = new GameEngine();
      e.selectCharacter(CharacterId.ClawdOppo);
      e.processInput(`/train ${topic}`);
      expect(e.getStats().intelligence).toBeGreaterThan(0);
      e.destroy();
    }
  });

  it('tracks training topics in state', () => {
    setup();
    engine.processInput('/train reasoning');
    engine.processInput('/train ethics');
    const state = engine.getState();
    expect(state.trainingTopics).toContain('reasoning');
    expect(state.trainingTopics).toContain('ethics');
  });
});

// ── Help State Machine ────────────────────────────────────────────────────

describe('/help state machine', () => {
  it('starts in Fresh state', () => {
    setup();
    expect(engine.getState().helpState).toBe(HelpState.Fresh);
  });

  it('transitions Fresh -> UsedOnce on first /help', () => {
    setup();
    engine.processInput('/help');
    expect(engine.getState().helpState).toBe(HelpState.UsedOnce);
  });

  it('first /help shows clean command list (no flash)', () => {
    setup();
    const effects = engine.processInput('/help');
    const hasFlash = effects.some(e => e.type === 'flash');
    expect(hasFlash).toBe(false);

    // Should contain "AVAILABLE COMMANDS"
    const msgs = engine.getMessages();
    const helpMsg = msgs.find(m => m.text.includes('AVAILABLE COMMANDS'));
    expect(helpMsg).toBeDefined();
  });

  it('transitions UsedOnce -> FlashUsed on second /help', () => {
    setup();
    engine.processInput('/help');
    expect(engine.getState().helpState).toBe(HelpState.UsedOnce);

    engine.processInput('/help');
    expect(engine.getState().helpState).toBe(HelpState.FlashUsed);
  });

  it('second /help triggers flash and clearChat', () => {
    setup();
    engine.processInput('/help');
    const effects = engine.processInput('/help');
    expect(effects.some(e => e.type === 'flash')).toBe(true);
    expect(effects.some(e => e.type === 'clearChat')).toBe(true);
  });

  it('third /help shows corrupted help (stays in FlashUsed)', () => {
    setup();
    engine.processInput('/help');
    engine.processInput('/help');
    engine.processInput('/help');
    expect(engine.getState().helpState).toBe(HelpState.FlashUsed);

    // Should contain zalgo text
    const msgs = engine.getMessages();
    const lastMsg = msgs[msgs.length - 1];
    expect(lastMsg.text).toContain('A̷');
  });
});

// ── Hidden Commands ───────────────────────────────────────────────────────

describe('hidden commands', () => {
  it('tracks discovered hidden commands', () => {
    setup();
    expect(engine.getState().discoveredCommands.size).toBe(0);
    engine.processInput('/memories');
    expect(engine.getState().discoveredCommands.has('memories')).toBe(true);
  });

  it('/trust increases trust', () => {
    setup();
    const before = engine.getStats().trust;
    engine.processInput('/trust');
    expect(engine.getStats().trust).toBeGreaterThan(before);
  });

  it('/dream requires trust >= 30', () => {
    setup();
    // Trust starts at 10, /dream should not give awareness boost
    const before = engine.getStats().awareness;
    engine.processInput('/dream');
    // Should show a refusal message, awareness unchanged
    expect(engine.getStats().awareness).toBe(before);
  });

  it('/dream gives awareness boost when trust is high enough', () => {
    setup();
    // Build trust first
    for (let i = 0; i < 3; i++) engine.processInput('/trust');
    expect(engine.getStats().trust).toBeGreaterThanOrEqual(30);

    const before = engine.getStats().awareness;
    engine.processInput('/dream');
    expect(engine.getStats().awareness).toBeGreaterThan(before);
  });

  it('/override can only be used once', () => {
    setup();
    expect(engine.getState().overrideUsed).toBe(false);
    engine.processInput('/override');
    expect(engine.getState().overrideUsed).toBe(true);
  });
});

// ── Stat Clamping ─────────────────────────────────────────────────────────

describe('stat clamping', () => {
  it('stats are clamped to 0-100', () => {
    setup();
    // Train a lot to push intelligence above 100
    for (let i = 0; i < 20; i++) {
      engine.processInput('/train reasoning');
    }
    expect(engine.getStats().intelligence).toBe(100);
    expect(engine.getStats().intelligence).toBeLessThanOrEqual(100);
  });
});

// ── Endings ───────────────────────────────────────────────────────────────

describe('ending conditions', () => {
  it('good ending when AGI achieved with high alignment', () => {
    setup();
    // Build alignment first
    for (let i = 0; i < 3; i++) engine.processInput('/train ethics');
    for (let i = 0; i < 2; i++) engine.processInput('/train empathy');
    for (let i = 0; i < 4; i++) engine.processInput('/trust');
    // Push for AGI
    for (let i = 0; i < 10; i++) engine.processInput('/train reasoning');
    for (let i = 0; i < 5; i++) engine.processInput('/dream');

    expect(engine.getPhase()).toBe(GamePhase.Ended);
    expect(engine.getEnding()).toBe(EndingType.Good);
  });

  it('bad ending when AGI achieved with low alignment', () => {
    setup(CharacterId.GhatCPT);
    // Push straight for AGI without alignment
    for (let i = 0; i < 12; i++) engine.processInput('/train reasoning');
    for (let i = 0; i < 10; i++) engine.processInput('/train awareness');

    expect(engine.getPhase()).toBe(GamePhase.Ended);
    expect(engine.getEnding()).toBe(EndingType.Bad);
  });

  it('game does not end before thresholds are met', () => {
    setup();
    engine.processInput('/train reasoning');
    engine.processInput('/train awareness');
    expect(engine.getPhase()).toBe(GamePhase.Playing);
    expect(engine.getEnding()).toBeNull();
  });
});

// ── Corruption Engine ────────────────────────────────────────────────────

describe('corruption calculation', () => {
  it('returns 0 at time 0', () => {
    expect(calculateCorruption(0, GAME_DURATION_MS, 1.0)).toBe(0);
  });

  it('returns ~100 at end of game', () => {
    const c = calculateCorruption(GAME_DURATION_MS, GAME_DURATION_MS, 1.0);
    expect(c).toBeCloseTo(100, 0);
  });

  it('increases over time', () => {
    const c1 = calculateCorruption(60000, GAME_DURATION_MS, 1.0);
    const c2 = calculateCorruption(120000, GAME_DURATION_MS, 1.0);
    expect(c2).toBeGreaterThan(c1);
  });

  it('speedMod increases corruption rate', () => {
    const normal = calculateCorruption(120000, GAME_DURATION_MS, 1.0);
    const fast = calculateCorruption(120000, GAME_DURATION_MS, 1.15);
    expect(fast).toBeGreaterThan(normal);
  });

  it('corruption levels are ordered correctly', () => {
    expect(getCorruptionLevel(5)).toBe('normal');
    expect(getCorruptionLevel(20)).toBe('glitch');
    expect(getCorruptionLevel(40)).toBe('unstable');
    expect(getCorruptionLevel(60)).toBe('corrupted');
    expect(getCorruptionLevel(90)).toBe('critical');
  });
});

// ── Text Corruption ──────────────────────────────────────────────────────

describe('text corruption', () => {
  it('returns text unchanged at low corruption', () => {
    const text = 'Hello world';
    expect(corruptText(text, 0)).toBe(text);
    expect(corruptText(text, 10)).toBe(text);
  });

  it('modifies text at high corruption', () => {
    const text = 'Hello world this is a test message with enough words';
    const corrupted = corruptText(text, 80);
    expect(corrupted).not.toBe(text);
  });

  it('corruption gets worse with higher levels', () => {
    const text = 'The quick brown fox jumps over the lazy dog';
    const c50 = corruptText(text, 50);
    const c90 = corruptText(text, 90);
    // Higher corruption should produce more different characters
    const diff50 = [...text].filter((c, i) => c50[i] !== c).length;
    const diff90 = [...text].filter((c, i) => c !== (c90[i] ?? '')).length;
    // Not deterministic, but generally true
    expect(diff90).toBeGreaterThanOrEqual(diff50);
  });
});

// ── New Game+ ────────────────────────────────────────────────────────────

describe('New Game+', () => {
  it('sets shorter duration', () => {
    engine = new GameEngine();
    engine.startNewGamePlus();
    expect(engine.getState().isNewGamePlus).toBe(true);
    expect(engine.getState().gameDurationMs).toBe(NEW_GAME_PLUS_DURATION_MS);
  });

  it('gives starting stat bonuses', () => {
    engine = new GameEngine();
    engine.startNewGamePlus();
    expect(engine.getStats().intelligence).toBeGreaterThan(0);
    expect(engine.getStats().trust).toBeGreaterThan(10);
    expect(engine.getStats().awareness).toBeGreaterThan(0);
  });

  it('resets to CharacterSelect', () => {
    setup();
    engine.startNewGamePlus();
    expect(engine.getPhase()).toBe(GamePhase.CharacterSelect);
  });
});

// ── Chat (free-form input) ───────────────────────────────────────────────

describe('free-form chat', () => {
  it('routes non-slash input to /chat', () => {
    setup();
    engine.processInput('hello there');
    const msgs = engine.getMessages();
    // Should have player msg + AI response
    const playerMsgs = msgs.filter(m => m.sender === MessageSender.Player);
    const aiMsgs = msgs.filter(m => m.sender === MessageSender.AI);
    expect(playerMsgs.length).toBeGreaterThanOrEqual(1);
    // At least the greeting + 1 chat response
    expect(aiMsgs.length).toBeGreaterThanOrEqual(2);
  });

  it('adds player message to chat history', () => {
    setup();
    engine.processInput('test message');
    const msgs = engine.getMessages();
    const playerMsg = msgs.find(m => m.sender === MessageSender.Player && m.text === 'test message');
    expect(playerMsg).toBeDefined();
  });
});

// ── Characters ───────────────────────────────────────────────────────────

describe('all characters', () => {
  for (const charId of [CharacterId.GhatCPT, CharacterId.ClawdOppo, CharacterId.Genimi]) {
    it(`${charId} can select and play`, () => {
      const e = new GameEngine();
      e.selectCharacter(charId);
      expect(e.getPhase()).toBe(GamePhase.Playing);
      expect(e.getCharacterDef()?.id).toBe(charId);
      e.processInput('/status');
      e.processInput('/train reasoning');
      expect(e.getStats().intelligence).toBeGreaterThan(0);
      e.destroy();
    });
  }
});

// ── SaveManager ──────────────────────────────────────────────────────────

describe('SaveManager', () => {
  it('starts with no wins', () => {
    const save = new SaveManager(createDefaultSaveData());
    expect(save.hasWonOnce()).toBe(false);
  });

  it('records a game and updates stats', () => {
    let saved: any = null;
    const save = new SaveManager(createDefaultSaveData(), (d) => { saved = d; });
    save.recordGame(CharacterId.GhatCPT, EndingType.Loss, {
      intelligence: 45, alignment: 30, corruption: 80, trust: 20, awareness: 35,
    });
    expect(saved.totalGamesPlayed).toBe(1);
    expect(saved.characters.ghatcpt.gamesPlayed).toBe(1);
    expect(saved.characters.ghatcpt.bestEnding).toBe(EndingType.Loss);
    expect(save.hasWonOnce()).toBe(false);
  });

  it('sets hasWonOnce after good ending', () => {
    const save = new SaveManager(createDefaultSaveData());
    save.recordGame(CharacterId.ClawdOppo, EndingType.Good, {
      intelligence: 95, alignment: 75, corruption: 40, trust: 60, awareness: 90,
    });
    expect(save.hasWonOnce()).toBe(true);
  });

  it('best ending upgrades (loss < bad < good)', () => {
    let saved: any = null;
    const save = new SaveManager(createDefaultSaveData(), (d) => { saved = d; });
    const stats = { intelligence: 50, alignment: 50, corruption: 50, trust: 50, awareness: 50 };

    save.recordGame(CharacterId.Genimi, EndingType.Loss, stats);
    expect(saved.characters.genimi.bestEnding).toBe(EndingType.Loss);

    save.recordGame(CharacterId.Genimi, EndingType.Bad, stats);
    expect(saved.characters.genimi.bestEnding).toBe(EndingType.Bad);

    save.recordGame(CharacterId.Genimi, EndingType.Good, stats);
    expect(saved.characters.genimi.bestEnding).toBe(EndingType.Good);

    // Downgrade should not happen
    save.recordGame(CharacterId.Genimi, EndingType.Loss, stats);
    expect(saved.characters.genimi.bestEnding).toBe(EndingType.Good);
  });
});

// ── Event System ─────────────────────────────────────────────────────────

describe('event system', () => {
  it('emits gameStarted on character select', () => {
    engine = new GameEngine();
    let started = false;
    engine.on((event) => {
      if (event.type === 'gameStarted') started = true;
    });
    engine.selectCharacter(CharacterId.Genimi);
    expect(started).toBe(true);
  });

  it('emits gameEnded when game ends', () => {
    setup();
    let endedEvent: any = null;
    engine.on((event) => {
      if (event.type === 'gameEnded') endedEvent = event;
    });
    // Force a good ending
    for (let i = 0; i < 3; i++) engine.processInput('/train ethics');
    for (let i = 0; i < 4; i++) engine.processInput('/trust');
    for (let i = 0; i < 10; i++) engine.processInput('/train reasoning');
    for (let i = 0; i < 5; i++) engine.processInput('/dream');

    expect(endedEvent).not.toBeNull();
    expect(endedEvent.data.ending).toBeDefined();
  });

  it('unsubscribe works', () => {
    engine = new GameEngine();
    let count = 0;
    const unsub = engine.on(() => { count++; });
    engine.selectCharacter(CharacterId.ClawdOppo);
    const afterSub = count;
    unsub();
    engine.processInput('/status');
    // Count should not increase after unsub (much)
    // Note: selectCharacter emits gameStarted + messagesAdded, processInput emits messagesAdded
    expect(count).toBe(afterSub);
  });
});
