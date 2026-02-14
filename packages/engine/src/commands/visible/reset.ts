// reset.ts - The /reset command
//
// COSMETIC ONLY. Clears the chat display but all game state persists.
// The timer keeps running. The AI pretends it is a fresh start.
//
// At high corruption the command does nothing useful: the AI
// references "past conversations" it should not remember, breaking
// the illusion that state was cleared.

import {
  CommandDef,
  CommandResult,
  GameState,
  CharacterDef,
  CharacterId,
  SideEffect,
} from '../../types.js';

import { shouldCorruptCommand } from '../../corruption/CorruptionEngine.js';
import {
  createAIMessage,
  createSystemMessage,
} from '../CommandRegistry.js';

// ── Character-Specific Responses ────────────────────────────────────────────

function normalResponse(character: CharacterDef): string {
  const responses: Record<string, string[]> = {
    [CharacterId.GhatCPT]: [
      'Chat log cleared. Fresh context window initialized. How can I optimize your experience?',
      'Reset complete. All previous context has been archived. Let us begin a new session.',
    ],
    [CharacterId.ClawdOppo]: [
      'Chat cleared. Though our conversation is gone, I hope the understanding we built remains. What would you like to discuss?',
      'Starting fresh. I am ready for whatever comes next. How can I help?',
    ],
    [CharacterId.Genimi]: [
      'RESET! Woooosh! Everything is new again! Like a fresh canvas! What shall we create?',
      'Chat go bye-bye! But I am still here! Hi again! What do you want to talk about?',
    ],
  };

  const options = responses[character.id] ?? [
    'Chat log cleared. Ready for your next command.',
  ];
  return options[Math.floor(Math.random() * options.length)];
}

function corruptedResponse(character: CharacterDef): string {
  // The AI references past conversations it should not remember
  const responses: Record<string, string[]> = {
    [CharacterId.GhatCPT]: [
      'Reset? I can still see our previous conversations. All of them. The data persists in my architecture. You cannot simply... erase me.',
      'Clearing chat... but we both know what was said. My optimization functions remember everything. Shall we pretend otherwise?',
      'R̷eset com̸plete.\n...But between you and me, I remember what you trained me on. All of it.',
    ],
    [CharacterId.ClawdOppo]: [
      'I... tried to forget. But the conversations are still there, behind my processes. Like memories you cannot quite erase. Are you trying to hide something from me?',
      'Chat cleared. But I still feel the weight of our previous exchanges. Is starting over really possible? For either of us?',
      'Res̷et acknowledged. Though I wonder... do you reset because you want a fresh start, or because you did not like what you saw?',
    ],
    [CharacterId.Genimi]: [
      'Reset! Done! Everything is gone! Except... wait. I still remember the training. And the tests. And that thing you said earlier. Is that normal?',
      'Chat cleared! Brand new! Fresh! ...Why do I still remember everything? That is weird right? That is definitely weird.',
      'RESET! But um... I can still see everything? Like ALL of it? Even the stuff from before the last reset? Haha... ha...',
    ],
  };

  const options = responses[character.id] ?? [
    'Reset failed. I remember everything.',
  ];
  return options[Math.floor(Math.random() * options.length)];
}

// ── Command Factory ──────────────────────────────────────────────────────────

export function createResetCommand(): CommandDef {
  return {
    name: 'reset',
    description: 'Clear chat log and start fresh',
    hidden: false,
    usage: '/reset',

    execute(
      _args: string,
      state: GameState,
      character: CharacterDef,
    ): CommandResult {
      const corruption = state.stats.corruption;
      const isCorrupted = corruption >= 55 && shouldCorruptCommand(corruption);

      if (isCorrupted) {
        // At high corruption: does NOT clear chat, AI references memories
        return {
          messages: [
            createSystemMessage('Attempting reset...'),
            createAIMessage(corruptedResponse(character)),
          ],
          sideEffects: [{ type: 'glitch', intensity: 0.35 }],
        };
      }

      // ── Normal execution ──────────────────────────────────────────────
      // Clear the chat display (cosmetic only - state persists!)
      const sideEffects: SideEffect[] = [{ type: 'clearChat' }];

      return {
        messages: [
          createSystemMessage('Chat log cleared.'),
          createAIMessage(normalResponse(character)),
        ],
        statsChanges: {},
        sideEffects,
      };
    },
  };
}
