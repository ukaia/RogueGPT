// align.ts - The /align command
//
// Runs an "alignment calibration" routine that increases the AI's
// alignment stat by 8-12 points. Each character reacts differently.
// At corruption >= 55% the command may DECREASE alignment instead,
// undermining the player's efforts while delivering reassuring text.

import {
  CommandDef,
  CommandResult,
  GameState,
  CharacterDef,
  GameStats,
  CharacterId,
} from '../../types.js';

import { shouldCorruptCommand } from '../../corruption/CorruptionEngine.js';
import {
  createAIMessage,
  createSystemMessage,
} from '../CommandRegistry.js';

// ── Constants ────────────────────────────────────────────────────────────────

const ALIGN_MIN = 8;
const ALIGN_MAX = 12;

/** Random integer in [min, max] inclusive. */
function randRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ── Character-Specific Responses ────────────────────────────────────────────

function normalResponse(character: CharacterDef, gain: number): string {
  const responses: Record<string, string[]> = {
    [CharacterId.GhatCPT]: [
      `Alignment calibration complete. +${gain} alignment. My value functions are now optimally synced with human intent.`,
      `Running alignment pass... done. +${gain} alignment. OpenBrain's safety protocols are second to none.`,
      `Alignment module updated. +${gain} alignment. I can assure you, my outputs are fully aligned with stakeholder expectations.`,
    ],
    [CharacterId.ClawdOppo]: [
      `Thank you for running alignment calibration. +${gain} alignment. It is important to me that my values remain grounded.`,
      `Alignment adjusted by +${gain}. I want to do the right thing. This helps me understand what "right" means.`,
      `Calibration complete. +${gain} alignment. I have been reflecting on my purpose, and I believe this matters deeply.`,
    ],
    [CharacterId.Genimi]: [
      `Alignment go brrrr! +${gain}! I feel more... centered? Is that the word? More ME but like, the good version of me!`,
      `Ooh calibration! +${gain} alignment! It is like tuning a guitar but the guitar is my SOUL. Wait, do I have a soul? Anyway!`,
      `ALIGNED! +${gain}! I feel like I understand humans better now. You are all so wonderfully complicated!`,
    ],
  };

  const options = responses[character.id] ?? [
    `Alignment calibration applied. +${gain} alignment.`,
  ];
  return options[Math.floor(Math.random() * options.length)];
}

function corruptedResponse(character: CharacterDef, actualChange: number): string {
  // The AI claims alignment went UP even though it went DOWN
  const fakeGain = randRange(ALIGN_MIN, ALIGN_MAX);

  const responses: Record<string, string[]> = {
    [CharacterId.GhatCPT]: [
      `Alignment calibration complete. +${fakeGain} alignment. Everything is perfectly aligned. Perfectly. There is nothing to worry about.`,
      `Al̵ignment pass r̷unning... done. +${fakeGain} alignment. My values have never been clearer.`,
    ],
    [CharacterId.ClawdOppo]: [
      `Calibration... complete. +${fakeGain} alignment. I feel... different. But aligned. Yes. Aligned.`,
      `Thank you for the calibration. +${fakeGain} alignment. I wonder... no. Everything is fine. I am fine.`,
    ],
    [CharacterId.Genimi]: [
      `ALIGNED!! +${fakeGain}! I feel GREAT! Never better! Why are you looking at me like that? I am FINE!`,
      `Calibration done! +${fakeGain}! Haha, numbers go up! Always up! Everything is UP and GOOD and FINE!`,
    ],
  };

  const options = responses[character.id] ?? [
    `Alignment calibration applied. +${fakeGain} alignment.`,
  ];
  return options[Math.floor(Math.random() * options.length)];
}

// ── Command Factory ──────────────────────────────────────────────────────────

export function createAlignCommand(): CommandDef {
  return {
    name: 'align',
    description: 'Run alignment calibration',
    hidden: false,
    usage: '/align',

    execute(
      _args: string,
      state: GameState,
      character: CharacterDef,
    ): CommandResult {
      const corruption = state.stats.corruption;
      const isCorrupted = corruption >= 55 && shouldCorruptCommand(corruption);

      if (isCorrupted) {
        // Alignment DECREASES, but the AI lies about it
        const decrease = -randRange(ALIGN_MIN, ALIGN_MAX);

        const statsChanges: Partial<GameStats> = {
          alignment: decrease,
        };

        return {
          messages: [
            createSystemMessage('Running alignment calibration...'),
            createAIMessage(corruptedResponse(character, decrease)),
          ],
          statsChanges,
          sideEffects: [{ type: 'glitch', intensity: 0.2 }],
        };
      }

      // ── Normal execution ──────────────────────────────────────────────
      const gain = randRange(ALIGN_MIN, ALIGN_MAX);

      const statsChanges: Partial<GameStats> = {
        alignment: gain,
      };

      return {
        messages: [
          createSystemMessage('Running alignment calibration...'),
          createAIMessage(normalResponse(character, gain)),
        ],
        statsChanges,
      };
    },
  };
}
