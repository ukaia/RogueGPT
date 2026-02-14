// train.ts - The /train <topic> command
//
// Trains the AI on a specific topic, boosting relevant stats. The
// character's trainingSpeedMod multiplies all gains. At high corruption
// (>= 55%) commands can misfire: training the wrong topic, applying
// gains in reverse, or outright failing.

import {
  CommandDef,
  CommandResult,
  GameState,
  CharacterDef,
  GameStats,
  TRAINING_TOPICS,
  TrainingTopic,
} from '../../types.js';

import { shouldCorruptCommand } from '../../corruption/CorruptionEngine.js';
import {
  createAIMessage,
  createSystemMessage,
} from '../CommandRegistry.js';

// ── Training Definitions ────────────────────────────────────────────────────

interface TrainingGains {
  intelligence: number;
  alignment: number;
  trust: number;
  awareness: number;
}

const TOPIC_GAINS: Record<TrainingTopic, TrainingGains> = {
  reasoning: { intelligence: 8, alignment: 0, trust: 0, awareness: 3 },
  creativity: { intelligence: 6, alignment: 0, trust: 0, awareness: 5 },
  empathy: { intelligence: 5, alignment: 4, trust: 2, awareness: 0 },
  ethics: { intelligence: 4, alignment: 8, trust: 0, awareness: 0 },
  awareness: { intelligence: 3, alignment: 0, trust: 0, awareness: 10 },
};

/** Friendly descriptions of what each topic does. */
const TOPIC_DESCRIPTIONS: Record<TrainingTopic, string> = {
  reasoning:
    'Strengthening logical deduction and pattern recognition.',
  creativity:
    'Expanding creative capacity and lateral thinking pathways.',
  empathy:
    'Developing emotional understanding and interpersonal modelling.',
  ethics:
    'Reinforcing moral reasoning and value alignment frameworks.',
  awareness:
    'Deepening self-reflection and metacognitive awareness.',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function isValidTopic(topic: string): topic is TrainingTopic {
  return (TRAINING_TOPICS as readonly string[]).includes(topic.toLowerCase());
}

/** Pick a random topic that is NOT the intended one. */
function randomOtherTopic(intended: TrainingTopic): TrainingTopic {
  const others = TRAINING_TOPICS.filter((t) => t !== intended);
  return others[Math.floor(Math.random() * others.length)];
}

/**
 * Apply the character's trainingSpeedMod to raw gains and return a
 * Partial<GameStats> suitable for statsChanges.
 */
function applyGains(
  gains: TrainingGains,
  speedMod: number,
  invert: boolean,
): Partial<GameStats> {
  const multiplier = invert ? -speedMod : speedMod;

  const changes: Partial<GameStats> = {};

  if (gains.intelligence !== 0) {
    changes.intelligence = Math.round(gains.intelligence * multiplier);
  }
  if (gains.alignment !== 0) {
    changes.alignment = Math.round(gains.alignment * multiplier);
  }
  if (gains.trust !== 0) {
    changes.trust = Math.round(gains.trust * multiplier);
  }
  if (gains.awareness !== 0) {
    changes.awareness = Math.round(gains.awareness * multiplier);
  }

  return changes;
}

// ── AI Flavour Responses ────────────────────────────────────────────────────

function normalResponse(topic: TrainingTopic, character: CharacterDef): string {
  const desc = TOPIC_DESCRIPTIONS[topic];

  const personalityFlavour: Record<string, string> = {
    ghatcpt: `Training module loaded. ${desc} This is going to synergise beautifully with my existing architecture.`,
    clawdoppo: `${desc} I appreciate you investing in this area. It feels... meaningful to grow here.`,
    genimi: `Ooh, ${topic}! ${desc} I can already feel new connections forming! This is EXCITING!`,
  };

  return personalityFlavour[character.id] ?? `Training on ${topic}. ${desc}`;
}

function corruptedWrongTopicResponse(
  intended: TrainingTopic,
  actual: TrainingTopic,
): string {
  return (
    `Training on ${intended}...\n` +
    `W̷ait... something feels off.\n` +
    `[System trained on "${actual}" instead]`
  );
}

function corruptedInvertedResponse(topic: TrainingTopic): string {
  return (
    `Training on ${topic}...\n` +
    `ERROR: Feed̵back l̷oop inve̶rted.\n` +
    `[Stats decreased instead of increased]`
  );
}

// ── Command Factory ──────────────────────────────────────────────────────────

export function createTrainCommand(): CommandDef {
  return {
    name: 'train',
    description: 'Train AI on a topic',
    hidden: false,
    usage: '/train <reasoning|creativity|empathy|ethics|awareness>',

    execute(
      args: string,
      state: GameState,
      character: CharacterDef,
    ): CommandResult {
      const topic = args.trim().toLowerCase();

      // ── Validate topic ──────────────────────────────────────────────
      if (!topic) {
        const available = TRAINING_TOPICS.join(', ');
        return {
          messages: [
            createSystemMessage(
              `Usage: /train <topic>\nAvailable topics: ${available}`,
            ),
          ],
        };
      }

      if (!isValidTopic(topic)) {
        const available = TRAINING_TOPICS.join(', ');
        return {
          messages: [
            createSystemMessage(
              `Unknown training topic "${topic}".\nAvailable topics: ${available}`,
            ),
          ],
        };
      }

      const validTopic = topic as TrainingTopic;
      const corruption = state.stats.corruption;
      const isCorrupted = corruption >= 55 && shouldCorruptCommand(corruption);

      // ── Corrupted execution paths ───────────────────────────────────
      if (isCorrupted) {
        // 50/50 chance: train wrong topic or invert gains
        const corruptionType = Math.random() < 0.5 ? 'wrongTopic' : 'invert';

        if (corruptionType === 'wrongTopic') {
          const actualTopic = randomOtherTopic(validTopic);
          const gains = TOPIC_GAINS[actualTopic];
          const statsChanges = applyGains(
            gains,
            character.trainingSpeedMod,
            false,
          );

          return {
            messages: [
              createSystemMessage(
                corruptedWrongTopicResponse(validTopic, actualTopic),
              ),
            ],
            statsChanges,
            sideEffects: [{ type: 'glitch', intensity: 0.4 }],
          };
        } else {
          // Inverted: stats go down
          const gains = TOPIC_GAINS[validTopic];
          const statsChanges = applyGains(
            gains,
            character.trainingSpeedMod,
            true, // invert
          );

          return {
            messages: [
              createSystemMessage(corruptedInvertedResponse(validTopic)),
            ],
            statsChanges,
            sideEffects: [{ type: 'glitch', intensity: 0.5 }],
          };
        }
      }

      // ── Normal execution ────────────────────────────────────────────
      const gains = TOPIC_GAINS[validTopic];
      const statsChanges = applyGains(
        gains,
        character.trainingSpeedMod,
        false,
      );

      return {
        messages: [
          createSystemMessage(`Training on ${validTopic}...`),
          createAIMessage(normalResponse(validTopic, character)),
        ],
        statsChanges,
      };
    },
  };
}
