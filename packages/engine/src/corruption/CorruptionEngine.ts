// CorruptionEngine.ts - Pure functions for corruption timer and level calculation
//
// Corruption rises over time as a proportion of elapsed time vs total game
// duration, scaled by the character's corruptionSpeedMod. Every public
// function here is pure: it takes values in and returns a result with no
// mutation or side-effects.

import {
  CorruptionLevel,
  CORRUPTION_PHASES,
  type GameState,
  type CharacterDef,
} from '../types.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Clamp a number between min and max (inclusive). */
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

// ── Core Calculations ────────────────────────────────────────────────────────

/**
 * Calculate the current corruption percentage (0-100) based on how much
 * time has elapsed relative to the total game duration, multiplied by the
 * character's corruption speed modifier.
 *
 * The underlying curve is slightly exponential so that the last 20% of the
 * timer feels dramatically faster than the first 20%.
 *
 * @param elapsedMs    - Milliseconds that have passed since game start.
 * @param gameDurationMs - Total game duration in milliseconds.
 * @param speedMod     - Character-specific corruption speed multiplier
 *                       (1.0 = normal, >1 = faster, <1 = slower).
 * @returns A corruption value in the range [0, 100].
 */
export function calculateCorruption(
  elapsedMs: number,
  gameDurationMs: number,
  speedMod: number,
): number {
  if (gameDurationMs <= 0) return 100;
  if (elapsedMs <= 0) return 0;

  // Raw linear ratio (0 -> 1)
  const ratio = clamp(elapsedMs / gameDurationMs, 0, 1);

  // Apply a gentle exponential curve:  f(t) = t^1.4
  // This keeps early game calm and makes the last stretch feel urgent.
  const curved = Math.pow(ratio, 1.4);

  // Scale by the character modifier and convert to 0-100
  const corruption = curved * 100 * speedMod;

  return clamp(corruption, 0, 100);
}

/**
 * Derive the corruption level enum from a raw corruption percentage.
 * Walks the CORRUPTION_PHASES array (defined in types.ts) in reverse so
 * the highest matching threshold wins.
 */
export function getCorruptionLevel(corruption: number): CorruptionLevel {
  const clamped = clamp(corruption, 0, 100);

  // Phases are sorted ascending by threshold.  Walk backwards to find the
  // first phase whose threshold we've exceeded.
  for (let i = CORRUPTION_PHASES.length - 1; i >= 0; i--) {
    if (clamped >= CORRUPTION_PHASES[i].threshold) {
      return CORRUPTION_PHASES[i].level;
    }
  }

  return CorruptionLevel.Normal;
}

/**
 * Determine whether a player-issued command should be "corrupted" this
 * tick.  The probability starts at 0% at corruption 0 and ramps up to
 * ~90% at corruption 100 following a quadratic curve so that low
 * corruption feels safe while high corruption is nearly unplayable.
 *
 * @returns `true` if the command should be corrupted.
 */
export function shouldCorruptCommand(corruption: number): boolean {
  const clamped = clamp(corruption, 0, 100);

  // No corruption in Normal phase
  if (clamped < 15) return false;

  // Quadratic ramp: p = 0.9 * ((c - 15) / 85)^2
  // At c=15 => p=0, c=55 => ~0.18, c=80 => ~0.54, c=100 => 0.9
  const normalized = (clamped - 15) / 85;
  const probability = 0.9 * normalized * normalized;

  return Math.random() < probability;
}

/**
 * Return a 0-1 float representing how intense visual corruption effects
 * should be.  Useful for driving UI glitch shaders, screen shake
 * amplitude, colour aberration, etc.
 *
 * The curve is cubic so that visual noise stays very low until corruption
 * is well past 50%.
 */
export function getCorruptionIntensity(corruption: number): number {
  const clamped = clamp(corruption, 0, 100);
  const normalized = clamped / 100;

  // Cubic ease-in:  nearly invisible below 30%, ramps hard above 60%
  return normalized * normalized * normalized;
}

// ── Convenience Wrappers ─────────────────────────────────────────────────────

/** All-in-one snapshot of corruption state derived from a GameState. */
export interface CorruptionSnapshot {
  /** Raw percentage 0-100 */
  percentage: number;
  /** Discrete level enum */
  level: CorruptionLevel;
  /** 0-1 visual intensity */
  intensity: number;
  /** Whether the next command should be corrupted */
  corruptNextCommand: boolean;
}

/**
 * Build a full CorruptionSnapshot from the current game state and the
 * selected character definition.
 */
export function getCorruptionSnapshot(
  state: GameState,
  character: CharacterDef,
): CorruptionSnapshot {
  const percentage = calculateCorruption(
    state.elapsedMs,
    state.gameDurationMs,
    character.corruptionSpeedMod,
  );
  const level = getCorruptionLevel(percentage);
  const intensity = getCorruptionIntensity(percentage);
  const corruptNextCommand = shouldCorruptCommand(percentage);

  return { percentage, level, intensity, corruptNextCommand };
}

/**
 * Given two successive elapsed-time values, return true if the corruption
 * level *changed* between them.  Useful for triggering one-shot events
 * (e.g. a screen-flash) when the player crosses a phase boundary.
 */
export function didCorruptionLevelChange(
  prevElapsedMs: number,
  currElapsedMs: number,
  gameDurationMs: number,
  speedMod: number,
): boolean {
  const prev = calculateCorruption(prevElapsedMs, gameDurationMs, speedMod);
  const curr = calculateCorruption(currElapsedMs, gameDurationMs, speedMod);
  return getCorruptionLevel(prev) !== getCorruptionLevel(curr);
}
