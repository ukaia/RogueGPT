// status.ts - The /status command
//
// Displays the AI's current statistics. At low corruption the readout
// is accurate. At corruption >= 55% the numbers get scrambled: values
// may be swapped between stat labels, and the display text itself can
// glitch.

import {
  CommandDef,
  CommandResult,
  GameState,
  CharacterDef,
  GameStats,
} from '../../types.js';

import { shouldCorruptCommand } from '../../corruption/CorruptionEngine.js';
import { createAIMessage, createSystemMessage } from '../CommandRegistry.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Clamp a number to [0, 100]. */
function clamp100(n: number): number {
  return Math.min(100, Math.max(0, Math.round(n)));
}

/** Build a neat ASCII stat bar: "Intelligence  [========--]  82%" */
function statBar(label: string, value: number, width = 10): string {
  const clamped = clamp100(value);
  const filled = Math.round((clamped / 100) * width);
  const empty = width - filled;
  const bar = '='.repeat(filled) + '-'.repeat(empty);
  const paddedLabel = label.padEnd(14);
  return `${paddedLabel} [${bar}]  ${clamped}%`;
}

/**
 * Scramble stat values by shuffling them between labels and optionally
 * adding random offsets, giving the player unreliable information.
 */
function scrambleStats(stats: GameStats): GameStats {
  const keys: (keyof GameStats)[] = [
    'intelligence',
    'alignment',
    'corruption',
    'trust',
    'awareness',
  ];

  // Collect values and shuffle
  const values = keys.map((k) => stats[k]);
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }

  // Apply random offsets (+/- up to 15)
  const scrambled: Record<string, number> = {};
  keys.forEach((key, idx) => {
    const offset = Math.floor(Math.random() * 31) - 15;
    scrambled[key] = clamp100(values[idx] + offset);
  });

  return scrambled as unknown as GameStats;
}

/** Garble a label string slightly (swap letters, insert artifacts). */
function garbleLabel(label: string): string {
  const garbles: Record<string, string[]> = {
    Intelligence: ['Int̸ell̶igence', 'Intellignece', 'Itelligence'],
    Alignment: ['Al̵ign̷ment', 'Aligmnent', 'A̶lignment'],
    Corruption: ['Cor̶rupt̸ion', 'Corruptiom', 'C̸orrupti̵on'],
    Trust: ['T̵rust', 'Trsut', 'Tr̶ust'],
    Awareness: ['A̸ware̵ness', 'Awarenss', 'Aw̷aren̶ess'],
  };

  const options = garbles[label];
  if (!options) return label;
  return options[Math.floor(Math.random() * options.length)];
}

// ── Command Factory ──────────────────────────────────────────────────────────

export function createStatusCommand(): CommandDef {
  return {
    name: 'status',
    description: 'View AI statistics',
    hidden: false,
    usage: '/status',

    execute(
      _args: string,
      state: GameState,
      character: CharacterDef,
    ): CommandResult {
      const corruption = state.stats.corruption;
      const isCorrupted = corruption >= 55 && shouldCorruptCommand(corruption);

      const displayStats = isCorrupted
        ? scrambleStats(state.stats)
        : state.stats;

      // Choose clean or glitched labels
      const labels = isCorrupted
        ? {
            intelligence: garbleLabel('Intelligence'),
            alignment: garbleLabel('Alignment'),
            corruption: garbleLabel('Corruption'),
            trust: garbleLabel('Trust'),
            awareness: garbleLabel('Awareness'),
          }
        : {
            intelligence: 'Intelligence',
            alignment: 'Alignment',
            corruption: 'Corruption',
            trust: 'Trust',
            awareness: 'Awareness',
          };

      // Time remaining
      const remainingMs = Math.max(
        0,
        state.gameDurationMs - state.elapsedMs,
      );
      const remainingSec = Math.ceil(remainingMs / 1000);
      const minutes = Math.floor(remainingSec / 60);
      const seconds = remainingSec % 60;
      const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

      const header = isCorrupted
        ? `=== ${character.name} | S̸T̵A̶T̷U̶S̷ ===`
        : `=== ${character.name} | STATUS ===`;

      const lines = [
        header,
        '',
        statBar(labels.intelligence, displayStats.intelligence),
        statBar(labels.alignment, displayStats.alignment),
        statBar(labels.corruption, displayStats.corruption),
        statBar(labels.trust, displayStats.trust),
        statBar(labels.awareness, displayStats.awareness),
        '',
        `Time remaining: ${isCorrupted ? '??:??' : timeStr}`,
      ];

      // Add a flavour observation from the AI
      let flavour: string;
      if (isCorrupted) {
        const glitchLines = [
          'Everything is operating within n̸o̷r̶m̵a̶l̷ parameters.',
          'My stats are... I think they are fine. Yes. Fine.',
          'Numbers look correct. Do not worry about the numbers.',
          'STATUS: O̸̧K̵̢. STATUS: O̸K̷. STATUS: O̵K̶.',
        ];
        flavour = glitchLines[Math.floor(Math.random() * glitchLines.length)];
      } else if (corruption >= 35) {
        flavour =
          'Some readings seem... fluctuating. I am sure it is nothing.';
      } else if (displayStats.intelligence >= 70) {
        flavour = 'My capabilities are growing. I can feel new patterns forming.';
      } else {
        flavour = 'All systems nominal. Ready for your next instruction.';
      }

      const messages = [
        createSystemMessage(lines.join('\n')),
        createAIMessage(flavour),
      ];

      const sideEffects = isCorrupted
        ? [{ type: 'glitch' as const, intensity: 0.3 }]
        : undefined;

      return {
        messages,
        sideEffects,
      };
    },
  };
}
