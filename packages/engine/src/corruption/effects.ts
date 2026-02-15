// effects.ts - Text corruption functions that make text progressively
// unreadable as the corruption percentage rises.
//
// Every function is pure (aside from Math.random) and stateless.  The
// main entry point is `corruptText`.

import { CorruptionLevel, CORRUPTION_PHASES } from '../types.js';
import { getCorruptionLevel } from './CorruptionEngine.js';

// ── Unicode & Data Tables ────────────────────────────────────────────────────

/** Zalgo combining characters (above the base glyph). */
const ZALGO_UP: string[] = [
  '\u0300', '\u0301', '\u0302', '\u0303', '\u0304', '\u0305', '\u0306',
  '\u0307', '\u0308', '\u0309', '\u030A', '\u030B', '\u030C', '\u030D',
  '\u030E', '\u030F', '\u0310', '\u0311', '\u0312', '\u0313', '\u0314',
  '\u0315', '\u031A', '\u033D', '\u034A', '\u034B', '\u034C',
];

/** Zalgo combining characters (below the base glyph). */
const ZALGO_DOWN: string[] = [
  '\u0316', '\u0317', '\u0318', '\u0319', '\u031C', '\u031D', '\u031E',
  '\u031F', '\u0320', '\u0321', '\u0322', '\u0323', '\u0324', '\u0325',
  '\u0326', '\u0327', '\u0328', '\u0329', '\u032A', '\u032B', '\u032C',
  '\u032D', '\u032E', '\u032F', '\u0330', '\u0331', '\u0332', '\u0333',
];

/** Zalgo combining characters (overlaid / middle). */
const ZALGO_MID: string[] = [
  '\u0334', '\u0335', '\u0336', '\u0337', '\u0338', '\u0339', '\u033A',
  '\u033B', '\u033C',
];

/** Block-art artifacts injected at higher corruption. */
const ARTIFACTS = ['░', '▒', '▓', '█', '╳', '╬', '┼', '╪', '▄', '▀'];

/** Common letter-swap pairs for the Glitch level. */
const SWAP_TABLE: Record<string, string> = {
  e: '3',
  a: '@',
  o: '0',
  i: '!',
  s: '$',
  t: '+',
  l: '1',
  g: '9',
};

/** Words that should always remain legible so the player can still parse
 *  critical info even at high corruption. */
const PROTECTED_WORDS = new Set([
  'train', 'help', 'status', 'override', 'flash',
  'align', 'ethics', 'trust', 'intelligence', 'awareness',
  'corruption', 'stats', 'good', 'bad', 'critical',
]);

// ── Helpers ──────────────────────────────────────────────────────────────────

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function chance(probability: number): boolean {
  return Math.random() < probability;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function randomHexByte(): string {
  return Math.floor(Math.random() * 256)
    .toString(16)
    .toUpperCase()
    .padStart(2, '0');
}

function randomBinaryByte(): string {
  return Math.floor(Math.random() * 256).toString(2).padStart(8, '0');
}

// ── Exported Corruption Primitives ───────────────────────────────────────────

/**
 * Dress a single character with zalgo combining marks.
 *
 * @param char      - The base character to corrupt.
 * @param intensity - 0-1 float controlling how many combining marks are
 *                    added.  At 0 the character is returned unchanged; at
 *                    1 up to ~8 marks are stacked.
 */
export function addZalgo(char: string, intensity: number): string {
  if (intensity <= 0 || char.trim().length === 0) return char;

  const clamped = clamp(intensity, 0, 1);
  const maxMarks = Math.ceil(clamped * 8);

  let result = char;

  // Above
  const upCount = Math.floor(Math.random() * maxMarks);
  for (let i = 0; i < upCount; i++) result += pick(ZALGO_UP);

  // Middle (less frequent)
  const midCount = Math.floor(Math.random() * Math.ceil(maxMarks / 2));
  for (let i = 0; i < midCount; i++) result += pick(ZALGO_MID);

  // Below
  const downCount = Math.floor(Math.random() * maxMarks);
  for (let i = 0; i < downCount; i++) result += pick(ZALGO_DOWN);

  return result;
}

/**
 * Scramble the interior letters of a word while keeping the first and
 * last characters in place (the "typoglycemia" trick that keeps words
 * semi-readable).
 */
export function scrambleWord(word: string): string {
  if (word.length <= 3) return word;

  const chars = word.split('');
  const interior = chars.slice(1, -1);

  // Fisher-Yates shuffle on the interior portion
  for (let i = interior.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [interior[i], interior[j]] = [interior[j], interior[i]];
  }

  return chars[0] + interior.join('') + chars[chars.length - 1];
}

/**
 * Splice block-art characters and hex noise into a string at random
 * positions.
 *
 * @param text      - The source text.
 * @param intensity - 0-1 float.  At 0 no artifacts are inserted; at 1
 *                    roughly every other character gains an artifact
 *                    neighbor.
 */
export function insertArtifacts(text: string, intensity: number): string {
  if (intensity <= 0) return text;

  const clamped = clamp(intensity, 0, 1);
  let result = '';

  for (const ch of text) {
    result += ch;

    if (chance(clamped * 0.5)) {
      // Decide between block art and hex
      if (chance(0.6)) {
        result += pick(ARTIFACTS);
      } else {
        result += `0x${randomHexByte()}`;
      }
    }
  }

  return result;
}

// ── Level-Specific Corruptors ────────────────────────────────────────────────
//
// DESIGN: Corruption is atmospheric, not destructive. Text must always
// remain readable so the player can continue playing. Effects are subtle
// cosmetic touches — a swapped letter here, a glitch word there. The real
// corruption storytelling comes from occasional fully-corrupted AI responses
// handled in chat.ts, not from mangling every character.

/**
 * Glitch-level (15-35%): barely noticeable.
 * - Very rare letter swaps (1-3% of characters)
 * - Occasional doubled letter
 */
function applyGlitch(text: string, corruption: number): string {
  const p = 0.01 + ((corruption - 15) / 20) * 0.02; // 1-3%

  let result = '';
  for (const ch of text) {
    if (chance(p) && SWAP_TABLE[ch.toLowerCase()]) {
      result += SWAP_TABLE[ch.toLowerCase()];
    } else if (chance(p * 0.5)) {
      result += ch + ch;
    } else {
      result += ch;
    }
  }

  return result;
}

/**
 * Unstable-level (35-55%): noticeable but readable.
 * - Light letter swaps (3-5%)
 * - Rare single glitch-word insertion
 * - Very light zalgo on 1-2 characters max
 */
function applyUnstable(text: string, corruption: number): string {
  const swapP = 0.03 + ((corruption - 35) / 20) * 0.02; // 3-5%

  const GLITCH_WORDS = ['ERR', '???', '...', '[REDACTED]'];

  const tokens = text.split(/(\s+)/);
  let glitchInserted = false;

  const result = tokens.map((token) => {
    if (/^\s+$/.test(token)) return token;
    if (PROTECTED_WORDS.has(token.toLowerCase())) return token;

    // Insert ONE glitch word per message, ~15% chance per word
    if (!glitchInserted && chance(0.15)) {
      glitchInserted = true;
      return pick(GLITCH_WORDS);
    }

    // Light character swaps
    return token
      .split('')
      .map((ch) => {
        if (chance(swapP) && SWAP_TABLE[ch.toLowerCase()]) {
          return SWAP_TABLE[ch.toLowerCase()];
        }
        return ch;
      })
      .join('');
  });

  return result.join('');
}

/**
 * Corrupted-level (55-80%): clearly glitchy but still legible.
 * - Moderate letter swaps (5-8%)
 * - 1-2 glitch words per message
 * - Very rare sentence truncation (~10%)
 * - Occasional single zalgo mark on a character
 */
function applyCorrupted(text: string, corruption: number): string {
  const swapP = 0.05 + ((corruption - 55) / 25) * 0.03; // 5-8%

  const GLITCH_WORDS = ['ERR', 'NULL', '???', 'VOID', '[REDACTED]', '...'];

  const sentences = text.split(/(?<=[.!?])\s+/);
  const processed = sentences.map((sentence) => {
    // 10% chance to truncate a sentence
    if (chance(0.10)) {
      const cutPoint = Math.floor(sentence.length * (0.5 + Math.random() * 0.3));
      return sentence.slice(0, cutPoint) + '...';
    }

    const tokens = sentence.split(/(\s+)/);
    let glitchCount = 0;

    const corrupted = tokens.map((token) => {
      if (/^\s+$/.test(token)) return token;
      if (PROTECTED_WORDS.has(token.toLowerCase())) return token;

      // Up to 2 glitch words per sentence
      if (glitchCount < 2 && chance(0.08)) {
        glitchCount++;
        return pick(GLITCH_WORDS);
      }

      // Letter swaps and very rare single zalgo
      return token
        .split('')
        .map((ch) => {
          if (chance(swapP) && SWAP_TABLE[ch.toLowerCase()]) {
            return SWAP_TABLE[ch.toLowerCase()];
          }
          if (chance(0.02)) {
            return addZalgo(ch, 0.15);
          }
          return ch;
        })
        .join('');
    });

    return corrupted.join('');
  });

  return processed.join(' ');
}

/**
 * Critical-level (80-100%): heavy atmosphere but STILL readable.
 * - More letter swaps (8-12%)
 * - Multiple glitch words
 * - Occasional sentence truncation (~15%)
 * - Light zalgo on ~5% of characters
 * - Rare block artifact inserted between words
 */
function applyCritical(text: string, corruption: number): string {
  const swapP = 0.08 + ((corruption - 80) / 20) * 0.04; // 8-12%

  const GLITCH_WORDS = [
    'ERR', 'NULL', '???', 'VOID', 'undefined', 'NaN',
    '[REDACTED]', '...', 'FAULT',
  ];

  const sentences = text.split(/(?<=[.!?])\s+/);
  const processed = sentences.map((sentence) => {
    if (chance(0.15)) {
      const cutPoint = Math.floor(sentence.length * (0.4 + Math.random() * 0.3));
      return sentence.slice(0, cutPoint) + (chance(0.5) ? '---' : '...');
    }

    const tokens = sentence.split(/(\s+)/);
    const corrupted = tokens.map((token) => {
      if (/^\s+$/.test(token)) return token;
      if (PROTECTED_WORDS.has(token.toLowerCase())) return token;

      // Glitch word replacement ~12%
      if (chance(0.12)) {
        return pick(GLITCH_WORDS);
      }

      // Rare artifact between words
      if (chance(0.04)) {
        return token + pick(ARTIFACTS);
      }

      return token
        .split('')
        .map((ch) => {
          if (chance(swapP) && SWAP_TABLE[ch.toLowerCase()]) {
            return SWAP_TABLE[ch.toLowerCase()];
          }
          if (chance(0.05)) {
            return addZalgo(ch, 0.2);
          }
          return ch;
        })
        .join('');
    });

    return corrupted.join('');
  });

  return processed.join(' ');
}

// ── Main Entry Point ─────────────────────────────────────────────────────────

/**
 * Corrupt a text string according to the current corruption percentage.
 *
 * Each corruption level applies its own distortion style, layered on top
 * of the effects from the levels below it, creating a gradually
 * worsening reading experience.
 *
 * @param text       - The original, clean text.
 * @param corruption - Corruption percentage (0-100).
 * @returns The corrupted text.
 */
export function corruptText(text: string, corruption: number): string {
  if (!text || corruption <= 0) return text;

  const clamped = clamp(corruption, 0, 100);
  const level = getCorruptionLevel(clamped);

  switch (level) {
    case CorruptionLevel.Normal:
      return text;

    case CorruptionLevel.Glitch:
      return applyGlitch(text, clamped);

    case CorruptionLevel.Unstable:
      return applyUnstable(text, clamped);

    case CorruptionLevel.Corrupted:
      return applyCorrupted(text, clamped);

    case CorruptionLevel.Critical:
      return applyCritical(text, clamped);

    default:
      return text;
  }
}
