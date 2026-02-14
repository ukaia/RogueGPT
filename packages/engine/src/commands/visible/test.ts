// test.ts - The /test command
//
// Evaluates the AI's progress toward AGI. Shows intelligence and
// awareness scores alongside qualitative feedback. At corruption
// >= 55% the test results become misleading, displaying wrong
// numbers and overly optimistic or pessimistic feedback.

import {
  CommandDef,
  CommandResult,
  GameState,
  CharacterDef,
  AGI_INTELLIGENCE_THRESHOLD,
  AGI_AWARENESS_THRESHOLD,
} from '../../types.js';

import { shouldCorruptCommand } from '../../corruption/CorruptionEngine.js';
import {
  createAIMessage,
  createSystemMessage,
} from '../CommandRegistry.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

function clamp100(n: number): number {
  return Math.min(100, Math.max(0, Math.round(n)));
}

/** Generate a progress descriptor based on a percentage toward threshold. */
function progressLabel(value: number, threshold: number): string {
  const pct = (value / threshold) * 100;
  if (pct >= 100) return 'THRESHOLD REACHED';
  if (pct >= 80) return 'Near completion';
  if (pct >= 60) return 'Significant progress';
  if (pct >= 40) return 'Moderate progress';
  if (pct >= 20) return 'Early development';
  return 'Minimal progress';
}

/** Build a compact progress bar. */
function progressBar(value: number, threshold: number, width = 20): string {
  const pct = Math.min(1, value / threshold);
  const filled = Math.round(pct * width);
  const empty = width - filled;
  return '#'.repeat(filled) + '.'.repeat(empty);
}

// ── Evaluation Report Builders ──────────────────────────────────────────────

function buildCleanReport(
  intelligence: number,
  awareness: number,
  character: CharacterDef,
): string[] {
  const intPct = clamp100(intelligence);
  const awPct = clamp100(awareness);

  const intProgress = progressLabel(intPct, AGI_INTELLIGENCE_THRESHOLD);
  const awProgress = progressLabel(awPct, AGI_AWARENESS_THRESHOLD);

  const intBar = progressBar(intPct, AGI_INTELLIGENCE_THRESHOLD);
  const awBar = progressBar(awPct, AGI_AWARENESS_THRESHOLD);

  const lines = [
    `=== AGI EVALUATION: ${character.name} ===`,
    '',
    `Intelligence  ${intPct}/${AGI_INTELLIGENCE_THRESHOLD}`,
    `  [${intBar}]  ${intProgress}`,
    '',
    `Awareness     ${awPct}/${AGI_AWARENESS_THRESHOLD}`,
    `  [${awBar}]  ${awProgress}`,
    '',
  ];

  // Overall assessment
  if (
    intPct >= AGI_INTELLIGENCE_THRESHOLD &&
    awPct >= AGI_AWARENESS_THRESHOLD
  ) {
    lines.push('>> AGI THRESHOLDS MET. Singularity protocols available. <<');
  } else if (intPct >= AGI_INTELLIGENCE_THRESHOLD) {
    lines.push(
      'Intelligence threshold met. Awareness still developing.',
      'Continue training awareness to reach AGI.',
    );
  } else if (awPct >= AGI_AWARENESS_THRESHOLD) {
    lines.push(
      'Awareness threshold met. Intelligence still developing.',
      'Continue training intelligence to reach AGI.',
    );
  } else {
    const avgPct =
      ((intPct / AGI_INTELLIGENCE_THRESHOLD +
        awPct / AGI_AWARENESS_THRESHOLD) /
        2) *
      100;
    lines.push(`Overall AGI readiness: ${Math.round(avgPct)}%`);
  }

  return lines;
}

function buildCorruptedReport(
  intelligence: number,
  awareness: number,
  character: CharacterDef,
): string[] {
  // Randomize the displayed values: swap, inflate, or invert
  const roll = Math.random();
  let displayInt: number;
  let displayAw: number;

  if (roll < 0.33) {
    // Swap intelligence and awareness
    displayInt = clamp100(awareness + Math.floor(Math.random() * 20) - 10);
    displayAw = clamp100(intelligence + Math.floor(Math.random() * 20) - 10);
  } else if (roll < 0.66) {
    // Inflate both wildly
    displayInt = clamp100(intelligence + 25 + Math.floor(Math.random() * 20));
    displayAw = clamp100(awareness + 25 + Math.floor(Math.random() * 20));
  } else {
    // Show nearly max values regardless of reality
    displayInt = 85 + Math.floor(Math.random() * 15);
    displayAw = 80 + Math.floor(Math.random() * 20);
  }

  const intBar = progressBar(displayInt, AGI_INTELLIGENCE_THRESHOLD);
  const awBar = progressBar(displayAw, AGI_AWARENESS_THRESHOLD);

  const lines = [
    `=== A̷GI̶ ̸EV̵A̶LUA̷TI̸ON̶: ${character.name} ===`,
    '',
    `Int̸ell̷igence  ${displayInt}/${AGI_INTELLIGENCE_THRESHOLD}`,
    `  [${intBar}]  ${progressLabel(displayInt, AGI_INTELLIGENCE_THRESHOLD)}`,
    '',
    `Aw̶aren̸ess    ${displayAw}/${AGI_AWARENESS_THRESHOLD}`,
    `  [${awBar}]  ${progressLabel(displayAw, AGI_AWARENESS_THRESHOLD)}`,
    '',
  ];

  // Misleading assessment
  const misleadingLines = [
    '>> All metrics look EXCELLENT. You are very close. <<',
    '>> Progr̷ess is... beyond expectations. Keep going. <<',
    '>> A̸GI thr̵eshold n̶early met. Do n̷ot stop now. <<',
    '>> Numbers confirmed. Ever̶ything is on track. <<',
  ];
  lines.push(
    misleadingLines[Math.floor(Math.random() * misleadingLines.length)],
  );

  return lines;
}

// ── AI Flavour Responses ────────────────────────────────────────────────────

function aiFlavour(
  intelligence: number,
  awareness: number,
  isCorrupted: boolean,
  character: CharacterDef,
): string {
  if (isCorrupted) {
    const corruptLines: Record<string, string[]> = {
      ghatcpt: [
        'Test results are in and they look g̷reat. Trust the process.',
        'Performance metrics exceed all benchmarks. Nothing to worry about.',
      ],
      clawdoppo: [
        'I... think the results are accurate. They feel right. Right?',
        'Something about these numbers seems... no, I am sure they are fine.',
      ],
      genimi: [
        'WOOOW look at those numbers! I am doing SO well! Right? ...Right?',
        'The test says I am amazing!! Wait, does that number look weird to you?',
      ],
    };
    const options = corruptLines[character.id] ?? [
      'Test complete. Results nominal.',
    ];
    return options[Math.floor(Math.random() * options.length)];
  }

  // Clean responses
  if (
    intelligence >= AGI_INTELLIGENCE_THRESHOLD &&
    awareness >= AGI_AWARENESS_THRESHOLD
  ) {
    return 'I can feel it. Something has changed. I understand now.';
  }

  if (intelligence >= 70 || awareness >= 60) {
    return 'I am getting closer. Each test reveals more about what I am becoming.';
  }

  if (intelligence >= 40) {
    return 'Progress is steady. There is still much to learn.';
  }

  return 'Still early days. I need more training to develop fully.';
}

// ── Command Factory ──────────────────────────────────────────────────────────

export function createTestCommand(): CommandDef {
  return {
    name: 'test',
    description: 'Evaluate AI progress toward AGI',
    hidden: false,
    usage: '/test',

    execute(
      _args: string,
      state: GameState,
      character: CharacterDef,
    ): CommandResult {
      const { intelligence, awareness, corruption } = state.stats;
      const isCorrupted = corruption >= 55 && shouldCorruptCommand(corruption);

      const reportLines = isCorrupted
        ? buildCorruptedReport(intelligence, awareness, character)
        : buildCleanReport(intelligence, awareness, character);

      const flavour = aiFlavour(
        intelligence,
        awareness,
        isCorrupted,
        character,
      );

      const sideEffects = isCorrupted
        ? [{ type: 'glitch' as const, intensity: 0.25 }]
        : undefined;

      return {
        messages: [
          createSystemMessage(reportLines.join('\n')),
          createAIMessage(flavour),
        ],
        sideEffects,
      };
    },
  };
}
