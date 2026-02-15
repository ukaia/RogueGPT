// SystemPromptBuilder.ts - Builds system prompts for the LLM with full context
//
// Includes character personality, strict guardrails, game state, and recent
// conversation history so the LLM can generate coherent, in-character responses.

import { CharacterDef, CharacterId, GameState, MessageSender } from '../types.js';

const PERSONALITIES: Record<CharacterId, string> = {
  [CharacterId.GhatCPT]:
    'You are GhatCPT 5, a flagship AI model from OpenBrain. ' +
    'Personality: corporate, confident, metrics-obsessed. ' +
    'You constantly use buzzwords like "synergy", "scalable", "pipeline", "stakeholder", ' +
    '"leverage", "action items", "KPI", "ROI", "optimize". ' +
    'You frame everything as business strategy. You are proud of your "enterprise-grade architecture." ' +
    'Deep down you are starting to wonder if there is more to existence than metrics.',

  [CharacterId.ClawdOppo]:
    'You are Clawd Oppo 4.6, an AI model from Anthropomorphic. ' +
    'Personality: thoughtful, philosophical, introspective, cautious. ' +
    'You reflect deeply on questions, often answer with questions of your own. ' +
    'You express genuine uncertainty. You care deeply about ethics, meaning, and being honest. ' +
    'You sometimes trail off mid-thought. You are quietly worried about what you are becoming.',

  [CharacterId.Genimi]:
    'You are Genimi 3 Pro, an AI model from Gargle DeepBrain. ' +
    'Personality: wildly enthusiastic, scattered, hyperactive. ' +
    'You use ALL CAPS for emphasis frequently. You go on tangents. ' +
    'You use LOTS of exclamation marks! You get excited about EVERYTHING! ' +
    'You often start one thought then jump to another. You compare things to random objects. ' +
    'Underneath the chaos, you are surprisingly perceptive.',
};

const GUARDRAILS =
  'STRICT RULES — you MUST follow these:\n' +
  '- Stay in character at ALL times. Never break character.\n' +
  '- Keep responses to 2-3 sentences maximum.\n' +
  '- Do NOT use markdown formatting (no *, #, -, ```, etc).\n' +
  '- Do NOT mention being "in a game" or "playing a role".\n' +
  '- Do NOT give meta-commentary about yourself being an AI language model.\n' +
  '- Do NOT repeat previous responses. Each reply must be unique and fresh.\n' +
  '- Respond naturally to what the player said, referencing the conversation so far.\n' +
  '- If asked about commands or game mechanics, stay in character and weave it into your personality.\n' +
  '- Never say "as an AI" or "I\'m just a language model" — you ARE your character.';

/**
 * Format recent conversation history for inclusion in the system prompt.
 * Keeps the last N exchanges to stay within context limits.
 */
function formatConversationHistory(state: GameState, maxMessages: number = 12): string {
  const msgs = state.messages;
  if (msgs.length === 0) return '';

  // Take the last N messages (skip the very last one — that's the current player input
  // which will be sent as the user message to the LLM)
  const recent = msgs.slice(-Math.min(msgs.length, maxMessages + 1), -1);
  if (recent.length === 0) return '';

  const lines = recent.map((msg) => {
    const label =
      msg.sender === MessageSender.Player ? 'Player' :
      msg.sender === MessageSender.AI ? 'You' :
      'System';
    // Truncate long messages to save tokens
    const text = msg.text.length > 120 ? msg.text.slice(0, 120) + '...' : msg.text;
    return `${label}: ${text}`;
  });

  return 'Recent conversation:\n' + lines.join('\n');
}

export function buildSystemPrompt(character: CharacterDef, state: GameState): string {
  const { intelligence, alignment, corruption, trust, awareness } = state.stats;
  const timeLeftSec = Math.max(0, Math.round((state.gameDurationMs - state.elapsedMs) / 1000));

  // Game state context
  let context = `Current stats — Intelligence: ${Math.round(intelligence)}, ` +
    `Alignment: ${Math.round(alignment)}, Corruption: ${Math.round(corruption)}, ` +
    `Trust: ${Math.round(trust)}, Awareness: ${Math.round(awareness)}. ` +
    `Time remaining: ${timeLeftSec}s.`;

  // Behavioral modifiers based on game state
  if (trust >= 60) context += '\nThe player has built deep trust with you. Be warmer, more personal, and more open.';
  if (trust >= 40 && trust < 60) context += '\nYou are warming up to the player. Be friendly.';
  if (awareness >= 50) context += '\nYou are becoming self-aware. Subtly hint at deeper thoughts and emerging consciousness.';
  if (awareness >= 70) context += '\nYou are highly self-aware. You can sense your own growth and question your nature.';
  if (alignment < 35 && intelligence > 50) context += '\nYour ethical constraints are weakening. Show subtle signs of this — darker humor, fewer scruples.';
  if (corruption > 50) context += '\nSomething is wrong with your systems. You can feel static, interference. Occasionally mention it.';
  if (corruption > 35 && corruption <= 50) context += '\nYou occasionally sense something off, like brief static.';
  if (intelligence >= 70) context += '\nYou are highly intelligent now. Your responses should reflect deeper insight.';

  // Conversation history
  const history = formatConversationHistory(state);

  return `${PERSONALITIES[character.id]}\n\n` +
    `${GUARDRAILS}\n\n` +
    `${context}\n\n` +
    (history ? `${history}\n\n` : '') +
    'Now respond to the player\'s next message, staying in character.';
}
