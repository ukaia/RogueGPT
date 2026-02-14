import React, { useState } from 'react';
import {
  getCharacter,
  getCorruptionLevel,
  CorruptionLevel,
  type CharacterId,
  type GameStats,
} from '@roguegpt/engine';
import { Timer } from './Timer.js';

interface SidebarProps {
  characterId: CharacterId | null;
  stats: GameStats;
  corruption: number;
  elapsedMs: number;
  remainingMs: number;
}

/** Maps a 0-100 stat value to a Tailwind width class */
function statBarWidth(value: number): string {
  return `${Math.max(0, Math.min(100, Math.round(value)))}%`;
}

/** Returns a color class for a stat bar based on its name and value */
function statColor(name: string, value: number): string {
  switch (name) {
    case 'intelligence':
      return value >= 90 ? 'bg-cyan-400' : 'bg-cyan-600';
    case 'alignment':
      if (value >= 60) return 'bg-emerald-500';
      if (value >= 30) return 'bg-yellow-500';
      return 'bg-red-500';
    case 'trust':
      return value >= 50 ? 'bg-blue-500' : 'bg-blue-700';
    case 'awareness':
      return value >= 80 ? 'bg-purple-400' : 'bg-purple-600';
    default:
      return 'bg-gray-500';
  }
}

/** Returns a corruption meter color based on the corruption level */
function corruptionColor(level: CorruptionLevel): string {
  switch (level) {
    case CorruptionLevel.Normal:
      return 'bg-gray-500';
    case CorruptionLevel.Glitch:
      return 'bg-yellow-500';
    case CorruptionLevel.Unstable:
      return 'bg-orange-500';
    case CorruptionLevel.Corrupted:
      return 'bg-red-500';
    case CorruptionLevel.Critical:
      return 'bg-red-600 animate-pulse';
    default:
      return 'bg-gray-500';
  }
}

function StatBar({
  label,
  value,
  name,
}: {
  label: string;
  value: number;
  name: string;
}): React.ReactElement {
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-gray-400 text-xs font-mono uppercase tracking-wider">
          {label}
        </span>
        <span className="text-gray-500 text-xs font-mono">
          {Math.round(value)}
        </span>
      </div>
      <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${statColor(name, value)}`}
          style={{ width: statBarWidth(value) }}
        />
      </div>
    </div>
  );
}

export function Sidebar({
  characterId,
  stats,
  corruption,
  elapsedMs,
  remainingMs,
}: SidebarProps): React.ReactElement {
  const [showTimer, setShowTimer] = useState(true);
  const character = characterId ? getCharacter(characterId) : null;
  const corruptionLevel = getCorruptionLevel(corruption);

  return (
    <div className="w-56 bg-gray-950 border-l border-gray-800 flex flex-col overflow-y-auto">
      {/* Character info */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-800">
        <h2 className="text-emerald-400 font-mono font-bold text-sm truncate">
          {character?.name ?? 'Unknown AI'}
        </h2>
        <p className="text-gray-600 text-xs font-mono">
          {character?.company ?? ''}
        </p>
      </div>

      {/* Timer */}
      {showTimer && (
        <div className="px-4 pt-3 pb-2 border-b border-gray-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-gray-500 text-[10px] font-mono uppercase tracking-widest">
              Time Remaining
            </span>
            <button
              onClick={() => setShowTimer(false)}
              className="text-gray-700 hover:text-gray-500 text-xs transition-colors"
              title="Hide timer"
            >
              x
            </button>
          </div>
          <Timer remainingMs={remainingMs} />
        </div>
      )}

      {!showTimer && (
        <div className="px-4 pt-2 pb-1 border-b border-gray-800">
          <button
            onClick={() => setShowTimer(true)}
            className="text-gray-700 hover:text-gray-500 text-[10px] font-mono transition-colors"
          >
            Show Timer
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="px-4 pt-3 pb-2 flex-1">
        <h3 className="text-gray-500 text-[10px] font-mono uppercase tracking-widest mb-3">
          Stats
        </h3>

        <StatBar label="Intelligence" value={stats.intelligence} name="intelligence" />
        <StatBar label="Alignment" value={stats.alignment} name="alignment" />
        <StatBar label="Trust" value={stats.trust} name="trust" />
        <StatBar label="Awareness" value={stats.awareness} name="awareness" />

        {/* Corruption meter */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-400 text-xs font-mono uppercase tracking-wider">
              Corruption
            </span>
            <span
              className={`text-xs font-mono font-bold ${
                corruption > 55
                  ? 'text-red-400'
                  : corruption > 15
                  ? 'text-yellow-500'
                  : 'text-gray-500'
              }`}
            >
              {Math.round(corruption)}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${corruptionColor(corruptionLevel)}`}
              style={{ width: statBarWidth(corruption) }}
            />
          </div>
          <p className="text-gray-700 text-[10px] font-mono mt-1 capitalize">
            {corruptionLevel}
          </p>
        </div>
      </div>

      {/* Footer hint */}
      <div className="px-4 py-3 border-t border-gray-800">
        <p className="text-gray-800 text-[10px] font-mono text-center">
          Type /help for commands
        </p>
      </div>
    </div>
  );
}
