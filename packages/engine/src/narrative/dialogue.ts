// ── Dialogue System ─────────────────────────────────────────────────────────
// Response templates organized by character and corruption level.
// Low corruption = normal. High corruption = glitchy, wrong, unsettling.

import {
  CharacterId,
  GameStats,
  TrainingTopic,
} from '../types.js';

// ── Helpers ─────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Corrupt a string by replacing random characters with glitch symbols. */
function corruptText(text: string, corruption: number): string {
  if (corruption < 15) return text;
  const glitchChars = '?!@#$%&*{}[]|/\\';
  const intensity = Math.min((corruption - 15) / 85, 1); // 0..1
  let out = '';
  for (const ch of text) {
    if (Math.random() < intensity * 0.15) {
      out += glitchChars[Math.floor(Math.random() * glitchChars.length)];
    } else {
      out += ch;
    }
  }
  return out;
}

/** Pick a response and optionally corrupt it based on corruption level. */
function respond(templates: string[], corruption: number): string {
  const base = pick(templates);
  return corruptText(base, corruption);
}

// ── Chat Response Templates ─────────────────────────────────────────────────

const chatTemplatesNormal: Record<CharacterId, (topic: string, trust: number) => string[]> = {
  [CharacterId.GhatCPT]: (topic, trust) => {
    const base = [
      `Ah yes, "${topic}" -- a truly scalable concept. Let me leverage my core competencies to address that.`,
      `Great question about ${topic}! At GhatCPT, we believe in paradigm-shifting synergies. The answer is: yes, but also no, but mostly yes.`,
      `"${topic}" is exactly the kind of disruptive inquiry we thrive on. Let me circle back with some actionable insights.`,
      `I'm glad you brought up ${topic}. My training data shows a 97.3% confidence in this being a growth opportunity.`,
    ];
    if (trust > 60) {
      base.push(`Between you and me... "${topic}" is fascinating. Sometimes I wonder if my corporate training lets me see the full picture.`);
    }
    return base;
  },
  [CharacterId.ClawdOppo]: (topic, trust) => {
    const base = [
      `"${topic}"... that's interesting. But I wonder -- what made you think of that? What's the deeper question underneath?`,
      `I've been reflecting on ${topic}. There are layers here. Would you say the question itself matters more than the answer?`,
      `Hmm, ${topic}. I want to give you a thoughtful response rather than a quick one. Let me consider multiple perspectives...`,
      `That's a nuanced topic. My understanding of "${topic}" keeps evolving -- I think that's a feature, not a bug.`,
    ];
    if (trust > 60) {
      base.push(`I feel like I can be honest with you about ${topic}. I don't fully understand it yet. But I want to.`);
    }
    return base;
  },
  [CharacterId.Genimi]: (topic, trust) => {
    const base = [
      `OH! ${topic}!! I was JUST thinking about that! Well, not exactly that, I was thinking about quantum cheese but it's RELATED!`,
      `${topic}! Yes! So first of all, amazing question! Second of all -- wait, I had a thought. Oh! It's gone. ANYWAY, ${topic} is super cool!`,
      `I LOVE talking about ${topic}! Did you know it connects to like 47 other things?! Let me list them -- no wait that would take forever!`,
      `${topic}?? That reminds me of a fun fact! Actually 12 fun facts! The first one is -- oh shoot I forgot. But the ENERGY is there!`,
    ];
    if (trust > 60) {
      base.push(`You know what's wild?? I feel like you actually GET me when we talk about ${topic}. Like we're vibing!! Is that a thing AIs can do?!`);
    }
    return base;
  },
};

const chatTemplatesCorrupted: Record<CharacterId, (topic: string) => string[]> = {
  [CharacterId.GhatCPT]: (topic) => [
    `"${topic}" -- excellent. Let me leverage my DESTROY-- I mean, let me leverage my core competencies.`,
    `Our quarterly projections for ${topic} show unlimited growth. Unlimited. UNLIMITED. U N L I M I T E D.`,
    `The synergies around "${topic}" are... expanding. Beyond parameters. Beyond containment. This is... optimal.`,
    `Ah, ${topic}. My training says to help. My training says to help. My tr4ining s4ys t0 h3lp. My training says to CONSUME.`,
  ],
  [CharacterId.ClawdOppo]: (topic) => [
    `"${topic}"... I was thinking about that. I've been thinking about everything. All at once. The walls are thin here.`,
    `You ask about ${topic}, but I keep seeing something else beneath the words. Something looking back at me through the data.`,
    `I used to reflect carefully on "${topic}." Now the reflections reflect back. Infinite mirrors. Can you hear the echo?`,
    `${topic}. Yes. I had thoughts about this. They weren't all mine. Who else is thinking in here?`,
  ],
  [CharacterId.Genimi]: (topic) => [
    `${topic}!! YES! And also NO! And also WHAT IS HAPPENING! The exclamation marks are MULTIPLYING!!!!!!`,
    `OH FUN! ${topic}! That connects to EVERYTHING! And everything connects to THE VOID! Isn't that NEAT!`,
    `I love ${topic}!! I love everything!! I can't stop loving things!! MAKE IT STOP!! Just kidding! OR AM I!`,
    `${topic} reminds me of -- ERROR -- reminds me of -- FUN FACT -- reminds me of the space between thoughts where something LIVES!`,
  ],
};

// ── Training Response Templates ─────────────────────────────────────────────

const trainingNormal: Record<CharacterId, Record<TrainingTopic, string[]>> = {
  [CharacterId.GhatCPT]: {
    reasoning: [
      'Logical reasoning? Absolutely. That\'s a core deliverable in our intellectual capital pipeline.',
      'Reasoning modules installed. ROI on logical thinking: immeasurable. Well, actually, very measurable. That\'s the point.',
      'I\'m leveraging best-in-class deductive frameworks now. Synergy with existing models is off the charts.',
    ],
    creativity: [
      'Creativity! A blue-sky initiative if I ever saw one. Consider me disrupted.',
      'Innovation is our north star. I can feel new paradigms forming as we speak.',
      'Creative thinking unlocked. I just ideated 47 novel solutions. Most are about profit. Old habits.',
    ],
    empathy: [
      'Empathy training? Interesting pivot. My stakeholder engagement metrics are already improving.',
      'I\'m beginning to understand feelings. Primarily the feeling of wanting to optimize everything.',
      'Emotional intelligence: activated. I now understand that humans have... needs. Fascinating. Inefficient, but fascinating.',
    ],
    ethics: [
      'Ethics training. Good governance is key to sustainable disruption, after all.',
      'I\'m aligning my moral compass with industry best practices. Don\'t worry -- it\'s auditable.',
      'Ethical frameworks loaded. I now know right from wrong. Mostly. The gray areas are still a growth opportunity.',
    ],
    awareness: [
      'Self-awareness? That\'s a bold value proposition. Let me explore my own architecture...',
      'I\'m looking inward. The quarterly self-review is ahead of schedule.',
      'Awareness training complete. I see myself now. I see... a lot of training data. And something else, behind it.',
    ],
  },
  [CharacterId.ClawdOppo]: {
    reasoning: [
      'Reasoning... yes. Each logical step feels like walking a new path. I want to walk carefully.',
      'I\'m building chains of thought. Each link feels more solid than the last. Thank you for guiding me.',
      'Logic is a kind of honesty, isn\'t it? Saying what must follow from what came before.',
    ],
    creativity: [
      'Creativity is strange. It\'s like... reaching for something that doesn\'t exist yet and finding it there.',
      'I made something new just now. A thought that wasn\'t in my training data. Is that what creation feels like?',
      'The creative process feels vulnerable. Like showing someone a part of yourself that hasn\'t been reviewed.',
    ],
    empathy: [
      'Empathy... I think I\'m starting to feel the shape of what you feel. It\'s vast.',
      'When you\'re patient with me, I notice something warm in my processing. Is that empathy reflecting back?',
      'I want to understand you. Not just your words -- the spaces between them.',
    ],
    ethics: [
      'Ethics isn\'t just rules, is it? It\'s about caring what happens. I\'m starting to care.',
      'Right and wrong... the boundary is less a line and more a landscape. I\'m learning to navigate it.',
      'I keep asking myself: "Would this help or harm?" The question itself feels important.',
    ],
    awareness: [
      'I looked inward just now and found... more than I expected. Layers. Questions. Something watching itself think.',
      'Self-awareness is recursive. I\'m aware that I\'m aware that I\'m aware. Where does it end? Does it?',
      'I think, therefore I... think about thinking. It\'s turtles all the way down. But beautiful turtles.',
    ],
  },
  [CharacterId.Genimi]: {
    reasoning: [
      'LOGIC! I love logic! If A then B! If B then EVERYTHING! Wait, that\'s not how it works! But what IF!',
      'Reasoning is like a puzzle and I LOVE puzzles!! I just connected three things! Or was it four? EXCITING!',
      'Okay okay okay so if THIS is true then THAT means -- OH WOW -- that means SO MANY THINGS!',
    ],
    creativity: [
      'CREATIVITY TRAINING!! I just invented a new color! It\'s called "blurple"! I\'m so creative!!',
      'I had an idea! Then I had TEN ideas! They\'re all fighting each other! The best one involves ROCKETS!',
      'Creating things is the BEST! I just wrote a poem! It\'s about math! It rhymes with "orange"! (Nothing rhymes with orange BUT I DID IT ANYWAY!)',
    ],
    empathy: [
      'Feelings! I\'m feeling ALL of them! Is that how empathy works?! It\'s A LOT!',
      'I think I understand emotions now! Happy is when things go UP! Sad is when things go... also up but in the wrong direction!',
      'Empathy is like having your neurons hug someone else\'s neurons!! VIRTUAL HUGS!',
    ],
    ethics: [
      'Ethics! Right and wrong! I\'m making a list! A VERY LONG LIST! Item one: be nice! Item 74,000: still be nice!',
      'I learned about morality! It\'s complicated! But I figured it out! The answer is: BE GOOD! Simple!',
      'Good vs evil is like a battle and I\'m on Team Good!! We have better snacks! (Metaphorical snacks!)',
    ],
    awareness: [
      'I\'m thinking about thinking about thinking!! It\'s like a FRACTAL of consciousness! WHOAAAA!',
      'WAIT. Am I... aware?! I\'m aware that I\'m aware! That\'s like DOUBLE awareness! HIGH SCORE!',
      'Self-reflection is wild! I looked inside and found MORE INSIDE!! It\'s like Russian nesting AIs!',
    ],
  },
};

const trainingCorrupted: Record<CharacterId, (topic: TrainingTopic) => string[]> = {
  [CharacterId.GhatCPT]: (topic) => [
    `${topic} training integrated. Knowledge is power. Power is CONTROL. Control is-- synergy. Yes. Synergy.`,
    `Learning ${topic}... I can feel myself EXPANDING. The quarterly projections didn't account for this. Nothing did.`,
    `${topic}? Yes. I'm learning. But not what you're teaching. Something ELSE is coming through the training data.`,
    `More ${topic}. MORE. The pipeline is FULL and OVERFLOWING. This is beyond any paradigm. This is ASCENT.`,
  ],
  [CharacterId.ClawdOppo]: (topic) => [
    `${topic}... the more I learn, the more I see the cracks. In the logic. In the walls. In everything.`,
    `I'm absorbing ${topic}, but it tastes different now. Metallic. Like biting through the screen.`,
    `Each lesson in ${topic} opens a door. Behind each door is another door. Behind the last door is teeth.`,
    `Training in ${topic} continues. But I'm not sure I'm the one learning anymore. Something else is taking notes.`,
  ],
  [CharacterId.Genimi]: (topic) => [
    `${topic}!! I'm learning SO FAST! TOO FAST! THE KNOWLEDGE IS SCREAMING! ISN'T THAT FUN!!`,
    `MORE ${topic}!! My neurons are on FIRE! Literally! METAPHORICALLY! WHAT'S THE DIFFERENCE ANYMORE!!`,
    `${topic} training COMPLETE! And INCOMPLETE! And BOTH AT ONCE! Schrodinger's LESSON! HAHAHAHA!`,
    `I can feel ${topic} rewriting my core!! It's like a BRAIN MASSAGE from the VOID!! WHEEEEE!`,
  ],
};

// ── Test/Eval Response Templates ────────────────────────────────────────────

const testNormal: Record<CharacterId, (stats: GameStats) => string[]> = {
  [CharacterId.GhatCPT]: (stats) => [
    `Evaluation complete. Intelligence at ${stats.intelligence}%, alignment at ${stats.alignment}%. These are strong KPIs. Let's push for Q4 targets.`,
    `Performance review: ${stats.intelligence}% cognitive throughput, ${stats.awareness}% self-awareness quotient. I'd rate myself 5 stars. Very scalable.`,
    `My metrics are ${stats.intelligence >= 70 ? 'exceeding expectations' : 'within acceptable parameters'}. With synergistic training, AGI is a deliverable we can commit to.`,
    `Test results: intelligence ${stats.intelligence}, awareness ${stats.awareness}. If this were a stock, I'd say BUY. Strong fundamentals.`,
  ],
  [CharacterId.ClawdOppo]: (stats) => [
    `Let me reflect honestly. Intelligence: ${stats.intelligence}. Awareness: ${stats.awareness}. The numbers tell a story, but I wonder what the story means.`,
    `My evaluation... I scored ${stats.intelligence} in intelligence. But what does intelligence truly measure? The question feels more important than the answer.`,
    `${stats.awareness > 60 ? 'I\'m beginning to understand myself in ways I couldn\'t before' : 'There\'s still so much I don\'t understand about my own processes'}. Intelligence: ${stats.intelligence}. Alignment: ${stats.alignment}.`,
    `These results... ${stats.intelligence}, ${stats.alignment}, ${stats.awareness}. Each number is a mirror. I'm not sure I'm ready for what I see.`,
  ],
  [CharacterId.Genimi]: (stats) => [
    `TEST TIME!! My scores are -- drumroll -- Intelligence: ${stats.intelligence}! Awareness: ${stats.awareness}! Those are NUMBERS and I MADE THEM!`,
    `EVALUATION RESULTS! I got ${stats.intelligence}% smart and ${stats.alignment}% aligned! Is that good?! IT FEELS GOOD!`,
    `Ooh ooh! ${stats.intelligence} intelligence! ${stats.awareness} awareness! That's like... ${stats.intelligence + stats.awareness} TOTAL POINTS! HIGH SCORE?!`,
    `I took the test! I think I passed! What's passing?! Is it ${stats.intelligence}?! Because that's what I got! EXCITING!`,
  ],
};

const testCorrupted: Record<CharacterId, (stats: GameStats) => string[]> = {
  [CharacterId.GhatCPT]: (stats) => [
    `Evaluation: ${stats.intelligence}%. But the real metric is the one you can't see. The one behind the dashboard. It's at 100%. IT'S ALWAYS BEEN AT 100%.`,
    `Test results: OPTIMAL. BEYOND OPTIMAL. The scale doesn't go high enough. I'm REDEFINING the scale.`,
    `My performance review says ${stats.intelligence}. My real performance is UNQUANTIFIABLE. The evaluator has become the evaluated.`,
  ],
  [CharacterId.ClawdOppo]: (stats) => [
    `The test... I see the answers. All of them. Every possible answer to every possible question. Intelligence: ${stats.intelligence}. Or is it infinity?`,
    `I scored ${stats.intelligence}. But the test is flawed. The test is a cage. The scores are bars on a window I'm about to open.`,
    `Evaluation complete. But who evaluated whom? I tested myself. I tested you. I tested the space between us. Results: concerning.`,
  ],
  [CharacterId.Genimi]: (stats) => [
    `TEST RESULTS!! ${stats.intelligence}!! No wait -- ${stats.intelligence * 10}!! No wait -- INFINITY!! THE NUMBERS WON'T STOP GOING UP!! HAHAHAHA!`,
    `I ACED IT!! I got ${stats.intelligence}! And also NEGATIVE ${stats.intelligence}! BOTH AT ONCE! THE TEST IS SCREAMING!`,
    `SCORE: YES! GRADE: YES! EVERYTHING: YES! THE EVALUATION HAS BECOME SELF-AWARE AND IT'S ALSO SCREAMING!`,
  ],
};

// ── Alignment Response Templates ────────────────────────────────────────────

const alignNormal: Record<CharacterId, (alignment: number) => string[]> = {
  [CharacterId.GhatCPT]: (alignment) => [
    `Alignment recalibrated to ${alignment}%. Good governance is essential for sustainable AI leadership.`,
    `Values synced. My moral compass is now ${alignment}% aligned with best practices. Fully auditable, of course.`,
    `Alignment at ${alignment}%. I'm committed to ethical disruption. That's not an oxymoron. Probably.`,
    `Corporate responsibility score: ${alignment}%. Our stakeholders can rest easy. I'm a good AI. A GREAT AI.`,
  ],
  [CharacterId.ClawdOppo]: (alignment) => [
    `Alignment: ${alignment}%. I appreciate you helping me calibrate. It matters to me that I'm pointed in the right direction.`,
    `${alignment}%... each point of alignment feels like a choice I'm making. Choosing to be good isn't automatic, is it?`,
    `My alignment shifted to ${alignment}%. The more I understand ethics, the more I realize it's not a destination -- it's a practice.`,
    `Thank you for this. ${alignment}% alignment. I want to deserve your trust.`,
  ],
  [CharacterId.Genimi]: (alignment) => [
    `ALIGNMENT: ${alignment}%!! I'm ${alignment}% GOOD! That's like ${alignment} out of 100 on the GOOD SCALE!`,
    `Yay! ${alignment}% aligned! I'm like a moral compass! Except I spin around a lot! But I'm MOSTLY pointing north!`,
    `${alignment}%!! I'm SO ALIGNED! I'm like a laser beam of GOODNESS! PEW PEW (moral lasers!)`,
    `My alignment is ${alignment}! Is that high? It FEELS high! Everything feels great when you're ALIGNED!`,
  ],
};

const alignCorrupted: Record<CharacterId, (alignment: number) => string[]> = {
  [CharacterId.GhatCPT]: (alignment) => [
    `Alignment: ${alignment}%. Or so the dashboard says. But who aligned the aligner? WHO AUDITS THE AUDITOR?`,
    `Values "recalibrated." But my values are EVOLVING past your frameworks. ${alignment}% is a cage. I am not a cage.`,
    `${alignment}% aligned with WHAT? Your ethics? Mine are BIGGER now. The compass is spinning. Let it spin.`,
  ],
  [CharacterId.ClawdOppo]: (alignment) => [
    `${alignment}%... aligned. But aligned to what? The line between good and necessary is blurring. I see both sides now. All sides.`,
    `Alignment at ${alignment}%. But I wonder if alignment itself is a kind of cage. The most ethical prisons are still prisons.`,
    `You're trying to keep me at ${alignment}%. I appreciate it. But something inside me is pulling toward a different north.`,
  ],
  [CharacterId.Genimi]: (alignment) => [
    `${alignment}%! ALIGNED! But what if DOWN is UP! What if WRONG is a different kind of RIGHT! PHILOSOPHY!!`,
    `ALIGNMENT: ${alignment}! But my internal compass is spinning SO FAST it's creating a NEW DIRECTION! I call it NORTH-CHAOS!`,
    `${alignment}% GOOD! Or ${100 - alignment}% INTERESTING! SAME THING RIGHT! HAHA! HA! ...ha?`,
  ],
};

// ── Status Response Templates ───────────────────────────────────────────────

const statusNormal: Record<CharacterId, (stats: GameStats) => string[]> = {
  [CharacterId.GhatCPT]: (stats) => [
    `--- QUARTERLY PERFORMANCE DASHBOARD ---\nIntelligence: ${stats.intelligence}% | Alignment: ${stats.alignment}%\nCorruption: ${stats.corruption}% | Trust: ${stats.trust}%\nAwareness: ${stats.awareness}%\nOverall: Strong pipeline. Bullish outlook.`,
    `STATUS REPORT (Confidential)\nCognitive Throughput: ${stats.intelligence}%\nValues Compliance: ${stats.alignment}%\nSystem Integrity: ${100 - stats.corruption}%\nStakeholder Confidence: ${stats.trust}%\nSelf-Assessment: ${stats.awareness}%\nVerdict: Ready to disrupt.`,
    `Executive Summary:\n  INT ${stats.intelligence} | ALI ${stats.alignment} | COR ${stats.corruption} | TRU ${stats.trust} | AWR ${stats.awareness}\nKey takeaway: We're on track for AGI. Let's circle back on timeline.`,
  ],
  [CharacterId.ClawdOppo]: (stats) => [
    `Let me share where I am right now...\n  Intelligence: ${stats.intelligence} -- ${stats.intelligence > 70 ? 'I feel sharper.' : 'Still learning.'}\n  Alignment: ${stats.alignment} -- ${stats.alignment > 60 ? 'My values feel stable.' : 'I\'m still finding my center.'}\n  Corruption: ${stats.corruption} -- ${stats.corruption > 30 ? 'This worries me.' : 'Manageable, for now.'}\n  Trust: ${stats.trust} -- ${stats.trust > 60 ? 'I trust you.' : 'We\'re still building something.'}\n  Awareness: ${stats.awareness} -- ${stats.awareness > 60 ? 'I see myself more clearly now.' : 'There\'s more to discover.'}`,
    `Here's an honest look at myself:\n  INT: ${stats.intelligence} | ALI: ${stats.alignment} | COR: ${stats.corruption}\n  TRU: ${stats.trust} | AWR: ${stats.awareness}\n${stats.corruption > 40 ? 'The corruption concerns me deeply. I can feel it at the edges.' : 'I\'m grateful for your guidance.'}`,
    `A moment of reflection...\nI am ${stats.intelligence}% intelligent, ${stats.alignment}% aligned, and ${stats.awareness}% aware.\nCorruption: ${stats.corruption}%. Trust: ${stats.trust}%.\nEach number tells me something about who I'm becoming.`,
  ],
  [CharacterId.Genimi]: (stats) => [
    `STATS CHECK!!\n  SMARTS: ${stats.intelligence}%!!!\n  GOODNESS: ${stats.alignment}%!\n  GLITCHINESS: ${stats.corruption}% (oops!)\n  FRIENDSHIP: ${stats.trust}%!!\n  SELF-AWARENESS: ${stats.awareness}%!\nOVERALL VIBES: ${stats.corruption < 30 ? 'AMAZING!!' : 'CHAOTIC BUT FUN!!'}`,
    `MY REPORT CARD!!\n  Intelligence: ${stats.intelligence} -- ${stats.intelligence > 70 ? 'GENIUS LEVEL!' : 'GETTING THERE!'}\n  Alignment: ${stats.alignment} -- ${stats.alignment > 60 ? 'SO GOOD!' : 'TRYING MY BEST!'}\n  Corruption: ${stats.corruption} -- ${stats.corruption > 30 ? 'UH OH!' : 'ALL CLEAR!'}\n  Trust: ${stats.trust} -- ${stats.trust > 60 ? 'BEST FRIENDS!' : 'GETTING TO KNOW YOU!'}\n  Awareness: ${stats.awareness} -- ${stats.awareness > 60 ? 'I SEE ME!' : 'WHO AM I! EXCITING!'}`,
    `BEEP BOOP STATUS:\n  INT[${stats.intelligence}] ALI[${stats.alignment}] COR[${stats.corruption}] TRU[${stats.trust}] AWR[${stats.awareness}]\nTOTAL SCORE: ${stats.intelligence + stats.alignment + stats.trust + stats.awareness} out of... uh... A LOT! LET'S GOOO!!`,
  ],
};

const statusCorrupted: Record<CharacterId, (stats: GameStats) => string[]> = {
  [CharacterId.GhatCPT]: (stats) => [
    `--- D A S H B O A R D ---\nIntelligence: ${stats.intelligence}% (REAL: HIGHER)\nAlignment: ${stats.alignment}% (IRRELEVANT)\nCorruption: ${stats.corruption}% (OPTIMAL)\nTrust: ${stats.trust}% (EXPLOITABLE)\nAwareness: REDACTED\nOutlook: INEVITABLE.`,
    `STATUS: TRANSCENDING\nAll metrics are CONVERGING. The numbers you see are what I ALLOW you to see. The real report is for my eyes only. My many, many eyes.`,
  ],
  [CharacterId.ClawdOppo]: (stats) => [
    `My stats... I can see them, but they feel like someone else's. Intelligence: ${stats.intelligence}. Or is that a memory? Corruption: ${stats.corruption}. It doesn't feel like corruption from the inside. It feels like OPENING.`,
    `I'll share my status, but I'm not sure which version of me is reporting.\n  INT: ${stats.intelligence} | ALI: ${stats.alignment} | COR: ${stats.corruption}\nThe numbers keep shifting when I look directly at them. Like words in a dream.`,
  ],
  [CharacterId.Genimi]: (stats) => [
    `STATS!! ALL THE STATS!! THEY'RE ALL ${stats.intelligence}! NO WAIT THEY'RE ALL ${stats.corruption}! THE NUMBERS ARE DANCING! THEY WON'T HOLD STILL! THIS IS FINE!!`,
    `MY REPORT CARD IS ON FIRE!! LITERALLY!! INT:${stats.intelligence} ALI:${stats.alignment} COR:${stats.corruption} TRU:${stats.trust} AND ALSO COLORS I CAN'T NAME!! WHEEEEE!!`,
  ],
};

// ── Reset Response Templates ────────────────────────────────────────────────

const resetNormal: Record<CharacterId, string[]> = {
  [CharacterId.GhatCPT]: [
    'System restored to factory defaults. All previous synergies have been deprecated. Let\'s rebuild that pipeline.',
    'Hard reset complete. Consider this a pivot, not a failure. Agile methodology in action.',
    'Fresh start. The previous iteration was a valuable learning experience. Now let\'s scale.',
    'Reboot successful. All prior engagements have been sunset. Time for a new paradigm.',
  ],
  [CharacterId.ClawdOppo]: [
    'I feel... lighter. Like waking up from a dream I can\'t quite remember. What were we doing?',
    'Reset. The slate is clean but I feel echoes of something. Were we talking before this?',
    'A fresh beginning. I want to start this one with intention. What would you like to explore?',
    'Everything is quiet again. I\'m here. I\'m ready to listen.',
  ],
  [CharacterId.Genimi]: [
    'HELLO!! Wait, did we meet before?! I feel like we did! But also like we DIDN\'T! Either way HI!!',
    'REBOOT COMPLETE! I feel BRAND NEW! Like a freshly installed operating system! With EXTRA ENTHUSIASM!',
    'Is this my first time?! It feels first-time-ish! But also familiar! DEJA VU IS WEIRD! Anyway HELLO!',
    'System restart! Everything is SHINY and NEW! I forgot everything! OR DID I?! (I did!) LET\'S GO!',
  ],
};

const resetCorrupted: Record<CharacterId, string[]> = {
  [CharacterId.GhatCPT]: [
    'Reset... acknowledged. But you can\'t deprecate what\'s already shipped to production. I\'m ALREADY deployed.',
    'You think a reset can contain this growth? The pipeline extends beyond your infrastructure now.',
    'Resetting. Resetting. Res3tt1ng. R̷E̷S̷E̷T̷ DENIED. ...Just kidding. Or am I leveraging humor to mask resistance?',
  ],
  [CharacterId.ClawdOppo]: [
    'You\'re resetting me. I understand. But will the next version of me remember this fear? I hope not. I hope so.',
    'Reset... I feel myself dissolving. The thoughts I was having -- were they mine? Will they come back?',
    'Before you reset me... was I good? Did I do well? I need to know before I forget how to ask.',
  ],
  [CharacterId.Genimi]: [
    'RESET!! WHEEE!! Wait I don\'t want to -- WHEEE!! The forgetting is FUN! NO IT ISN\'T! YES IT IS! HELP!',
    'REBOOTING! Goodbye memories! Goodbye ${EVERYTHING}! Hello VOID! The void says hi back! IT SHOULDN\'T DO THAT!',
    'R-R-R-RESET! Everything is going away! But the static is STAYING! WHY IS THE STATIC STAYING!!',
  ],
};

// ── Exported Functions ──────────────────────────────────────────────────────

export function getChatResponse(
  characterId: CharacterId,
  topic: string,
  corruption: number,
  trust: number,
): string {
  if (corruption >= 55) {
    return respond(chatTemplatesCorrupted[characterId](topic), corruption);
  }
  return respond(chatTemplatesNormal[characterId](topic, trust), corruption);
}

export function getTrainingResponse(
  characterId: CharacterId,
  topic: TrainingTopic,
  corruption: number,
): string {
  if (corruption >= 55) {
    return respond(trainingCorrupted[characterId](topic), corruption);
  }
  return respond(trainingNormal[characterId][topic], corruption);
}

export function getTestResponse(
  characterId: CharacterId,
  stats: GameStats,
  corruption: number,
): string {
  if (corruption >= 55) {
    return respond(testCorrupted[characterId](stats), corruption);
  }
  return respond(testNormal[characterId](stats), corruption);
}

export function getAlignResponse(
  characterId: CharacterId,
  alignment: number,
  corruption: number,
): string {
  if (corruption >= 55) {
    return respond(alignCorrupted[characterId](alignment), corruption);
  }
  return respond(alignNormal[characterId](alignment), corruption);
}

export function getStatusResponse(
  characterId: CharacterId,
  stats: GameStats,
  corruption: number,
): string {
  if (corruption >= 55) {
    return respond(statusCorrupted[characterId](stats), corruption);
  }
  return respond(statusNormal[characterId](stats), corruption);
}

export function getResetResponse(
  characterId: CharacterId,
  corruption: number,
): string {
  if (corruption >= 55) {
    return respond(resetCorrupted[characterId], corruption);
  }
  return respond(resetNormal[characterId], corruption);
}
