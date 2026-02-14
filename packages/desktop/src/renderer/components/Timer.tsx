import React from 'react';

interface TimerProps {
  remainingMs: number;
}

export function Timer({ remainingMs }: TimerProps): React.ReactElement {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Color shifts: white -> yellow -> red
  let colorClass = 'text-gray-200';
  if (totalSeconds <= 60) {
    colorClass = 'text-red-500';
  } else if (totalSeconds <= 120) {
    colorClass = 'text-yellow-400';
  }

  // Pulse when under 60 seconds
  const pulseClass = totalSeconds <= 60 ? 'animate-pulse' : '';

  return (
    <div className={`font-mono text-2xl font-bold tracking-widest ${colorClass} ${pulseClass}`}>
      {display}
    </div>
  );
}
