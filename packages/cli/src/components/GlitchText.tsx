import React, { useState, useEffect, useRef } from 'react';
import { Text } from 'ink';

interface GlitchTextProps {
  children: string;
  corruption: number; // 0-100
}

// ANSI color names supported by Ink's Text component
const GLITCH_COLORS = [
  'red',
  'green',
  'yellow',
  'blue',
  'magenta',
  'cyan',
  'white',
] as const;

type InkColor = (typeof GLITCH_COLORS)[number];

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * GlitchText renders text with occasional brief flicker effects.
 * Text is normally displayed clean. At random intervals (based on corruption),
 * a short flicker occurs (150-300ms) applying color tints, then returns to normal.
 * Flickers become more frequent at higher corruption, but text is always readable.
 */
export function GlitchText({ children, corruption }: GlitchTextProps) {
  const [isFlickering, setIsFlickering] = useState(false);
  const [flickerColor, setFlickerColor] = useState<InkColor | undefined>(undefined);
  const [flickerDim, setFlickerDim] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (corruption < 15) return;

    function scheduleFlicker() {
      // Time between flickers: shorter at higher corruption
      // corruption 15 → 8-15s, corruption 50 → 3-6s, corruption 80+ → 1-3s
      const minDelay = Math.max(1000, 8000 - corruption * 80);
      const maxDelay = Math.max(2000, 15000 - corruption * 130);
      const delay = minDelay + Math.random() * (maxDelay - minDelay);

      timerRef.current = setTimeout(() => {
        // Start flicker: apply a random color tint
        setFlickerColor(pickRandom(GLITCH_COLORS));
        setFlickerDim(corruption > 40 && Math.random() < 0.3);
        setIsFlickering(true);

        // End flicker after a brief moment (150-300ms)
        const flickerDuration = 150 + Math.random() * 150;
        timerRef.current = setTimeout(() => {
          setIsFlickering(false);
          setFlickerColor(undefined);
          setFlickerDim(false);
          // Schedule next flicker
          scheduleFlicker();
        }, flickerDuration);
      }, delay);
    }

    scheduleFlicker();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [corruption]);

  // No effects at low corruption
  if (corruption < 15 || !isFlickering) {
    return <Text>{children}</Text>;
  }

  // During a flicker: apply tint to the whole message briefly
  // At higher corruption, occasionally tint individual words instead
  if (corruption >= 50 && Math.random() < 0.4) {
    const words = children.split(/(\s+)/);
    return (
      <Text>
        {words.map((word, i) => {
          if (/^\s+$/.test(word)) return <Text key={i}>{word}</Text>;
          // Randomly tint some words during the flicker
          const wordColor: InkColor | undefined =
            Math.random() < 0.3 ? pickRandom(GLITCH_COLORS) : undefined;
          return (
            <Text key={i} color={wordColor} dimColor={flickerDim && Math.random() < 0.2}>
              {word}
            </Text>
          );
        })}
      </Text>
    );
  }

  // Simple whole-message tint flicker
  return (
    <Text color={flickerColor} dimColor={flickerDim}>
      {children}
    </Text>
  );
}
