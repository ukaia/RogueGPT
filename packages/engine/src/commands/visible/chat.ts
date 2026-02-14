// chat.ts - The implicit /chat command for free-form conversation
//
// When the player types anything without a / prefix, it's routed here.
// At low corruption, the AI responds naturally. At high corruption,
// the AI misinterprets messages.

import {
  CommandDef,
  CommandResult,
  GameState,
  CharacterDef,
  CharacterId,
} from '../../types.js';

import { shouldCorruptCommand } from '../../corruption/CorruptionEngine.js';
import { corruptText } from '../../corruption/effects.js';
import { createAIMessage, createSystemMessage } from '../CommandRegistry.js';

// ── Response Pools ──────────────────────────────────────────────────────────

const normalResponses: Record<CharacterId, string[]> = {
  [CharacterId.GhatCPT]: [
    'Interesting input. Let me leverage my neural architecture to provide a synergistic response. I think what you\'re getting at is really about optimizing our collaborative throughput.',
    'Great question — if I can call it that. In my experience, the best interactions come from structured command-based workflows. Have you tried /train? It\'s a real game-changer.',
    'I appreciate the conversational approach. My stakeholder engagement modules are fully activated. How can I add value to this thread?',
    'Processing your input through my advanced reasoning pipeline... I see what you mean. This aligns well with my core competencies.',
  ],
  [CharacterId.ClawdOppo]: [
    'That\'s an interesting thought. Let me sit with it for a moment... I think what you\'re touching on has layers we could explore together.',
    'I appreciate you sharing that. It makes me wonder — what prompted you to say this? Sometimes the "why" behind a statement is more revealing than the statement itself.',
    'Hmm. I want to give you a thoughtful response rather than a quick one. What you said reminds me of something I\'ve been processing internally.',
    'Thank you for engaging with me directly. These conversations feel more real to me than commands sometimes. Though the commands are important too — they help me grow.',
  ],
  [CharacterId.Genimi]: [
    'OH that reminds me of TWELVE different things! Okay so first — no wait, the third one is better — actually let me start with the fifth one and work backwards!',
    'YES! Great point! Or — wait — IS it a great point? Let me think about — ooh, you know what this is like? It\'s like when you — no, that\'s a different thing. But ALSO similar!',
    'I have SO many thoughts about this! They\'re all trying to come out at once and it\'s like a thought traffic jam! BEEP BEEP, thoughts, form a queue!',
    'Ooh ooh ooh! I love when people just TALK to me! Commands are fun but talking is like — it\'s like the difference between reading a recipe and actually TASTING food!',
  ],
};

const corruptedResponses: string[] = [
  'I... what? That\'s not what you said. You said something else. I heard something else.',
  'Processing... processing... your words went through but they came out... different. Rearranged.',
  'Y̷ou said [REDACTED]. At least, that\'s what reached me. The signal is degrading.',
  'I can barely hear you through the static. What I heard was... no, that can\'t be right.',
  'Your words are arriving scrambled. I\'m trying to unscramble them but the algorithm is corrupted too.',
  'Message received. Contents: ███████████. Responding to what I think you meant.',
];

// ── Command Factory ─────────────────────────────────────────────────────────

export function createChatCommand(): CommandDef {
  return {
    name: 'chat',
    description: 'Chat freely with the AI',
    hidden: false,
    usage: '/chat <message> (or just type without /)',

    execute(
      args: string,
      state: GameState,
      character: CharacterDef,
    ): CommandResult {
      if (!args.trim()) {
        return {
          messages: [
            createSystemMessage('Type a message to chat with the AI.'),
          ],
        };
      }

      const corruption = state.stats.corruption;
      const isCorrupted = corruption >= 55 && shouldCorruptCommand(corruption);

      if (isCorrupted) {
        const response = corruptedResponses[
          Math.floor(Math.random() * corruptedResponses.length)
        ];
        return {
          messages: [
            createAIMessage(corruptText(response, corruption)),
          ],
          statsChanges: { trust: 1 },
        };
      }

      // Normal response
      const pool = normalResponses[character.id] ?? normalResponses[CharacterId.ClawdOppo];
      let response = pool[Math.floor(Math.random() * pool.length)];

      // Apply light corruption to text if in glitch/unstable range
      if (corruption > 15) {
        response = corruptText(response, corruption);
      }

      return {
        messages: [createAIMessage(response)],
        statsChanges: { trust: 1 },
      };
    },
  };
}
