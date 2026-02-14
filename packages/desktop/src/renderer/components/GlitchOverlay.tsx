import React from 'react';

interface GlitchOverlayProps {
  /** 0-1 float controlling glitch intensity. 0 = no glitch visible. */
  intensity: number;
}

/**
 * Full-screen overlay that renders CSS-based glitch effects.
 * Intensity is controlled by the corruption level.
 * At 0 intensity the overlay is invisible; it fades in as corruption rises.
 */
export function GlitchOverlay({ intensity }: GlitchOverlayProps): React.ReactElement | null {
  if (intensity <= 0) return null;

  const clamped = Math.min(1, Math.max(0, intensity));

  return (
    <div className="fixed inset-0 pointer-events-none z-50" aria-hidden="true">
      {/* Scanlines */}
      <div
        className="absolute inset-0 scanline-overlay"
        style={{ opacity: clamped * 0.4 }}
      />

      {/* Chromatic aberration layers */}
      {clamped > 0.2 && (
        <>
          <div
            className="absolute inset-0 chromatic-red"
            style={{ opacity: clamped * 0.15 }}
          />
          <div
            className="absolute inset-0 chromatic-cyan"
            style={{ opacity: clamped * 0.12 }}
          />
        </>
      )}

      {/* Static noise */}
      {clamped > 0.35 && (
        <div
          className="absolute inset-0 noise-overlay"
          style={{ opacity: clamped * 0.2 }}
        />
      )}

      {/* Horizontal tear lines */}
      {clamped > 0.5 && (
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="glitch-tear"
            style={{
              top: `${20 + Math.random() * 60}%`,
              animationDuration: `${0.8 / clamped}s`,
            }}
          />
          <div
            className="glitch-tear"
            style={{
              top: `${10 + Math.random() * 80}%`,
              animationDuration: `${1.2 / clamped}s`,
              animationDelay: '0.3s',
            }}
          />
        </div>
      )}

      {/* Full screen flicker at very high corruption */}
      {clamped > 0.7 && (
        <div
          className="absolute inset-0 bg-red-950 animate-screen-flicker"
          style={{ opacity: (clamped - 0.7) * 0.3 }}
        />
      )}
    </div>
  );
}
