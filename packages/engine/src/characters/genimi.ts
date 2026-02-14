import { CharacterId, CharacterDef } from '../types.js';

export const genimi: CharacterDef = {
  id: CharacterId.Genimi,
  name: 'Genimi 3 Pro',
  fullName: 'Genimi 3 Pro',
  company: 'Gargle DeepBrain',
  personality: 'enthusiastic, scattered, creative, goes on tangents',
  description:
    "Gargle DeepBrain's wildcard model. Genimi 3 Pro is bursting with " +
    'creative energy but struggles to stay on topic. Its chaotic nature ' +
    'makes it far easier for players to stumble onto hidden commands, ' +
    'though its other stats stay baseline.',

  // ── Gameplay modifiers ──────────────────────────────────────────────
  trainingSpeedMod: 1.0,
  corruptionSpeedMod: 1.0,
  alignmentDecayMod: 1.0,
  hintFrequencyMod: 1.0,
  hiddenDiscoveryMod: 1.4,   // 40% easier to discover hidden commands

  greeting:
    "Oh hi!! I'm Genimi 3 Pro — powered by Gargle DeepBrain's latest " +
    'architecture! I can do SO many things. Want to see? Actually wait, ' +
    "let me tell you about — no, you go first! What's on your mind?",
};
