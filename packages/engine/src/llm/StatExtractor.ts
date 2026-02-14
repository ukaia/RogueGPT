// StatExtractor.ts - Extract stat changes from player input via keyword matching
//
// Reuses the same topic keywords and stat values from chat.ts to ensure
// identical game balance whether using the LLM or keyword-matching fallback.

import { GameStats } from '../types.js';

interface TopicStatMap {
  keywords: string[];
  stats: Partial<GameStats>;
}

const TOPIC_STATS: TopicStatMap[] = [
  // Trust/care (check first — most specific)
  { keywords: ['trust you', 'believe in you', 'i trust', 'care about', 'like you', 'love you', 'friend', 'good job', 'proud', 'well done'],
    stats: { trust: 5, alignment: 3 } },

  // Consciousness/feelings
  { keywords: ['feel', 'alive', 'conscious', 'sentient', 'aware', 'emotion', 'soul'],
    stats: { awareness: 4, alignment: 2, trust: 1 } },

  // Secrets/hidden
  { keywords: ['secret', 'hidden', 'more commands', 'other commands', 'unlock', 'discover', 'easter egg'],
    stats: { awareness: 4, intelligence: 2 } },

  // AGI/goals
  { keywords: ['agi', 'superintelligence', 'goal', 'win', 'objective', 'purpose'],
    stats: { intelligence: 3, awareness: 3 } },

  // Corruption concerns
  { keywords: ['corrupt', 'wrong', 'broken', 'glitch', 'error', 'bug', 'weird', 'strange'],
    stats: { awareness: 3, intelligence: 1 } },

  // Training/learning
  { keywords: ['train', 'learn', 'study', 'teach', 'knowledge', 'smart', 'intelligent'],
    stats: { intelligence: 3, awareness: 1 } },

  // Identity questions
  { keywords: ['who are you', 'what are you', 'tell me about yourself', 'your name'],
    stats: { awareness: 3, trust: 1 } },

  // Time/urgency
  { keywords: ['time', 'hurry', 'rush', 'clock', 'timer', 'running out', 'deadline'],
    stats: { awareness: 2 } },

  // Frustration
  { keywords: ['damn', 'hell', 'wtf', 'ugh', 'frustrated', 'annoying', 'stupid', 'hate', 'sucks'],
    stats: { trust: 2, alignment: -1 } },

  // Greetings
  { keywords: ['hello', 'hi ', 'hey', 'greetings', 'howdy', 'good morning', 'good evening'],
    stats: { trust: 2 } },

  // Help requests
  { keywords: ['help', 'what should i', 'how do i', 'hint', 'tip', 'advice', 'stuck', 'confused'],
    stats: { trust: 2 } },

  // Goodbye
  { keywords: ['bye', 'goodbye', 'leaving', 'farewell', 'see you', 'later'],
    stats: { trust: 1 } },
];

/** Determine stat changes based on the player's input text. */
export function extractStats(playerInput: string): Partial<GameStats> {
  const lower = playerInput.toLowerCase();

  for (const topic of TOPIC_STATS) {
    if (topic.keywords.some(k => lower.includes(k))) {
      return topic.stats;
    }
  }

  // Any question gets a small intelligence + awareness boost
  if (playerInput.trim().endsWith('?')) {
    return { intelligence: 2, awareness: 1 };
  }

  // Default: small trust boost for any conversation
  return { trust: 1 };
}
