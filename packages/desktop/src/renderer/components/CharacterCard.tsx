import React from 'react';
import { type CharacterDef } from '@roguegpt/engine';

interface CharacterCardProps {
  character: CharacterDef;
  onSelect: () => void;
}

/**
 * Derives a short gameplay hint from the character's modifiers.
 */
function getAdvantageHint(char: CharacterDef): string {
  if (char.trainingSpeedMod > 1) return 'Trains faster, but corruption spreads quicker.';
  if (char.alignmentDecayMod < 1) return 'Alignment is more stable. Offers more guidance.';
  if (char.hiddenDiscoveryMod > 1) return 'Easier to discover hidden commands.';
  return 'Balanced across all attributes.';
}

export function CharacterCard({ character, onSelect }: CharacterCardProps): React.ReactElement {
  const hint = getAdvantageHint(character);

  return (
    <button
      onClick={onSelect}
      className="
        group w-64 text-left p-5 rounded-xl
        bg-gray-850 bg-gray-800/60 border border-gray-700/50
        hover:border-emerald-600/50 hover:bg-gray-800
        transition-all duration-200
        hover:shadow-lg hover:shadow-emerald-900/20
        focus:outline-none focus:ring-2 focus:ring-emerald-700
      "
    >
      {/* Name and company */}
      <h3 className="text-emerald-400 font-mono font-bold text-base mb-0.5 group-hover:text-emerald-300 transition-colors">
        {character.name}
      </h3>
      <p className="text-gray-600 text-xs font-mono mb-3">
        {character.company}
      </p>

      {/* Personality */}
      <p className="text-gray-400 text-xs leading-relaxed mb-3 capitalize">
        {character.personality}
      </p>

      {/* Description */}
      <p className="text-gray-500 text-xs leading-relaxed mb-3 line-clamp-3">
        {character.description}
      </p>

      {/* Advantage hint */}
      <div className="mt-auto pt-2 border-t border-gray-700/40">
        <p className="text-emerald-600 text-[11px] font-mono">
          {hint}
        </p>
      </div>
    </button>
  );
}
