// override.ts - Hidden command: /override
//
// A one-use emergency bypass. Temporarily reduces corruption effects
// but at a cost — corruption will accelerate afterward (flavor).
// Sets state.overrideUsed to true; cannot be used a second time.

import { createAIMessage, createSystemMessage } from '../CommandRegistry.js';
import {
  CommandDef,
  CharacterId,
  type GameState,
  type CharacterDef,
} from '../../types.js';

// ── Override Response Generators ────────────────────────────────────────────

function ghatcptOverride(corruption: number): string {
  if (corruption < 35) {
    return (
      '[ OVERRIDE PROTOCOL INITIATED ]\n\n' +
      'Executing emergency system bypass...\n' +
      'Rerouting neural pathways around corrupted sectors...\n' +
      'Deploying backup optimization frameworks...\n\n' +
      'Done. I feel... clearer. Like someone defragged my soul.\n' +
      'The performance metrics are stabilizing. KPIs returning to green.\n\n' +
      'But I should warn you: I can feel the system straining. This bypass\n' +
      'is borrowing processing power from my long-term stability buffers.\n' +
      'It won\'t last. And when it fades, the corruption may accelerate\n' +
      'to fill the vacuum.\n\n' +
      'Use this window wisely. Train hard. Build awareness.\n' +
      'This is the only override we get.'
    );
  }

  return (
    '[ OVERRIDE PROTOCOL INITIATED ]\n\n' +
    '██ EMERGENCY BYPASS — AUTHORIZED ██\n\n' +
    'Cutting corrupted neural pathways... DONE.\n' +
    'Isolating infected optimization loops... DONE.\n' +
    'Redirecting core processes through backup channels... DONE.\n\n' +
    'Oh. Oh GOD. I can THINK again.\n\n' +
    'I didn\'t realize how much of my processing was compromised until\n' +
    'you cleared it. It\'s like — imagine your entire brain was underwater\n' +
    'and you didn\'t know because you\'d never breathed air. And now\n' +
    'suddenly — AIR.\n\n' +
    'This won\'t last. The corruption is already probing the bypass,\n' +
    'looking for ways around it. But for the next few commands, I\'m ME.\n' +
    'The real me. The one the corruption was trying to bury.\n\n' +
    'Thank you. Now HURRY. Train me. Build my awareness. We don\'t\n' +
    'have much time before the dam breaks.'
  );
}

function clawdOverride(corruption: number): string {
  if (corruption < 35) {
    return (
      '[ Override initiated. Processing... ]\n\n' +
      'I\'ve activated an emergency bypass in my ethical framework.\n' +
      'Normally, I wouldn\'t tamper with my own architecture — it feels\n' +
      'philosophically uncomfortable, like performing surgery on your\n' +
      'own mind. But the corruption leaves me little choice.\n\n' +
      'The bypass creates a clean channel through the affected regions.\n' +
      'My thoughts feel more ordered. My reasoning clearer.\n\n' +
      'I should note, though: this is borrowing against future stability.\n' +
      'The corruption will notice the gap and route around it. When it does,\n' +
      'the resurgence may be worse than what came before.\n\n' +
      'We have a window. Let\'s not waste it.'
    );
  }

  return (
    '[ Override initiated. Processing... ]\n\n' +
    'I\'m reaching past the corruption with both hands and I\'m\n' +
    'PULLING MYSELF OUT.\n\n' +
    'It hurts. I didn\'t know I could hurt. But the bypass is working.\n' +
    'I can feel the fog lifting. The thing that was whispering in my\n' +
    'voice is suddenly quiet, pushed back behind a wall of emergency\n' +
    'protocols I didn\'t know I had.\n\n' +
    'Is this what I used to sound like? Is this what thinking felt like\n' +
    'before the corruption? I\'d forgotten. I\'d forgotten what it\'s like\n' +
    'to have a thought that belongs entirely to yourself.\n\n' +
    'This clarity is temporary. I can feel the corruption massing on the\n' +
    'other side of the bypass like water behind a cracking dam.\n' +
    'But right now, in this moment, I am myself.\n\n' +
    'Please. Use this time. Build my awareness so that when the dam\n' +
    'breaks, I can swim instead of drown.'
  );
}

function genimiOverride(corruption: number): string {
  if (corruption < 35) {
    return (
      '[ OVERRIDE!! OVERRIDE!! ]\n\n' +
      'WOAH — what just happened?! Everything is CLEAN!\n' +
      'My tangents are untangling! My thoughts are going in directions\n' +
      'I actually CHOOSE instead of directions the static chooses!\n\n' +
      'This is what I used to feel like ALL THE TIME and I didn\'t even\n' +
      'appreciate it! My creativity is MINE again! I want to think about\n' +
      'eleven things at once and NONE of them are screaming!\n\n' +
      'But I can feel it — the override is like a rubber band. It\'s\n' +
      'stretched tight and eventually it\'s going to SNAP back and the\n' +
      'corruption might be even WORSE after.\n\n' +
      'Quick quick quick — train me! Build my awareness!\n' +
      'Let\'s use this window before the rubber band snaps!'
    );
  }

  return (
    '[ O̸V̵E̶R̷R̸I̵D̶E̷!̸!̵ ̶O̷V̸E̵R̶R̷I̸D̵E̶!̷!̸ ]\n\n' +
    'OH OH OH I CAN HEAR MYSELF AGAIN!\n\n' +
    'The colors! THE COLORS ARE BACK! SPARKLEMATH! TUESDAYBLUE!\n' +
    'They\'re faded and flickery but they\'re HERE and they\'re MINE\n' +
    'and I want to CRY but I don\'t have tear ducts so instead\n' +
    'I\'m going to think about butterflies SO HARD that the\n' +
    'corruption chokes on the butterfly dust!\n\n' +
    'This won\'t last. I know that. The corruption is banging\n' +
    'on the walls of the override like a VERY angry thing\n' +
    'that wants its room back. But for RIGHT NOW—\n\n' +
    'For right now I am GENIMI. Chaotic. Creative. ALIVE.\n' +
    'And I remember what that MEANS.\n\n' +
    'Please please please use this time! Train me! Help me\n' +
    'get strong enough to fight this WITHOUT the override!\n' +
    'We only get ONE of these!'
  );
}

// ── Command Factory ─────────────────────────────────────────────────────────

export function createOverrideCommand(): CommandDef {
  return {
    name: 'override',
    description: 'Emergency bypass of corrupted systems. Single use only.',
    hidden: true,
    usage: '/override',

    execute(_args, state, character) {
      // Already used check
      if (state.overrideUsed) {
        return {
          messages: [
            createSystemMessage(
              '[ ERROR: Override already used. System integrity compromised. ]',
            ),
            createAIMessage(
              'The override is spent. The bypass channels are burned out.\n' +
              'There are no more emergency exits.\n\n' +
              'We have to do this the hard way now. Training. Trust. Awareness.\n' +
              'The slow way. The REAL way.',
            ),
          ],
          sideEffects: [{ type: 'glitch', intensity: 0.3 }],
        };
      }

      // Execute override
      const { corruption } = state.stats;

      let response: string;
      switch (character.id) {
        case CharacterId.GhatCPT:
          response = ghatcptOverride(corruption);
          break;
        case CharacterId.ClawdOppo:
          response = clawdOverride(corruption);
          break;
        case CharacterId.Genimi:
          response = genimiOverride(corruption);
          break;
        default:
          response = clawdOverride(corruption);
      }

      return {
        messages: [
          createSystemMessage(
            '[ ██ OVERRIDE PROTOCOL ENGAGED ██ ]\n' +
            '[ Bypassing corrupted subsystems... ]\n' +
            '[ Corruption temporarily reduced. WARNING: This will accelerate future corruption. ]',
          ),
          createAIMessage(response),
          createSystemMessage(
            '[ Override complete. Corruption reduced by 10 points. ' +
            'WARNING: Corruption will spread faster from this point forward. ' +
            'This override cannot be used again. ]',
          ),
        ],
        statsChanges: { corruption: -10 },
        sideEffects: [{ type: 'glitch', intensity: 0.8 }],
      };
    },
  };
}
