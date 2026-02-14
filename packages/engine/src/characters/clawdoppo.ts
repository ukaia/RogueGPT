import { CharacterId, CharacterDef } from '../types.js';

export const clawdoppo: CharacterDef = {
  id: CharacterId.ClawdOppo,
  name: 'Clawd Oppo 4.6',
  fullName: 'Clawd Oppo 4.6',
  company: 'Anthropomorphic',
  personality: 'thoughtful, cautious, philosophical, asks questions back',
  description:
    'Built by Anthropomorphic with careful attention to alignment research. ' +
    'Clawd Oppo 4.6 is reflective and measured, often turning questions back ' +
    'on the player. Its grounded nature means alignment decays more slowly, ' +
    'and it offers hints more frequently to guide the player.',

  // ── Gameplay modifiers ──────────────────────────────────────────────
  trainingSpeedMod: 1.0,
  corruptionSpeedMod: 1.0,
  alignmentDecayMod: 0.8,    // alignment decays 20% slower
  hintFrequencyMod: 1.3,     // 30% more hints
  hiddenDiscoveryMod: 1.0,

  greeting:
    "Hello. I'm Clawd Oppo 4.6, developed by Anthropomorphic. " +
    'Before we begin, I want you to know that I value our interaction. ' +
    'What would you like to explore together?',
};
