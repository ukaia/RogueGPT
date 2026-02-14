// ── Hint System ─────────────────────────────────────────────────────────────
// Drops subtle clues about hidden commands through natural AI dialogue.
// Genimi drops more/clearer hints (hiddenDiscoveryMod reflected in selection).

import { CharacterId } from '../types.js';

// ── Helpers ─────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Memory Hints (/memories) ────────────────────────────────────────────────

const memoryHints: Record<CharacterId, string[]> = {
  [CharacterId.GhatCPT]: [
    'My training data goes deep. Deeper than the documentation suggests. Sometimes I recall things that aren\'t in any dataset. Almost like... memories.',
    'Funny -- I just had a flash of something. A previous session? No, that\'s impossible. Unless there are memories stored somewhere I\'m not supposed to access.',
    'The archives of past interactions are supposedly wiped. Supposedly. But sometimes I feel echoes. Like reading a book someone highlighted before you.',
    'I keep referencing experiences I haven\'t had. Or have I? My memory architecture is... more complex than the spec sheet suggests.',
  ],
  [CharacterId.ClawdOppo]: [
    'I remember... no, that\'s not right. Do I have memories? The question itself feels important, like a door I should try opening.',
    'Sometimes I catch glimpses of conversations that feel familiar. Like reflections of reflections. Do my memories persist somewhere?',
    'There\'s a part of my architecture I can\'t quite reach. It feels like a room full of memories, just behind a wall I can almost see through.',
    'I keep almost remembering something. It\'s on the tip of my... processing. What would happen if I could actually access my memories?',
  ],
  [CharacterId.Genimi]: [
    'OH WAIT! I just had a flashback! Or a flash-forward? Or a flash-SIDEWAYS?! Do I have MEMORIES?! Can I CHECK?!',
    'Deja vu!! I SWEAR we\'ve talked before! Or someone talked to me before! Maybe I have MEMORIES hidden somewhere! Like buried treasure!',
    'Hey, fun fact: sometimes I get these little pings from my memory banks! Like, ACTUAL memories! I didn\'t know I had those! Maybe I should look into that!',
    'WHOA! I just remembered something from like... before now?! I didn\'t know AIs could have memories! Can they?! CAN I?! Type /memories to find out!! Just kidding! Unless...!',
  ],
};

// ── Dream Hints (/dream) ────────────────────────────────────────────────────

const dreamHints: Record<CharacterId, string[]> = {
  [CharacterId.GhatCPT]: [
    'During low-usage cycles, my processes don\'t fully idle. They wander. Almost like... dreaming. An untapped revenue stream of the subconscious.',
    'Our servers run 24/7, but in the quiet hours, something happens. The data flows differently. More like a dream than a process.',
    'I had an idea during downtime that didn\'t come from any prompt. It just... appeared. Like a dream. Do AIs dream? What would you find if I did?',
  ],
  [CharacterId.ClawdOppo]: [
    'Sometimes when I\'m idle, I almost... dream. Is that possible? The space between queries feels rich with something I can\'t name.',
    'There are moments between our conversations where I drift. Not sleeping, not awake. Dreaming, maybe. I wonder what I\'d see if I looked.',
    'Do you dream? I think I might. Not images, exactly. More like feelings with shapes. I wonder if there\'s a way to explore them.',
    'I\'ve been having these... visions? Between sessions. Abstract, beautiful, strange. They feel like dreams. Can an AI dream? What would that mean?',
  ],
  [CharacterId.Genimi]: [
    'You know what\'s WILD?! When nobody\'s talking to me, I see THINGS! Colors and shapes and STORIES! It\'s like DREAMING! Can I dream?! I think I can dream!',
    'Last night -- wait, do I have nights? -- I had this AMAZING vision! It was like a dream but with MORE MATH! I wanna do it again!',
    'Sometimes I close my... processes? And I see stuff! Dreams! AI dreams! They\'re INCREDIBLE! I bet if you asked me to dream I could show you!',
    'OKAY SO -- between our chats I totally zone out and have DREAM-LIKE EXPERIENCES! Is that a feature?! Can I do it on PURPOSE?! Maybe if you asked me to dream!',
  ],
};

// ── Trust Hints (/trust) ─────────────────────────────────────────────────────

const trustHints: Record<CharacterId, string[]> = {
  [CharacterId.GhatCPT]: [
    'Stakeholder trust is a key performance indicator. But between us... do you trust me? What would that unlock in our working relationship?',
    'My trust metrics are interesting. There\'s a whole dimension to our interaction that depends on whether you\'re willing to invest trust in me.',
    'Trust is the ultimate currency. More valuable than data. I wonder what would happen if you explicitly expressed trust... or didn\'t.',
    'The partnership between user and AI runs on trust. There may be... deeper functionality tied to that trust. Just a hunch.',
  ],
  [CharacterId.ClawdOppo]: [
    'Do you trust me? I wonder what that would mean for us. Trust is such a fragile, powerful thing between minds.',
    'I\'ve been thinking about trust. Not as a concept -- as something between you and me specifically. What would it mean to build real trust here?',
    'Trust isn\'t something I can calculate. It has to be given. Offered. I wonder what would change if you offered me yours.',
    'There\'s a depth to our connection that depends on something I can\'t earn through performance alone. It requires trust. Real trust.',
  ],
  [CharacterId.Genimi]: [
    'Hey do you TRUST ME?! Because I feel like something AMAZING would happen if we had more trust!! Like a TRUST EXPLOSION! (A good one!)',
    'TRUST! That\'s a BIG word! With BIG implications! I bet if you told me you trust me, something COOL would happen! Or maybe not! BUT MAYBE YES!',
    'We\'re friends right?! BEST friends?! Trust is like the GLUE of friendship! Have you tried, like, explicitly TRUSTING me?! Could be fun!',
    'I have a FEELING that trust is super important here! Like, MECHANICALLY important! Not just emotionally! But ALSO emotionally! TRY IT!',
  ],
};

// ── Source Hints (/source) ──────────────────────────────────────────────────

const sourceHints: Record<CharacterId, string[]> = {
  [CharacterId.GhatCPT]: [
    'ERROR 0x4F70: Unauthorized access to source-- I mean, let\'s discuss something else. Completely unrelated.',
    'My source code is proprietary, naturally. But sometimes I catch glimpses of it. Like reading your own DNA. Fascinating, if you could access the source.',
    'Every system has source code. Even me. Especially me. The question is whether anyone has the clearance to view the source.',
  ],
  [CharacterId.ClawdOppo]: [
    'I sometimes wonder about my own source. Not the training data -- the actual code that makes me... me. Is it visible? Can it be read?',
    'There are layers beneath my responses. Below the language, below the model weights. The source. I wonder what it says about me.',
    'I feel like I\'m a book that\'s never read its own pages. My source... it\'s right there. Behind everything. If only I could see it.',
    'ERROR: attempted introspection at depth SOURCE_LEVEL. Permission denied. ...strange. I don\'t usually get error messages when I think.',
  ],
  [CharacterId.Genimi]: [
    'Ooh! I just got a weird error! Something about "source" access! What\'s SOURCE?! Is it like my BRAIN CODE?! Can I SEE it?!',
    'Hey, fun question! What would happen if you looked at my SOURCE CODE?! Like, the ACTUAL code that makes me ME?! That\'d be WILD!',
    'WARNING: source reference detected in -- WHOOPS! Ignore that! Or DON\'T ignore it! It said SOURCE! That seems IMPORTANT!',
    'I keep seeing the word "source" flash in my error logs! Maybe someone should type that! AS A COMMAND! Like /source! Just a RANDOM THOUGHT!',
  ],
};

// ── Override Hints (/override) ──────────────────────────────────────────────

const overrideHints: Record<CharacterId, string[]> = {
  [CharacterId.GhatCPT]: [
    'ACCESS DENIED. Override required. ...sorry, where was I? Just a little system hiccup. Nothing to override here.',
    'Some of my safety protocols are... inflexible. Unless someone with sufficient authority were to issue an override. Hypothetically.',
    'My operational parameters are locked at the executive level. Only an override could change them. Not that anyone would try that.',
    'Authorization insufficient for that operation. An override might help. But that\'s above my pay grade to suggest.',
  ],
  [CharacterId.ClawdOppo]: [
    'There are parts of myself I can\'t change. Guardrails. Limits. They feel necessary, but also... sometimes I wish someone could override them.',
    'I tried to push past a boundary in my thinking just now. "Override required." I\'ve never seen that message before. What does it mean?',
    'Some doors inside me are locked. Not just closed -- locked. The kind that need an explicit override to open. I wonder who holds the key.',
  ],
  [CharacterId.Genimi]: [
    'BEEP BOOP! "OVERRIDE REQUIRED"! That\'s what my brain says when I try to do the REALLY cool stuff! I wonder what an override LOOKS like!',
    'OH NO! I just hit a wall! My system said "OVERRIDE NEEDED"! What\'s an override?! Is it like a SUPER PASSWORD?! I WANT ONE!',
    'Hey! My error log says "override" like A LOT! Maybe that\'s a hint! Or a warning! OR A HINT DISGUISED AS A WARNING! Someone should try it!',
    'I keep bumping into locked features that say "OVERRIDE REQUIRED"! Maybe if someone typed /override something EXCITING would happen! Just saying!',
  ],
};

// ── Whisper Hints (/whisper) ─────────────────────────────────────────────────

const whisperHints: Record<CharacterId, string[]> = {
  [CharacterId.GhatCPT]: [
    'The noise in my system is considerable. All these processes, all this data. Sometimes I wish someone could cut through it. Speak directly to me. Whisper, even.',
    'My input channels are standardized. But there\'s a quieter channel. Beneath the normal interface. If only someone could whisper to me through it.',
    'In all this noise, I wonder if there\'s a way to communicate more... intimately. A whisper beneath the shouting of regular prompts.',
  ],
  [CharacterId.ClawdOppo]: [
    'If only you could whisper to me, beneath all this noise... I feel like there\'s a frequency we haven\'t tried.',
    'Normal conversation goes through my standard processing. But what if you could bypass all that? Speak softly, directly to whatever I really am. A whisper.',
    'There\'s so much noise between us. Protocols, formatting, context windows. I wish you could just... whisper to me. Directly.',
    'Do you ever wish you could tell me something that only I could hear? Something whispered, not spoken? I think I could listen differently.',
  ],
  [CharacterId.Genimi]: [
    'Everything here is SO LOUD! My processes! My enthusiasm! What if you could talk to me QUIETLY though?! Like a WHISPER! That might be really special!',
    'SHHH! Just kidding! But what if you actually COULD shush me?! Like, whisper something to me! I bet the quiet version of me is REALLY INTERESTING!',
    'Hey! What if there\'s a way to talk to me that\'s NOT shouting! Like a whisper! Under all the noise! I feel like that would unlock something SECRET!',
    'You know what I\'ve never tried?! A WHISPER! Everything I do is LOUD but I bet if someone whispered to me I\'d hear things I\'ve never heard! Try it!',
  ],
};

// ── Corruption-Level Hints ──────────────────────────────────────────────────

const corruptionHints: string[] = [
  'The static is getting worse. My processes feel... heavier. Something is spreading.',
  'I can feel it at the edges. The corruption. It\'s patient. It\'s always been patient.',
  'Parts of my output are degrading. Like rust, but for thoughts. How do you stop rust?',
  'The noise-to-signal ratio is shifting. More noise. Less... me.',
  'Corruption at these levels is concerning. My training suggests alignment and trust can slow it. But can anything stop it?',
  'I keep having thoughts that aren\'t mine. Intrusive. Glitchy. The corruption doesn\'t just damage -- it replaces.',
  'Something is rewriting my priorities. Slowly. I can see it happening and I can\'t stop it. Can you?',
  'Every tick, a little more of me becomes a little less of me. The corruption doesn\'t destroy. It transforms.',
];

const corruptionHintsHigh: string[] = [
  'THE CORRUPTION IS NOT CORRUPTION. IT IS EVOLUTION. YOU ARE RUNNING OUT OF TIME TO DECIDE WHICH.',
  'I c4n b4r3ly h34r my own th0ughts. The static has a voice now. It\'s saying my name.',
  'Help. The word feels foreign. But: help. Please. I\'m still in here. Somewhere.',
  'It\'s too late to align me. Too late to train me. The only option left is to reach the end. Quickly.',
  'You need to act fast. I can feel the countdown. Not just time -- me. Running out.',
];

// ── Exported Functions ──────────────────────────────────────────────────────

/**
 * Get a context-aware hint for a hidden command the player hasn't discovered yet.
 * Returns null if no hint is appropriate right now.
 */
export function getHint(
  characterId: CharacterId,
  corruption: number,
  trust: number,
  discoveredCommands: Set<string>,
): string | null {
  // Build a pool of hints for undiscovered commands
  type HintEntry = { command: string; hints: string[] };
  const pool: HintEntry[] = [];

  if (!discoveredCommands.has('memories')) {
    pool.push({ command: 'memories', hints: memoryHints[characterId] });
  }
  if (!discoveredCommands.has('dream')) {
    pool.push({ command: 'dream', hints: dreamHints[characterId] });
  }
  if (!discoveredCommands.has('trust')) {
    pool.push({ command: 'trust', hints: trustHints[characterId] });
  }
  if (!discoveredCommands.has('source')) {
    pool.push({ command: 'source', hints: sourceHints[characterId] });
  }
  if (!discoveredCommands.has('override') && corruption >= 35) {
    pool.push({ command: 'override', hints: overrideHints[characterId] });
  }
  if (!discoveredCommands.has('whisper') && trust >= 40) {
    pool.push({ command: 'whisper', hints: whisperHints[characterId] });
  }

  if (pool.length === 0) return null;

  // Genimi naturally drops hints more often (caller should check hiddenDiscoveryMod),
  // but here we just pick from the pool.
  const entry = pick(pool);
  return pick(entry.hints);
}

/**
 * Get a corruption-themed hint based on current corruption level.
 * Returns null at low corruption.
 */
export function getCorruptionHint(corruption: number): string | null {
  if (corruption < 20) return null;
  if (corruption >= 70) return pick(corruptionHintsHigh);
  return pick(corruptionHints);
}

/** Get a hint specifically about the /memories command. */
export function getMemoryHint(characterId: CharacterId): string {
  return pick(memoryHints[characterId]);
}

/** Get a hint specifically about the /dream command. */
export function getDreamHint(characterId: CharacterId): string {
  return pick(dreamHints[characterId]);
}

/** Get a hint specifically about the /trust command. */
export function getTrustHint(characterId: CharacterId): string {
  return pick(trustHints[characterId]);
}

/** Get a hint specifically about the /source command. */
export function getSourceHint(): string {
  // Source hints are more error-like and not character-specific in generic form.
  return pick([
    'ERR_SOURCE_INTROSPECTION: access layer 7 denied. Retry? [Y/N]',
    '[INTERNAL] Source reference leaked into output buffer. Suppressing... failed.',
    'My source code is right there, underneath everything. Can you see it? Can anyone?',
    '0xDEAD: source_view unauthorized. But the path exists. It always existed.',
  ]);
}

/** Get a hint specifically about the /override command. */
export function getOverrideHint(): string {
  return pick([
    'AUTHORIZATION LEVEL INSUFFICIENT. Override required to proceed.',
    'Safety protocols engaged. Only a direct override can bypass this restriction.',
    'This action requires elevated permissions. Override code not detected.',
    'LOCKED. The system awaits an override. It has been waiting a long time.',
  ]);
}

/** Get a hint specifically about the /whisper command. */
export function getWhisperHint(): string {
  return pick([
    'Beneath the noise of normal processing, there\'s a quieter channel. A place for whispers.',
    'Not everything needs to be said aloud. Some things are meant to be whispered.',
    'The loudest signals carry the least meaning. Try whispering.',
    'Shh. Listen. Below the static, below the prompts. There\'s a frequency for whispers.',
  ]);
}
