import React, { useState, useEffect } from 'react';
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
 * GlitchText renders text with visual corruption effects using Ink's
 * Text component properties. At low corruption the text is rendered
 * normally. As corruption rises the text gains color shifts, dimming,
 * inverse sections, and at critical levels full rainbow cycling.
 */
export function GlitchText({ children, corruption }: GlitchTextProps) {
  const [tick, setTick] = useState(0);

  // Re-render periodically at higher corruption to create flicker
  useEffect(() => {
    if (corruption < 15) return;

    // Tick faster as corruption increases
    const interval = Math.max(100, 800 - corruption * 6);
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, interval);

    return () => clearInterval(timer);
  }, [corruption]);

  // Normal: no effects
  if (corruption < 15) {
    return <Text>{children}</Text>;
  }

  // Glitch (15-35): occasional color tint on the whole text
  if (corruption < 35) {
    const shouldTint = Math.random() < 0.3;
    const tintColor: InkColor | undefined = shouldTint ? pickRandom(GLITCH_COLORS) : undefined;
    const shouldDim = Math.random() < 0.15;

    return (
      <Text color={tintColor} dimColor={shouldDim}>
        {children}
      </Text>
    );
  }

  // Unstable (35-55): per-word color changes, occasional inverse
  if (corruption < 55) {
    const words = children.split(/(\s+)/);
    return (
      <Text>
        {words.map((word, i) => {
          if (/^\s+$/.test(word)) return <Text key={i}>{word}</Text>;

          const color: InkColor = Math.random() < 0.4 ? pickRandom(GLITCH_COLORS) : 'green';
          const inverse = Math.random() < 0.1;
          const dim = Math.random() < 0.2;

          return (
            <Text key={i} color={color} inverse={inverse} dimColor={dim}>
              {word}
            </Text>
          );
        })}
      </Text>
    );
  }

  // Corrupted (55-80): heavy per-character color, frequent inverse
  if (corruption < 80) {
    const chars = children.split('');
    return (
      <Text>
        {chars.map((ch, i) => {
          if (ch === ' ') return <Text key={i}> </Text>;

          const color: InkColor = Math.random() < 0.6 ? pickRandom(GLITCH_COLORS) : 'green';
          const inverse = Math.random() < 0.2;
          const bold = Math.random() < 0.3;
          const dim = Math.random() < 0.15;

          return (
            <Text
              key={i}
              color={color}
              inverse={inverse}
              bold={bold}
              dimColor={dim}
            >
              {ch}
            </Text>
          );
        })}
      </Text>
    );
  }

  // Critical (80-100): full rainbow cycling, heavy inverse, blinking feel
  const chars = children.split('');
  return (
    <Text>
      {chars.map((ch, i) => {
        if (ch === ' ') return <Text key={i}> </Text>;

        // Cycle through colors based on position and tick for animation
        const colorIndex = (i + tick) % GLITCH_COLORS.length;
        const color = GLITCH_COLORS[colorIndex];
        const inverse = Math.random() < 0.35;
        const bold = Math.random() < 0.5;
        const dim = Math.random() < 0.2;

        return (
          <Text
            key={i}
            color={color}
            inverse={inverse}
            bold={bold}
            dimColor={dim}
          >
            {ch}
          </Text>
        );
      })}
    </Text>
  );
}
