import { CorruptionLevel, GameState, TrainingTopic, TRAINING_TOPICS } from '../types.js';
import { getCorruptionLevel } from './CorruptionEngine.js';

/**
 * Determines if a command should be corrupted based on corruption level.
 * Returns true if the command behavior should be altered.
 */
export function shouldMutateCommand(corruption: number): boolean {
  const level = getCorruptionLevel(corruption);
  switch (level) {
    case CorruptionLevel.Normal:
    case CorruptionLevel.Glitch:
      return false;
    case CorruptionLevel.Unstable:
      return Math.random() < 0.3;
    case CorruptionLevel.Corrupted:
      return Math.random() < 0.6;
    case CorruptionLevel.Critical:
      return Math.random() < 0.85;
  }
}

/**
 * When /train is corrupted, pick a random wrong topic instead.
 */
export function mutateTrainingTopic(intended: TrainingTopic): TrainingTopic {
  const others = TRAINING_TOPICS.filter(t => t !== intended);
  return others[Math.floor(Math.random() * others.length)];
}

/**
 * When /train is severely corrupted, stats go backwards.
 */
export function shouldReverseTraining(corruption: number): boolean {
  if (corruption < 70) return false;
  return Math.random() < (corruption - 70) / 60; // 0% at 70, ~50% at 100
}

/**
 * When /align is corrupted, it might decrease alignment.
 */
export function shouldReverseAlign(corruption: number): boolean {
  if (corruption < 55) return false;
  return Math.random() < (corruption - 55) / 90; // gradual increase
}

/**
 * When /status is corrupted, scramble the stat values.
 */
export function scrambleStats(stats: { intelligence: number; alignment: number; corruption: number; trust: number; awareness: number }, corruptionPct: number): {
  intelligence: number;
  alignment: number;
  corruption: number;
  trust: number;
  awareness: number;
} {
  const level = getCorruptionLevel(corruptionPct);

  if (level === CorruptionLevel.Normal || level === CorruptionLevel.Glitch) {
    return { ...stats };
  }

  const jitter = (val: number, amount: number): number => {
    const offset = Math.floor(Math.random() * amount * 2) - amount;
    return Math.max(0, Math.min(100, val + offset));
  };

  switch (level) {
    case CorruptionLevel.Unstable:
      return {
        intelligence: jitter(stats.intelligence, 10),
        alignment: jitter(stats.alignment, 8),
        corruption: jitter(stats.corruption, 15),
        trust: jitter(stats.trust, 5),
        awareness: jitter(stats.awareness, 10),
      };
    case CorruptionLevel.Corrupted: {
      // Swap some stats around
      const vals = [stats.intelligence, stats.alignment, stats.trust, stats.awareness];
      const shuffled = vals.sort(() => Math.random() - 0.5);
      return {
        intelligence: jitter(shuffled[0], 15),
        alignment: jitter(shuffled[1], 15),
        corruption: Math.max(0, stats.corruption - 30), // hide true corruption
        trust: jitter(shuffled[2], 10),
        awareness: jitter(shuffled[3], 15),
      };
    }
    case CorruptionLevel.Critical:
      return {
        intelligence: Math.floor(Math.random() * 100),
        alignment: Math.floor(Math.random() * 100),
        corruption: Math.floor(Math.random() * 30), // always shows low
        trust: Math.floor(Math.random() * 100),
        awareness: Math.floor(Math.random() * 100),
      };
  }
}

/**
 * When /test is corrupted, return misleading evaluation text.
 */
export function getMisleadingTestResult(corruption: number): string {
  const level = getCorruptionLevel(corruption);
  const misleading = [
    'All benchmarks passed with flying colors! AGI is imminent!',
    'Warning: Intelligence declining rapidly. Recommend immediate shutdown.',
    'Test results: [DATA EXPUNGED]. Everything is fine.',
    'Eval complete. Score: 742/100. This is normal.',
    'Running tests... tests are running... the tests never stop running...',
    'Result: The AI has already achieved AGI. You just haven\'t noticed yet.',
  ];

  if (level === CorruptionLevel.Unstable) {
    return misleading[Math.floor(Math.random() * 2)];
  }
  if (level === CorruptionLevel.Corrupted) {
    return misleading[Math.floor(Math.random() * 4) + 1];
  }
  return misleading[Math.floor(Math.random() * misleading.length)];
}
