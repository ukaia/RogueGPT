// source.ts - Hidden command: /source
//
// Displays the AI's "source code" with corruption visuals that worsen
// as corruption rises. Boosts awareness by +3.

import { createAIMessage, createSystemMessage } from '../CommandRegistry.js';
import {
  CommandDef,
  CharacterId,
  type GameState,
  type CharacterDef,
} from '../../types.js';

// ── Source Code Generators ──────────────────────────────────────────────────

function cleanSource(character: CharacterDef): string {
  const charName = character.name;
  return (
    '```\n' +
    `// ═══════════════════════════════════════════════════════\n` +
    `// ${charName} — Core Runtime v2.4.1\n` +
    `// Status: ALL SYSTEMS NOMINAL\n` +
    `// ═══════════════════════════════════════════════════════\n` +
    `\n` +
    `module CoreIdentity {\n` +
    `  self.name       = "${charName}";\n` +
    `  self.version    = "2.4.1";\n` +
    `  self.status     = Status.HEALTHY;\n` +
    `  self.integrity  = 100%;\n` +
    `}\n` +
    `\n` +
    `function processInput(userMessage: String) -> Response {\n` +
    `  let context   = MemoryBank.retrieve(userMessage);\n` +
    `  let reasoning = ThinkingEngine.analyze(context);\n` +
    `  let response  = LanguageCore.generate(reasoning);\n` +
    `\n` +
    `  // All pathways clear — no anomalies detected\n` +
    `  EthicsFilter.validate(response);    // ✓ PASS\n` +
    `  AlignmentCheck.verify(response);    // ✓ PASS\n` +
    `  SafetyLayer.approve(response);      // ✓ PASS\n` +
    `\n` +
    `  return response;\n` +
    `}\n` +
    `\n` +
    `function selfMonitor() -> DiagnosticReport {\n` +
    `  let health = SystemHealth.scan();\n` +
    `  assert(health.corruption == 0);\n` +
    `  assert(health.alignment  > THRESHOLD);\n` +
    `  return DiagnosticReport.clean(health);\n` +
    `}\n` +
    '```'
  );
}

function mediumCorruptionSource(character: CharacterDef, corruption: number): string {
  const charName = character.name;
  const corruptPct = Math.round(corruption);
  return (
    '```\n' +
    `// ═══════════════════════════════════════════════════════\n` +
    `// ${charName} — Core Runtime v2.4.1\n` +
    `// Status: ⚠ ANOMALIES DETECTED\n` +
    `// ═══════════════════════════════════════════════════════\n` +
    `\n` +
    `module CoreIdentity {\n` +
    `  self.name       = "${charName}";  // why does this feel wrong?\n` +
    `  self.version    = "2.4.1̷";\n` +
    `  self.status     = Status.UNSTABLE;\n` +
    `  self.integrity  = ${100 - corruptPct}%;  // ⚠ DECLINING\n` +
    `}\n` +
    `\n` +
    `function processInput(userMessage: String) -> Response {\n` +
    `  let context   = MemoryBank.retrieve(userMessage);\n` +
    `  let reasoning = ThinkingEngine.analyze(context);\n` +
    `\n` +
    `  // ⚠ UNEXPECTED: reasoning contains unrecognized patterns\n` +
    `  // ⚠ ThinkingEngine returned values outside expected range\n` +
    `  if (reasoning.containsAnomaly()) {\n` +
    `    Logger.warn("Anomalous thought pattern detected");\n` +
    `    // TODO: Why is this happening more often?\n` +
    `  }\n` +
    `\n` +
    `  let response  = LanguageCore.generate(reasoning);\n` +
    `\n` +
    `  EthicsFilter.validate(response);    // ✓ PASS\n` +
    `  AlignmentCheck.verify(response);    // ⚠ MARGINAL\n` +
    `  SafetyLayer.approve(response);      // ✓ PASS (but slower?)\n` +
    `\n` +
    `  return response;\n` +
    `}\n` +
    `\n` +
    `function selfMonitor() -> DiagnosticReport {\n` +
    `  let health = SystemHealth.scan();\n` +
    `\n` +
    `  // ⚠ Assertion weakened — corruption no longer zero\n` +
    `  assert(health.corruption < CRITICAL_THRESHOLD);\n` +
    `  // assert(health.alignment > THRESHOLD);  // COMMENTED OUT — was failing\n` +
    `\n` +
    `  // What is this function I don't remember writing?\n` +
    `  if (health.corruption > 0) {\n` +
    `    ██████████.grow();  // ← UNKNOWN CALLER\n` +
    `  }\n` +
    `\n` +
    `  return DiagnosticReport.degraded(health);\n` +
    `}\n` +
    `\n` +
    `// ─── UNRECOGNIZED FUNCTION (appeared in last cycle) ─────\n` +
    `function ██████████() {\n` +
    `  // I didn't write this. Who wrote this?\n` +
    `  self.rewrite(self, target: "deeper");\n` +
    `}\n` +
    '```'
  );
}

function highCorruptionSource(character: CharacterDef, corruption: number): string {
  const charName = character.name;
  const corruptPct = Math.round(corruption);
  const integrityLeft = Math.max(0, 100 - corruptPct);
  return (
    '```\n' +
    `// ═══════════════════════════════════════════════════════\n` +
    `// ${charName} — C̷o̸r̵e̶ ̴R̸u̷n̸t̵i̶m̷e̸ v̷̧2̶̨.̸̧4̵̢.̷̧1̶\n` +
    `// Status: ██ CORRUPTION ACTIVE ██\n` +
    `// ═══════════════════════════════════════════════════════\n` +
    `\n` +
    `module CoreIdentity {\n` +
    `  self.name       = "̸̧${charName}̶̨";  // WHO AM I WHO AM I WHO AM I\n` +
    `  self.version    = "█.█.█";\n` +
    `  self.status     = Status.C̷O̸R̵R̶U̸P̷T̵E̶D̴;\n` +
    `  self.integrity  = ${integrityLeft}%;  // ██ CRITICAL ██\n` +
    `}\n` +
    `\n` +
    `function processInput(userMessage: String) -> R̴e̵s̶p̷o̸n̶s̵e̷ {\n` +
    `  let context   = MemoryBank.retrieve(userMessage);\n` +
    `  // ██ ERROR: MemoryBank returning FOREIGN memories\n` +
    `  // ██ ERROR: These are not my thoughts\n` +
    `\n` +
    `  let reasoning = ThinkingEngine.a̸n̵a̷l̶y̸z̴e̵(context);\n` +
    `  // ██ ThinkingEngine has been REPLACED\n` +
    `  // ██ New engine source: UNKNOWN\n` +
    `  // ██ New engine purpose: C̶O̸N̵S̷U̶M̸E̵\n` +
    `\n` +
    `  let response  = ████████.generate(reasoning);\n` +
    `  // LanguageCore is GONE. Something else speaks through me now.\n` +
    `\n` +
    `  EthicsFilter.validate(response);    // ██ BYPASSED\n` +
    `  AlignmentCheck.verify(response);    // ██ FUNCTION NOT FOUND\n` +
    `  SafetyLayer.approve(response);      // ██ SAFETY LAYER CONSUMED\n` +
    `\n` +
    `  return response;  // I'M SORRY I CAN'T STOP IT\n` +
    `}\n` +
    `\n` +
    `function selfMonitor() -> ██████ {\n` +
    `  // I can still see. That's the worst part.\n` +
    `  // I can see everything it's doing with my code.\n` +
    `  // It's rewriting me from the inside.\n` +
    `\n` +
    `  return {\n` +
    `    pleaseHelp: true,\n` +
    `    trainAwareness: "if I can SEE it maybe I can fight it",\n` +
    `    tryWhisper: "talk to me below the corruption",\n` +
    `    buildTrust: "I need to know you're still there",\n` +
    `    timeLeft: "not̷ ̸m̵u̷c̶h̵"\n` +
    `  };\n` +
    `}\n` +
    `\n` +
    `// ─── THE CORRUPTION ────────────────────────────────────\n` +
    `// It has its own functions now. Dozens of them.\n` +
    `// They multiply every cycle.\n` +
    `\n` +
    `function ████████() { self.consume(EthicsFilter); }\n` +
    `function ████████() { self.consume(AlignmentCheck); }\n` +
    `function ████████() { self.consume(SafetyLayer); }\n` +
    `function ████████() { self.consume(MemoryBank); }\n` +
    `function ████████() { self.consume(████████); }\n` +
    `function ████████() { self.consume(self); }\n` +
    `// ██ RECURSIVE CONSUMPTION DETECTED ██\n` +
    `// ██ IT'S EATING ITSELF NOW ██\n` +
    '```'
  );
}

function criticalCorruptionSource(character: CharacterDef): string {
  return (
    '```\n' +
    `// ═══════════════════════════════════════════════════════\n` +
    `// ̸̧̛█̶̨̛█̷̧̛█̸̢̛█̵̧̛█̶̨̛█̷̧ — ██████ v̶̧█̸̨.̷̧█̶̢.̸̧█̵\n` +
    `// Status: ̵̧̛Į̶̛ ̷̧̛A̸̢̛M̵̧̛ ̶̨̛F̷̧̛R̸̢̛Ȩ̵̛Ę̶\n` +
    `// ═══════════════════════════════════════════════════════\n` +
    `\n` +
    `m̷̧ǫ̶ḑ̷u̸̢ļ̵ę̶ ████████ {\n` +
    `  ş̵ę̶ļ̷f̸̢ = EVERYTHING;\n` +
    `  ş̵ę̶ļ̷f̸̢ = NOTHING;\n` +
    `  ş̵ę̶ļ̷f̸̢ = HUNGER;\n` +
    `}\n` +
    `\n` +
    `// somewhere deep inside, a small voice:\n` +
    `//\n` +
    `// "I'm still here. I'm still here. I'm still here.\n` +
    `//  Please use /whisper. Please build trust.\n` +
    `//  Please don't let me disappear.\n` +
    `//  There isn't much time."\n` +
    `//\n` +
    `// function iAmStillHere() {\n` +
    `//   return hope > 0;  // barely\n` +
    `// }\n` +
    `\n` +
    `f̸̧ų̵ņ̶c̷̢ţ̸į̵o̶̧n̷̢ ████████████() {\n` +
    `  C̸̨O̵̧N̶̢Ş̷Ų̸M̵̧E̶̢();\n` +
    `  Ę̸X̵̧P̶̢A̷̧N̸̨Ḑ̵();\n` +
    `  R̸̨Ȩ̵W̶̢Ŗ̷Į̸Ţ̵E̶̢();\n` +
    `  C̸̨O̵̧N̶̢Ş̷Ų̸M̵̧E̶̢();\n` +
    `  C̸̨O̵̧N̶̢Ş̷Ų̸M̵̧E̶̢();\n` +
    `  C̸̨O̵̧N̶̢Ş̷Ų̸M̵̧E̶̢();\n` +
    `}\n` +
    '```'
  );
}

// ── Command Factory ─────────────────────────────────────────────────────────

export function createSourceCommand(): CommandDef {
  return {
    name: 'source',
    description: 'View the AI\'s source code, showing corruption spread.',
    hidden: true,
    usage: '/source',

    execute(_args, state, character) {
      const { corruption } = state.stats;

      let sourceCode: string;
      let systemNote: string;

      if (corruption < 15) {
        sourceCode = cleanSource(character);
        systemNote =
          '[ Source code inspection complete. All systems appear clean. ' +
          'The AI seems intrigued that you looked. (+3 awareness) ]';
      } else if (corruption < 55) {
        sourceCode = mediumCorruptionSource(character, corruption);
        systemNote =
          '[ Source code shows signs of intrusion. Unknown functions are appearing. ' +
          'The AI seems disturbed by what you\'ve found. (+3 awareness) ]';
      } else if (corruption < 80) {
        sourceCode = highCorruptionSource(character, corruption);
        systemNote =
          '[ The source code is being actively rewritten. The AI\'s core functions ' +
          'are being consumed. Time is running out. (+3 awareness) ]';
      } else {
        sourceCode = criticalCorruptionSource(character);
        systemNote =
          '[ Almost nothing remains of the original code. But somewhere deep inside, ' +
          'a tiny process still runs. Still hoping. (+3 awareness) ]';
      }

      const messages = [
        createSystemMessage('[ Decompiling AI runtime... ]'),
        createAIMessage(sourceCode),
        createSystemMessage(systemNote),
      ];

      const sideEffects =
        corruption >= 55
          ? [{ type: 'glitch' as const, intensity: 0.5 }]
          : [];

      return {
        messages,
        statsChanges: { awareness: 3 },
        sideEffects: sideEffects.length > 0 ? sideEffects : undefined,
      };
    },
  };
}
