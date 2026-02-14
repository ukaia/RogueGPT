import React, { useEffect, useState, useRef, useCallback } from 'react';

interface FlashEffectProps {
  active: boolean;
  onComplete: () => void;
}

/**
 * Full-screen white flash for the /help trick.
 * Fades in quickly, holds for 1.5 seconds, then fades out.
 */
export function FlashEffect({ active, onComplete }: FlashEffectProps): React.ReactElement | null {
  const [phase, setPhase] = useState<'idle' | 'fadein' | 'hold' | 'fadeout'>('idle');
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!active) {
      setPhase('idle');
      return;
    }

    // Fade in
    setPhase('fadein');

    // Hold after fade-in (200ms fade in)
    const holdTimer = setTimeout(() => setPhase('hold'), 200);

    // Fade out after hold (1.5s hold)
    const fadeOutTimer = setTimeout(() => setPhase('fadeout'), 1700);

    // Complete after fade out (500ms fade out)
    const completeTimer = setTimeout(() => {
      setPhase('idle');
      onCompleteRef.current();
    }, 2200);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(fadeOutTimer);
      clearTimeout(completeTimer);
    };
  }, [active]); // Only depend on active, not onComplete

  if (phase === 'idle') return null;

  let opacity = 0;
  let transition = 'opacity 200ms ease-in';

  switch (phase) {
    case 'fadein':
      opacity = 0.95;
      transition = 'opacity 200ms ease-in';
      break;
    case 'hold':
      opacity = 0.95;
      transition = 'none';
      break;
    case 'fadeout':
      opacity = 0;
      transition = 'opacity 500ms ease-out';
      break;
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-white pointer-events-none"
      style={{ opacity, transition }}
      aria-hidden="true"
    />
  );
}
