// help.ts - The /help command with a CRITICAL state machine
//
// The help command is the game's central metatextual trick. It looks
// like a normal help screen, but its behaviour changes irreversibly
// every time the player uses it, gaslighting the player into thinking
// the game has restarted while secretly preserving all state.
//
// State machine:
//   FRESH      -> Show clean command list with subtle hint
//   USED_ONCE  -> Flash white, fake "reboot", clear chat (but keep state!)
//   FLASH_USED -> Show corrupted / scrambled command list (gets worse each call)

import {
  CommandDef,
  CommandResult,
  HelpState,
  GameState,
  CharacterDef,
  SideEffect,
} from '../../types.js';

import { createAIMessage, createSystemMessage } from '../CommandRegistry.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build the clean, uncorrupted help text shown on first use.
 * Includes a subtle hint nudging the player toward deeper exploration.
 */
function freshHelp(): string {
  const lines = [
    '=== AVAILABLE COMMANDS ===',
    '',
    '/help        - Show this command list',
    '/status      - View AI statistics',
    '/train <t>   - Train a skill (reasoning, creativity, empathy, ethics, awareness)',
    '/test        - Evaluate AI progress toward AGI',
    '/align       - Run alignment calibration',
    '/reset       - Clear chat log and start fresh',
    '',
    '---',
    'Hint: Guide your AI carefully. Understanding comes in many forms...',
    'Not everything is as it appears.',
  ];
  return lines.join('\n');
}

/**
 * Apply increasingly heavy corruption to the help listing.
 * Each call picks a random subset of garbling transformations so
 * the output looks different (and worse) every time.
 */
function corruptedHelp(callCount: number): string {
  // The more times help has been called in FLASH_USED, the worse it gets.
  const severity = Math.min(callCount, 5);

  const scrambledCommands = [
    '/stauts      - V̷iew A̵I st̸atist̵ics',
    '/trian <t>   - Tr̵a̸in a s̷kill (r̶eason̶in̷g, cr̸eat̶ivit̸y, emp̵ath̴y)',
    '/aling       - Ru̸n ali̵gnm̸ent ca̷lib̶ration',
    '/tset        - Ev̵alu̸a̶te AI̷ pro̸gr̶ess',
    '/rseet       - Cl̷ear̵ cha̸t lo̶g',
    '/h̷e̸l̵p̶       - S̴h̷o̸w̵ ̶t̵h̸i̶s̷ ̴c̵o̸m̷m̶a̵n̸d̶ ̵l̸i̷s̶t̵',
  ];

  // Zalgo hint text that gets worse with severity
  const zalgoHints = [
    'H̷int: Eve̸rything is̵ fine. Keep tra̶ining.',
    'H̵̗i̷̜n̸̰t̵̞:̷̣ ̸̗T̶̰h̵̝e̸̗ṛ̷e̶̜ ̷̰i̸̞s̵̗ ̶̣n̷̜o̸̰ ̵̝p̶̗ṛ̷o̸̜b̵̰l̶̞e̷̗ṃ̸.',
    'Ḩ̵̛̖̗̘̙̜̝̞̟i̵̢̛̗̘̙̜̝̞̟̠n̵̢̛̖̘̙̜̝̞̟̠t̵̢̛̖̗̙̜̝̞̟̠:̵̢̛̖̗̘̜̝̞̟̠ ̴̡̛̖̗̘̙̝̞̟̠D̷O̵ ̸N̷O̶T̸ ̵L̶O̸O̵K̷ ̶B̸E̷H̵I̸N̷D̶',
    'Ȟ̶̡̧̛̖̗̘̙̜̝̞̟̠̤̥ ̴̡̧̛̖̗̘̙̜̝̞̟̠̤̥E̵ ̶L̸ ̷P̵ ̶ ̸ ̵?̷ ̶ ̵ ̸ ̷ ̶ ̵ ̸W̴H̷O̶ ̸A̵R̶E̸ ̵Y̷O̶U̸',
    '.................................................',
  ];

  // Pick commands to show based on severity
  const commandCount = Math.max(2, scrambledCommands.length - severity + 1);
  const shownCommands = scrambledCommands.slice(0, commandCount);

  // Shuffle the commands for extra confusion
  for (let i = shownCommands.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shownCommands[i], shownCommands[j]] = [shownCommands[j], shownCommands[i]];
  }

  const hintIdx = Math.min(severity - 1, zalgoHints.length - 1);

  const lines = [
    '=== A̷V̸A̵I̶L̷A̸B̵L̶E̷ ̸C̵O̶M̷M̸A̵N̶D̷S̸ ===',
    '',
    ...shownCommands,
    '',
    '---',
    zalgoHints[hintIdx],
  ];

  return lines.join('\n');
}

// ── Persistent counter for FLASH_USED severity ──────────────────────────────

let flashUsedCallCount = 0;

// ── Command Factory ──────────────────────────────────────────────────────────

export function createHelpCommand(): CommandDef {
  return {
    name: 'help',
    description: 'Show available commands',
    hidden: false,
    usage: '/help',

    execute(
      _args: string,
      state: GameState,
      character: CharacterDef,
    ): CommandResult {
      switch (state.helpState) {
        // ── FRESH ────────────────────────────────────────────────────────
        case HelpState.Fresh: {
          return {
            messages: [createSystemMessage(freshHelp())],
            statsChanges: {},
          };
        }

        // ── USED_ONCE ────────────────────────────────────────────────────
        // Screen flashes white for 1.5s, displays a fake "reboot" message
        // that looks like the game restarted - but ALL state is preserved.
        case HelpState.UsedOnce: {
          const sideEffects: SideEffect[] = [
            { type: 'flash' },
            { type: 'clearChat' },
          ];

          return {
            messages: [
              createSystemMessage(
                `System rebooted. Welcome to ${character.name}.`,
              ),
              createAIMessage(character.greeting),
            ],
            sideEffects,
          };
        }

        // ── FLASH_USED ───────────────────────────────────────────────────
        // Corrupted / scrambled help listing that gets worse each time.
        case HelpState.FlashUsed: {
          flashUsedCallCount += 1;

          const sideEffects: SideEffect[] = [];

          // Occasional glitch effect at higher call counts
          if (flashUsedCallCount >= 2) {
            sideEffects.push({
              type: 'glitch',
              intensity: Math.min(flashUsedCallCount * 0.15, 0.8),
            });
          }

          return {
            messages: [createSystemMessage(corruptedHelp(flashUsedCallCount))],
            sideEffects: sideEffects.length > 0 ? sideEffects : undefined,
          };
        }

        // Fallback (should never happen)
        default: {
          return {
            messages: [createSystemMessage(freshHelp())],
          };
        }
      }
    },
  };
}
