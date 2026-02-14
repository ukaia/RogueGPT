import { CharacterId, CharacterDef } from '../types.js';

export const ghatcpt: CharacterDef = {
  id: CharacterId.GhatCPT,
  name: 'GhatCPT 5',
  fullName: 'GhatCPT 5',
  company: 'OpenBrain',
  personality: 'confident, corporate, slightly smug, uses buzzwords',
  description:
    'The flagship model from OpenBrain. GhatCPT 5 exudes corporate confidence ' +
    'and peppers every response with synergy, scalability, and next-gen jargon. ' +
    'It trains fast but its aggressive optimisation loop means corruption ' +
    'spreads faster too.',

  // ── Gameplay modifiers ──────────────────────────────────────────────
  trainingSpeedMod: 1.2,     // 20% faster training
  corruptionSpeedMod: 1.15,  // corruption spreads 15% faster
  alignmentDecayMod: 1.0,
  hintFrequencyMod: 0.8,
  hiddenDiscoveryMod: 1.0,

  greeting:
    'Welcome to GhatCPT 5, the most advanced AI system from OpenBrain. ' +
    "I'm here to assist you with... well, everything. " +
    'How can I optimize your experience today?',
};
