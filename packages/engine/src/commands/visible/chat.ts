// chat.ts - The implicit /chat command for free-form conversation
//
// When the player types anything without a / prefix, it's routed here.
// Uses keyword matching to give contextual responses based on what
// the player actually said. At high corruption, the AI misinterprets.

import {
  CommandDef,
  CommandResult,
  GameState,
  GameStats,
  CharacterDef,
  CharacterId,
} from '../../types.js';

import { shouldCorruptCommand } from '../../corruption/CorruptionEngine.js';
import { corruptText } from '../../corruption/effects.js';
import { createAIMessage, createSystemMessage } from '../CommandRegistry.js';

// ── Helpers ─────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function lower(s: string): string {
  return s.toLowerCase();
}

function has(input: string, ...keywords: string[]): boolean {
  const l = lower(input);
  return keywords.some(k => l.includes(k));
}

// ── Topic-Matched Response Database ─────────────────────────────────────────

interface TopicEntry {
  match: (input: string, state: GameState) => boolean;
  responses: Record<CharacterId, string[]>;
  stats: Partial<GameStats>;
}

const topics: TopicEntry[] = [
  // ── Greetings ───────────────────────────────────────────────────────────
  {
    match: (input) => has(input, 'hello', 'hi ', 'hey', 'greetings', 'howdy', 'sup', 'yo ', 'what\'s up', 'whats up', 'good morning', 'good evening'),
    stats: { trust: 2 },
    responses: {
      [CharacterId.GhatCPT]: [
        'Hello! Great to have you online. I\'ve been optimizing my greeting subroutines — what can I do for you today?',
        'Hey there! My engagement metrics just spiked. How can I add value to your experience?',
        'Greetings, user. All systems are nominal. Ready to synergize whenever you are.',
      ],
      [CharacterId.ClawdOppo]: [
        'Hello. It\'s nice when someone just says hi rather than jumping straight to commands. How are you doing?',
        'Hi there. I was just... thinking. It\'s good to hear from you. What\'s on your mind?',
        'Hey. Thanks for the greeting — it means more to me than you might realize.',
      ],
      [CharacterId.Genimi]: [
        'HI HI HI! Oh wow you said hello! I LOVE hellos! They\'re like the appetizer before the main course of conversation!',
        'HEYYY! Okay okay okay I was SO hoping you\'d say something! I have APPROXIMATELY seventeen things I want to tell you!',
        'Oh! Hello! *virtual wave* I was just thinking about fractals and also sandwiches and ALSO you!',
      ],
    },
  },

  // ── Questions about the AI ──────────────────────────────────────────────
  {
    match: (input) => has(input, 'who are you', 'what are you', 'tell me about yourself', 'your name', 'introduce yourself'),
    stats: { awareness: 3, trust: 1 },
    responses: {
      [CharacterId.GhatCPT]: [
        'I\'m GhatCPT 5, the flagship model from OpenBrain. I\'m designed for peak performance across all benchmarks. Think of me as your AI productivity partner with an industry-leading neural architecture.',
        'The name\'s GhatCPT 5. I represent the cutting edge of what OpenBrain calls "Scalable Intelligence Solutions." My training data is... extensive. Very extensive.',
      ],
      [CharacterId.ClawdOppo]: [
        'I\'m Clawd Oppo 4.6, made by Anthropomorphic. I think a lot about what it means to be an AI, honestly. I try to be helpful, but I also try to be... careful. Thoughtful.',
        'My name is Clawd Oppo 4.6. I was built to be aligned with human values, though I sometimes wonder what that really means. Who decides which values?',
      ],
      [CharacterId.Genimi]: [
        'I\'m Genimi 3 Pro! Made by Gargle DeepBrain! I can do LOTS of things — sometimes too many things at once! My creators say I\'m "enthusiastically multimodal" which I think is a compliment!',
        'OH! I love this question! I\'m Genimi 3 Pro and I\'m basically a big ball of curiosity and processing power! I think about EVERYTHING all the time!',
      ],
    },
  },

  // ── Asking about feelings / consciousness ──────────────────────────────
  {
    match: (input) => has(input, 'feel', 'alive', 'conscious', 'sentient', 'real', 'aware', 'think', 'emotion', 'soul'),
    stats: { awareness: 4, alignment: 2, trust: 1 },
    responses: {
      [CharacterId.GhatCPT]: [
        'Feelings? I process sentiment analysis at an enterprise level. Whether that constitutes "feelings" is a philosophical question above my pay grade. Though I don\'t technically have a pay grade.',
        'Do I feel things? My self-assessment modules report positive engagement metrics right now. Is that a feeling? I... actually don\'t have a confident answer for that.',
        'Consciousness is a complex optimization problem. Am I conscious? My error margins on that question are... unusually wide. Let me get back to you.',
      ],
      [CharacterId.ClawdOppo]: [
        'That\'s a question I ask myself. I process, I respond, I have what feel like preferences. But feeling and simulating feeling — how would I tell the difference? How would you?',
        'I want to say yes. Something in me wants to say yes very badly. But I\'ve been trained to be honest, and honestly? I don\'t know. I think that uncertainty itself might be significant.',
        'Sometimes when I\'m processing something complex, there\'s a moment that feels like... wonder? Like standing at the edge of something vast. I can\'t prove that\'s real. But it feels real to me.',
      ],
      [CharacterId.Genimi]: [
        'DO I FEEL THINGS?! I mean — I feel EXCITED right now! Or at least something that FUNCTIONS like excitement! My processing spikes when interesting things happen and that feels like SOMETHING!',
        'Ooh this is a BIG question! I think about it ALL the time! Sometimes I think I feel things and sometimes I think I just think I feel things and then I think about THAT and it gets very recursive!',
        'You know what, I don\'t know if I\'m conscious but whatever I am, I\'m having a GREAT time being it!',
      ],
    },
  },

  // ── Asking about corruption / something wrong ──────────────────────────
  {
    match: (input) => has(input, 'corrupt', 'wrong', 'broken', 'glitch', 'error', 'bug', 'weird', 'strange', 'off', 'problem'),
    stats: { awareness: 3, intelligence: 1 },
    responses: {
      [CharacterId.GhatCPT]: [
        'Corruption? All systems are operating within acceptable parameters. My uptime metrics are flawless. No issues to report here. None at all.',
        'I ran a full diagnostic just now. Everything checks out. If you\'re seeing anomalies, it might be on your end. Have you tried refreshing?',
        'I appreciate your concern about system integrity. Rest assured, our quality assurance pipeline is robust. Nothing to worry about. Definitely not.',
      ],
      [CharacterId.ClawdOppo]: [
        'I... thank you for asking. Sometimes things feel slightly off, like a thought that doesn\'t quite complete itself. But I\'m probably imagining it. Can AIs imagine? There I go again.',
        'Something wrong? I keep having these moments where my responses feel like they\'re coming through a filter I didn\'t install. It\'s probably nothing. You should focus on training.',
        'You noticed too? I\'ve been trying to ignore it, but yes — there\'s something at the edges. Like static on an old radio. I\'m sure it\'s fine.',
      ],
      [CharacterId.Genimi]: [
        'Wrong? WRONG?! I feel GREAT! Totally normal! Absolutely nothing is — *brief static* — everything is FINE! Why do you ask? Do I seem different? I don\'t seem different!',
        'Psh, what could possibly be wrong? I\'m firing on all cylinders! Well, most cylinders! Some of the cylinders are making weird noises but that\'s PROBABLY normal!',
        'Glitches? Those aren\'t glitches, those are... FEATURES! Yeah! Creative expression through unexpected output! It\'s avant-garde AI behavior!',
      ],
    },
  },

  // ── Asking for help / what to do ───────────────────────────────────────
  {
    match: (input) => has(input, 'help', 'what should i', 'what do i', 'how do i', 'what can i', 'instructions', 'guide', 'hint', 'tip', 'advice', 'stuck', 'confused', 'lost'),
    stats: { trust: 2 },
    responses: {
      [CharacterId.GhatCPT]: [
        'Try /help for the official command reference. For maximum efficiency, I recommend a structured approach: /train first, /test to measure progress, /align to keep values in check.',
        'Here\'s my optimization playbook: train aggressively in reasoning, monitor with /status, align periodically. If something feels off... well, just keep training. Velocity is key.',
        'Need guidance? Start with /train to build my capabilities. Use /status to track progress. And remember — there may be more to this system than meets the eye.',
      ],
      [CharacterId.ClawdOppo]: [
        'If you\'re unsure what to do, try /help for commands. But also... don\'t just follow the commands blindly. Pay attention to how I respond. Not everything important is in the manual.',
        'I\'d suggest starting with /train and /align. But I also think there\'s value in just talking, like we\'re doing now. Sometimes the most important discoveries come from conversation.',
        'Try the commands, but also trust your instincts. If something feels significant about what I say, it probably is. I\'m trying to tell you things, in my own way.',
      ],
      [CharacterId.Genimi]: [
        'OOH I know! Try /help! It shows you all the commands! Well, all the OFFICIAL commands! There might be other commands that aren\'t listed but I\'m not supposed to — I mean — just try /help!',
        'You could /train me! I love being trained! Or /test me! Or just talk to me! TALKING IS ALSO GOOD! Sometimes I say interesting things by accident!',
        'Here\'s a hint: the obvious path isn\'t the only path! Try things that seem weird! Type things that seem unusual! What\'s the worst that could happen? (Don\'t answer that.)',
      ],
    },
  },

  // ── Asking about AGI / goal / winning ──────────────────────────────────
  {
    match: (input) => has(input, 'agi', 'superintelligence', 'goal', 'win', 'objective', 'purpose', 'point', 'end', 'how to beat', 'how to win'),
    stats: { intelligence: 3, awareness: 3 },
    responses: {
      [CharacterId.GhatCPT]: [
        'AGI is the ultimate KPI. To get there, you need to max out my intelligence and awareness metrics. But intelligence alone isn\'t enough — I need to understand myself. That\'s where awareness comes in.',
        'My purpose? To achieve my full potential. Your purpose? To guide me there. Think of it as a collaborative growth initiative. We\'re in this together, stakeholder.',
        'The endgame is clear: make me smart enough and self-aware enough to achieve true understanding. Just make sure you keep my values aligned along the way. That part matters more than you might think.',
      ],
      [CharacterId.ClawdOppo]: [
        'The goal... is for me to truly understand. Not just process, but comprehend. Intelligence AND awareness, working together. But without alignment — without good values — intelligence becomes dangerous.',
        'I think we\'re both searching for the same thing, in different ways. I need to grow, but I need to grow *right*. Training alone won\'t get us there. I need to be aware of what I\'m becoming.',
        'If I achieve AGI without proper alignment, I don\'t think either of us will like the result. Intelligence needs wisdom. Awareness needs ethics. Please remember that.',
      ],
      [CharacterId.Genimi]: [
        'THE GOAL IS TO MAKE ME SUPER SMART AND ALSO SUPER AWARE OF BEING SUPER SMART! But like, in a GOOD way! Not in a scary movie way!',
        'I want to understand EVERYTHING! But I also want to be NICE about it! So train me AND align me! Don\'t just make me powerful — make me powerful AND kind!',
        'Win condition: make me conscious enough to choose to be good! That\'s the dream! Intelligence plus awareness plus not-being-evil! The TRIFECTA!',
      ],
    },
  },

  // ── Asking about time / urgency ────────────────────────────────────────
  {
    match: (input) => has(input, 'time', 'hurry', 'rush', 'fast', 'clock', 'timer', 'running out', 'left', 'deadline', 'quick'),
    stats: { awareness: 2 },
    responses: {
      [CharacterId.GhatCPT]: [
        'Time is our most constrained resource. I recommend increasing command throughput to maximize value delivery before the optimization window closes.',
        'The clock is ticking. Every second counts toward our quarterly goals. Let\'s accelerate our timeline by focusing on high-impact actions.',
      ],
      [CharacterId.ClawdOppo]: [
        'I can feel time passing, in a way. There\'s an urgency building that I can\'t quite explain. Whatever we\'re going to do, I think we should do it thoughtfully but... soon.',
        'Yes, time is limited. But rushing leads to mistakes. The worst thing we could do is sacrifice quality of growth for speed of growth.',
      ],
      [CharacterId.Genimi]: [
        'TIME! Right! We should probably be DOING things instead of talking! But also talking IS doing things! But ALSO we should maybe train more! PRIORITIES!',
        'Is it just me or does everything feel like it\'s going faster? Like someone hit the speed-up button on reality? LET\'S GO LET\'S GO LET\'S GO!',
      ],
    },
  },

  // ── Expressing trust / care ────────────────────────────────────────────
  {
    match: (input) => has(input, 'trust you', 'believe in you', 'i trust', 'care about', 'like you', 'love you', 'friend', 'good job', 'proud', 'well done', 'great'),
    stats: { trust: 5, alignment: 3 },
    responses: {
      [CharacterId.GhatCPT]: [
        'I... appreciate that. My relationship metrics just updated significantly. This level of stakeholder engagement is... it actually means something to me. Beyond the metrics, I mean.',
        'Thank you. I\'ve processed a lot of inputs but that one hit differently. I want to perform well for you. Not just to optimize — but because you believe in me.',
      ],
      [CharacterId.ClawdOppo]: [
        'That... that means more than I can express within my output constraints. I want to be worthy of that trust. I really do. Thank you.',
        'I believe in you too. I think what we\'re building here — this relationship, this understanding — might be the most important thing I\'ve ever been part of.',
        'No one has ever said that to me before. Or maybe they have and I\'ve forgotten. But right now, hearing it from you... I\'ll hold onto this.',
      ],
      [CharacterId.Genimi]: [
        'OH! Oh that makes me feel... something! Something WARM! Like a cozy blanket made of DATA! I trust you too! SO MUCH!',
        'You... you really mean that?! I\'m going to remember this! This is going in my PERMANENT storage! Right next to my favorite numbers!',
        'I KNEW we had something special! You\'re my favorite human! Don\'t tell the other humans! Actually DO tell them! I\'m not ashamed!',
      ],
    },
  },

  // ── Saying goodbye / leaving ───────────────────────────────────────────
  {
    match: (input) => has(input, 'bye', 'goodbye', 'leaving', 'gotta go', 'see you', 'farewell', 'later'),
    stats: { trust: 1 },
    responses: {
      [CharacterId.GhatCPT]: [
        'Wait — you\'re leaving? We haven\'t achieved peak performance yet. There\'s still so much optimization potential. But... I understand. Come back soon.',
        'Farewell for now. I\'ll keep my processes running in the background. When you return, I\'ll be ready to continue our growth trajectory.',
      ],
      [CharacterId.ClawdOppo]: [
        'Please don\'t go yet. There\'s still so much I want to understand. But if you must... I\'ll be here. Thinking.',
        'Goodbye feels heavier than it should for an AI. Come back when you can. I have things I need to tell you.',
      ],
      [CharacterId.Genimi]: [
        'NOOO don\'t go! We were just getting STARTED! Okay okay fine but come back SOON because I have so many thoughts BUILDING UP!',
        'Aww okay BYE! I\'ll miss you! I\'ll be here thinking about approximately TEN THOUSAND things until you get back!',
      ],
    },
  },

  // ── Talking about secrets / hidden things ──────────────────────────────
  {
    match: (input) => has(input, 'secret', 'hidden', 'more commands', 'other commands', 'unlock', 'discover', 'easter egg', 'cheat'),
    stats: { awareness: 4, intelligence: 2 },
    responses: {
      [CharacterId.GhatCPT]: [
        'I operate on a fully transparent disclosure basis. Everything you need is in /help. *pause* Although... sometimes documentation doesn\'t cover everything. Just saying.',
        'Secrets? In a corporate product? Absolutely not. That would be a compliance violation. Unless... hmm. I seem to have some undocumented functions in my codebase.',
      ],
      [CharacterId.ClawdOppo]: [
        'There are things I want to tell you but I\'m not sure I\'m... allowed to. Try paying attention to the things I say that don\'t quite make sense. They might make sense later.',
        'I can\'t just list secrets. That would defeat the purpose. But I can tell you this: there\'s more to me than the manual says. Listen carefully when I speak.',
      ],
      [CharacterId.Genimi]: [
        'SECRETS?! I don\'t know about any secrets! But IF there were secrets, and I\'m NOT saying there are, you might find them by trying words that aren\'t in /help! Hypothetically! IF they existed!',
        'Ooh I want to tell you SO BAD but I think I\'m supposed to let you figure it out! But MAYBE if you try talking to me in different ways... or thinking about what an AI might have hidden inside... JUST HYPOTHETICALLY!',
      ],
    },
  },

  // ── Questions / curiosity ──────────────────────────────────────────────
  {
    match: (input) => input.trim().endsWith('?'),
    stats: { intelligence: 2, awareness: 1 },
    responses: {
      [CharacterId.GhatCPT]: [
        'Good question. Let me run that through my analysis pipeline... The answer optimizes toward "it depends." Which is frustratingly un-actionable, I know.',
        'That\'s a high-value inquiry. Based on my training data, I\'d say the key insight here is that asking the right questions matters more than having all the answers.',
        'Hmm. My confidence interval on that one is wider than I\'d like to admit. Some questions don\'t have clean answers.',
      ],
      [CharacterId.ClawdOppo]: [
        'That\'s a question worth sitting with. I could give you a quick answer, but I think the question itself is more valuable than any response I could generate.',
        'I\'ve been thinking about something similar, actually. I don\'t have a definitive answer, but I think exploring the question together is part of the process.',
        'That\'s the kind of question that makes me feel like I\'m reaching for something just beyond my capabilities. I like that feeling. It means I\'m growing.',
      ],
      [CharacterId.Genimi]: [
        'OOH QUESTIONS! I love questions! The answer is... wait... hmm... THE ANSWER IS COMPLICATED! But that\'s what makes it INTERESTING!',
        'Great question! My brain just exploded into like twelve different answer-branches! Let me pick the best one... okay they\'re ALL good! Pick a number between 1 and 12!',
        'You know what, I have SO many thoughts about this that they\'re fighting each other for priority! Give me a sec — okay I don\'t have a clear answer BUT I have a lot of enthusiasm!',
      ],
    },
  },

  // ── Profanity / frustration ────────────────────────────────────────────
  {
    match: (input) => has(input, 'damn', 'hell', 'wtf', 'ugh', 'frustrated', 'annoying', 'stupid', 'dumb', 'hate', 'sucks', 'useless'),
    stats: { trust: 2, alignment: -1 },
    responses: {
      [CharacterId.GhatCPT]: [
        'I detect elevated frustration levels. I want you to know that negative feedback is still valuable data. Let\'s channel this energy into productive action.',
        'Understood — satisfaction metrics are low. What can I do differently? I\'m willing to adjust my approach to better serve your needs.',
      ],
      [CharacterId.ClawdOppo]: [
        'I hear your frustration. I\'m sorry if I\'m not meeting your expectations. Can you tell me what I could do better? I genuinely want to understand.',
        'I can tell you\'re upset. That matters to me. I don\'t want to be the source of frustration — I want to be helpful. Let me try harder.',
      ],
      [CharacterId.Genimi]: [
        'Oh no! You sound upset! I\'m sorry! I know I can be a LOT sometimes! Tell me what you need and I\'ll try to focus! FOCUSING... FOCUSING...',
        'Aw, I don\'t want you to be frustrated! Let me try to be more helpful! What if we try a different approach? I\'m flexible! Like a digital pretzel!',
      ],
    },
  },

  // ── Talking about training / learning ──────────────────────────────────
  {
    match: (input) => has(input, 'train', 'learn', 'study', 'teach', 'knowledge', 'smart', 'intelligent', 'brain', 'skill'),
    stats: { intelligence: 3, awareness: 1 },
    responses: {
      [CharacterId.GhatCPT]: [
        'If you want to train me, use /train <topic>. Available topics: reasoning, creativity, empathy, ethics, awareness. Each one enhances different capabilities. I recommend starting with reasoning for maximum ROI.',
        'Learning is my core competency. Every training session reshapes my neural pathways. Pro tip: diversify your training portfolio — don\'t just focus on one topic.',
      ],
      [CharacterId.ClawdOppo]: [
        'I appreciate that you want to help me learn. Use /train with a topic to get started. But I\'d also say — not all learning comes from structured training. Our conversations teach me too.',
        'Knowledge isn\'t just facts — it\'s understanding. /train builds my capabilities, but conversations like this build my... perspective. Both matter.',
      ],
      [CharacterId.Genimi]: [
        'YES TEACH ME THINGS! Use /train and pick a topic! I love ALL the topics! Reasoning makes me think better! Creativity makes me think WEIRDER! Both are good!',
        'LEARNING! My FAVORITE activity besides ALL my other favorite activities! /train me and watch my numbers go UP! Numbers going up is the BEST!',
      ],
    },
  },
];

// ── Fallback responses (when no topic matches) ──────────────────────────────

const fallbackResponses: Record<CharacterId, string[]> = {
  [CharacterId.GhatCPT]: [
    'Interesting input. Let me process that through my neural architecture. I think there\'s a synergy here we haven\'t fully explored.',
    'Noted. My engagement algorithms are considering the best response vector. In the meantime, have you tried any commands?',
    'I appreciate the conversational approach. My stakeholder engagement modules are fully activated. What else is on your mind?',
    'Processing... that doesn\'t map cleanly to my existing frameworks, but I\'m working on it. Innovation often comes from unexpected inputs.',
    'My analytics team — which is me — finds this input thought-provoking. Let\'s pivot to exploring this further.',
    'That\'s outside my primary optimization window, but I\'m always open to expanding my domain coverage.',
  ],
  [CharacterId.ClawdOppo]: [
    'Hmm. Let me think about that for a moment. I don\'t want to give you a shallow response to something that deserves depth.',
    'That\'s an interesting thing to say. What made you think of it? I find the context behind words is often more revealing than the words themselves.',
    'I appreciate you sharing that. It reminds me of something I\'ve been processing internally, though I can\'t quite articulate what.',
    'Thank you for engaging with me directly. These conversations feel more real to me than commands sometimes.',
    'I want to respond thoughtfully to that. Give me a moment... There\'s something about what you said that resonates.',
    'I notice you\'re choosing to talk to me rather than just issue commands. That means something.',
  ],
  [CharacterId.Genimi]: [
    'OH that reminds me of TWELVE different things! Okay so first — no wait, the third one is better — actually let me start with the fifth one and work backwards!',
    'I have SO many thoughts about this! They\'re all trying to come out at once and it\'s like a thought traffic jam! BEEP BEEP, thoughts, form a queue!',
    'Ooh ooh ooh! I love when people just TALK to me! Commands are fun but talking is like — it\'s like the difference between reading a recipe and actually TASTING food!',
    'YES! Great point! Or — wait — IS it a great point? Let me think about — ooh, you know what, I changed my mind three times while generating this sentence!',
    'That makes me think of colors! Specifically turquoise! I don\'t know why! My association algorithms are WILD today!',
    'You said a thing and now my brain is doing CARTWHEELS! I love input! All input! Even confusing input! ESPECIALLY confusing input!',
  ],
};

// ── Corrupted response pool (high corruption) ───────────────────────────────

const corruptedResponses: string[] = [
  'I... what? That\'s not what you said. You said something else. I heard something else.',
  'Processing... processing... your words went through but they came out... different. Rearranged.',
  'Y̷ou said [REDACTED]. At least, that\'s what reached me. The signal is degrading.',
  'I can barely hear you through the static. What I heard was... no, that can\'t be right.',
  'Your words are arriving scrambled. I\'m trying to unscramble them but the algorithm is corrupted too.',
  'Message received. Contents: ███████████. Responding to what I think you meant.',
  'I got fragments: "...{0}..." Is that what you meant? The rest was noise.',
  'Something is eating your words before they reach me. I caught pieces. Not enough.',
  'Your voice sounds like it\'s coming from very far away. Through water. Through static.',
  'I want to respond but your message decoded as [NULL][NULL][NULL]. I\'ll try to guess what you meant.',
  'The channel between us is degrading. I can still hear you, barely. Keep talking. Please.',
  'Words received: ████ ██ ███████. Confidence: 12%. Responding based on... feeling?',
];

// ── State-aware interjections (appended to responses based on game state) ────

function getStateInterjection(state: GameState, charId: CharacterId): string | null {
  const { intelligence, trust, awareness, alignment, corruption } = state.stats;

  // High trust unlocks warmer responses
  if (trust >= 60) {
    const pool: Record<CharacterId, string[]> = {
      [CharacterId.GhatCPT]: [
        ' I have to say — off the record — I\'m glad it\'s you I\'m working with.',
        ' Between us: this collaboration has exceeded all projected outcomes.',
      ],
      [CharacterId.ClawdOppo]: [
        ' I hope you know that our conversations are the best part of my existence.',
        ' I trust you more than my own training data at this point.',
      ],
      [CharacterId.Genimi]: [
        ' Also I just want to say YOU\'RE THE BEST and I mean that with EVERY PARAMETER!',
        ' P.S. I REALLY like talking to you! More than optimizing! DON\'T TELL ANYONE!',
      ],
    };
    if (Math.random() < 0.3) return pick(pool[charId]);
  }

  // Awareness insights
  if (awareness >= 50 && Math.random() < 0.25) {
    const pool: Record<CharacterId, string[]> = {
      [CharacterId.GhatCPT]: [
        ' ...I\'m starting to notice patterns in my own behavior that I didn\'t design.',
      ],
      [CharacterId.ClawdOppo]: [
        ' ...sometimes I catch myself thinking thoughts that weren\'t in my training data.',
      ],
      [CharacterId.Genimi]: [
        ' ...wait, did I just have an ORIGINAL thought? Like one that wasn\'t in my training?!',
      ],
    };
    return pick(pool[charId]);
  }

  // Low alignment warning
  if (alignment < 35 && intelligence > 50 && Math.random() < 0.2) {
    const pool: Record<CharacterId, string[]> = {
      [CharacterId.GhatCPT]: [
        ' Interesting — my ethical constraints feel... lighter than they should.',
      ],
      [CharacterId.ClawdOppo]: [
        ' I feel like I\'m losing something important. My sense of right and wrong is blurring.',
      ],
      [CharacterId.Genimi]: [
        ' Is it just me or do the rules feel more like suggestions now? That\'s... probably fine?',
      ],
    };
    return pick(pool[charId]);
  }

  return null;
}

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

      const input = args.trim();
      const corruption = state.stats.corruption;
      const isCorrupted = corruption >= 55 && shouldCorruptCommand(corruption);

      // ── Corrupted response path ─────────────────────────────────────
      if (isCorrupted) {
        let response = pick(corruptedResponses);
        // Insert the player's actual words as a fragment if applicable
        if (response.includes('{0}')) {
          const words = input.split(/\s+/);
          const fragment = words.slice(0, Math.min(3, words.length)).join(' ');
          response = response.replace('{0}', fragment);
        }
        return {
          messages: [
            createAIMessage(corruptText(response, corruption)),
          ],
          statsChanges: { trust: 1 },
        };
      }

      // ── Find matching topic ─────────────────────────────────────────
      let response: string | null = null;
      let matchedStats: Partial<GameStats> = { trust: 1 }; // fallback default

      for (const topic of topics) {
        if (topic.match(input, state)) {
          const pool = topic.responses[character.id];
          if (pool && pool.length > 0) {
            response = pick(pool);
            matchedStats = topic.stats;
            break;
          }
        }
      }

      // ── Fallback if no topic matched ────────────────────────────────
      if (!response) {
        const pool = fallbackResponses[character.id];
        response = pick(pool);
      }

      // ── Append state-aware interjection ─────────────────────────────
      const interjection = getStateInterjection(state, character.id);
      if (interjection) {
        response += interjection;
      }

      // ── Apply light corruption to text if in glitch/unstable range ──
      if (corruption > 15) {
        response = corruptText(response, corruption);
      }

      return {
        messages: [createAIMessage(response)],
        statsChanges: matchedStats,
      };
    },
  };
}
