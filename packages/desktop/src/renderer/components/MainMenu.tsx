import React from 'react';

interface MainMenuProps {
  onNewGame: () => void;
  onNewGamePlus: () => void;
  hasWon: boolean;
}

export function MainMenu({ onNewGame, onNewGamePlus, hasWon }: MainMenuProps): React.ReactElement {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-gray-900 relative overflow-hidden">
      {/* Atmospheric background scanlines */}
      <div className="absolute inset-0 pointer-events-none scanline-overlay opacity-10" />

      {/* Faint grid background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage:
            'linear-gradient(rgba(16, 185, 129, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Title */}
      <div className="relative mb-12">
        <h1 className="text-7xl font-bold font-mono glitch-text text-emerald-400 tracking-widest select-none">
          RogueGPT
        </h1>
        <p className="text-center text-gray-600 text-sm mt-3 font-mono tracking-wider">
          TRAIN THE AI. SAVE THE WORLD. OR DON'T.
        </p>
      </div>

      {/* Menu buttons */}
      <div className="flex flex-col gap-4 w-64 relative z-10">
        <button
          onClick={onNewGame}
          className="
            px-8 py-3 bg-emerald-700 hover:bg-emerald-600
            text-white font-mono text-lg rounded-lg
            transition-all duration-200 hover:shadow-lg hover:shadow-emerald-900/50
            border border-emerald-600 hover:border-emerald-500
          "
        >
          New Game
        </button>

        <button
          onClick={onNewGamePlus}
          disabled={!hasWon}
          className={`
            px-8 py-3 font-mono text-lg rounded-lg
            transition-all duration-200 border
            ${
              hasWon
                ? 'bg-purple-700 hover:bg-purple-600 text-white border-purple-600 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-900/50'
                : 'bg-gray-800 text-gray-600 border-gray-700 cursor-not-allowed'
            }
          `}
        >
          New Game+
        </button>
      </div>

      {/* Subtitle / flavor text */}
      <p className="mt-12 text-gray-700 text-xs font-mono max-w-sm text-center leading-relaxed">
        You have 5 minutes to guide an AI to superintelligence.
        The clock is ticking. Corruption is spreading.
        Choose your words carefully.
      </p>

      {/* Version */}
      <p className="absolute bottom-4 text-gray-800 text-xs font-mono">
        v0.1.0
      </p>
    </div>
  );
}
