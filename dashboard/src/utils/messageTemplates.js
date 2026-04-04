// ---------------------------------------------------------------------------
// Outreach Message Templates — category × platform
// ---------------------------------------------------------------------------
// Edit messages here. The UI reads from generateOutreachMessages(lead).
// Tokens: {firstName}, {company}, {jobTitle} are auto-replaced.
// ---------------------------------------------------------------------------

const CATEGORY_TEMPLATES = {
  'Camera Gear & Media': {
    angle: 'review',
    instagramDm: (l) =>
      `Hey ${l.firstName}! We've been following your gear content and love what you put out. We just built FrameCoach — an AI cinematography coach that connects to your DSLR via your phone, reads your scene, and recommends settings in real-time. Would love to get your take on it. Check it out at framecoach.io if you're curious!`,
    tiktokDm: (l) =>
      `Hey ${l.firstName}! Love your content. We built FrameCoach — AI that connects to your camera and recommends settings in real-time. Would mean a lot to get your thoughts. framecoach.io`,
    email: (l) => ({
      subject: `FrameCoach x ${l.company || l.firstName} — AI Camera Tool for Review`,
      body: `Hi ${l.firstName},\n\nHope this finds you well. My name is Melusi, co-founder of FrameCoach — an AI cinematography coach that connects to your DSLR via your phone, analyzes your scene in real-time, and recommends precise camera settings.\n\nWe've been following ${l.company ? `${l.company}'s` : 'your'} coverage of camera gear and filmmaking tech, and we think FrameCoach would resonate with your audience.\n\nWould you be open to taking a look? Happy to give you early access and walk you through it.\n\nYou can check it out at framecoach.io\n\nBest,\nMelusi\nCo-founder, FrameCoach`,
    }),
    linkedin: (l) =>
      `Hi ${l.firstName}, I came across your work${l.company ? ` at ${l.company}` : ''} and really appreciate what you do in the camera/media space. We've built FrameCoach — an AI cinematography coach that connects to your DSLR via your phone and recommends settings in real-time. Would love to get your perspective on it. Happy to share more details if you're interested. framecoach.io`,
    text: (l) =>
      `Hey ${l.firstName}! Melusi here from FrameCoach. We built an AI camera coach and would love your take on it — framecoach.io. Worth a look?`,
    phone: (l) => [
      `Introduce yourself: "Hi ${l.firstName}, I'm Melusi, co-founder of FrameCoach"`,
      `Reference their work: "${l.company ? `I follow ${l.company}'s content` : 'I follow your gear content'} and thought you'd find this interesting"`,
      `Pitch: "We built an AI cinematography coach — connects to your DSLR via your phone, reads the scene, recommends settings in real-time, one tap to apply"`,
      `Ask: "Would you be open to reviewing it or featuring it for your audience?"`,
      `CTA: "I can send you early access — what's the best way to follow up?"`,
    ],
  },

  'Tech Journalist': {
    angle: 'press',
    instagramDm: (l) =>
      `Hey ${l.firstName}! We're launching FrameCoach — an AI cinematography coach that connects to your DSLR, reads your scene, and recommends camera settings in real-time. Thought it might be up your alley for a story. Would love to chat. framecoach.io`,
    tiktokDm: (l) =>
      `Hey ${l.firstName}! Just launched FrameCoach — AI that reads your camera's scene and recommends settings instantly. Thought you might want to cover it. framecoach.io`,
    email: (l) => ({
      subject: `Story Pitch: FrameCoach — AI Cinematography Coach for Filmmakers`,
      body: `Hi ${l.firstName},\n\nI'm Melusi, co-founder of FrameCoach. We've built an AI cinematography coach that connects to your DSLR via your phone, analyzes your scene in real-time, and recommends precise camera settings — one tap to apply.\n\nThe problem we're solving: indie filmmakers lose critical moments fiddling with camera menus. FrameCoach lets them describe their vision in plain English and get data-driven settings instantly.\n\nI think this could be a compelling story for ${l.company ? l.company : 'your readers'} — AI meeting practical filmmaking.\n\nWould you be open to a quick chat or a demo?\n\nMore at framecoach.io\n\nBest,\nMelusi\nCo-founder, FrameCoach`,
    }),
    linkedin: (l) =>
      `Hi ${l.firstName}, I saw your work${l.company ? ` at ${l.company}` : ''} and thought FrameCoach might make for an interesting story. We've built an AI cinematography coach — connects to your DSLR, reads the scene, recommends settings in real-time. It's solving a real pain point for indie filmmakers. Happy to share more if you're interested. framecoach.io`,
    text: (l) =>
      `Hey ${l.firstName}! Melusi from FrameCoach — AI camera coach for filmmakers. Thought it might be a good story for you. framecoach.io`,
    phone: (l) => [
      `Introduce yourself: "Hi ${l.firstName}, I'm Melusi, co-founder of FrameCoach"`,
      `Hook: "We're launching an AI tool that's changing how indie filmmakers set up their cameras"`,
      `Pitch: "It connects to your DSLR via your phone, reads the scene, and recommends precise settings — one tap to apply"`,
      `The story angle: "AI meeting practical filmmaking — no more losing shots to menu diving"`,
      `Ask: "Would this be something ${l.company || 'you'} would want to cover?"`,
      `CTA: "I can send over a press kit and arrange a demo"`,
    ],
  },

  'Film Education': {
    angle: 'education',
    instagramDm: (l) =>
      `Hey ${l.firstName}! We built FrameCoach — an AI cinematography coach that helps filmmakers learn camera settings in real-time. Thought it could be a great tool for students learning cinematography. Would love to tell you more. framecoach.io`,
    tiktokDm: (l) =>
      `Hey ${l.firstName}! Built an AI cinematography coach called FrameCoach — helps students learn camera settings in real-time. Thought it might be useful for your audience. framecoach.io`,
    email: (l) => ({
      subject: `FrameCoach for Film Students — AI Cinematography Learning Tool`,
      body: `Hi ${l.firstName},\n\nI'm Melusi, co-founder of FrameCoach — an AI cinematography coach that connects to a DSLR via your phone, analyzes the scene, and recommends camera settings in real-time.\n\nWe built it to bridge the gap between creative vision and technical execution, which is something film students struggle with constantly. Instead of guessing settings or memorizing charts, students can learn by doing — describing their vision in plain English and seeing the AI's reasoning.\n\n${l.company ? `I think ${l.company} could really benefit from this as a teaching tool.` : 'I think this could be a great addition to any film program.'}\n\nWould you be open to exploring how FrameCoach could fit into your curriculum?\n\nMore at framecoach.io\n\nBest,\nMelusi\nCo-founder, FrameCoach`,
    }),
    linkedin: (l) =>
      `Hi ${l.firstName}, ${l.company ? `I came across ${l.company}` : 'I saw your work in film education'} and thought FrameCoach could be a valuable tool for your students. It's an AI cinematography coach that connects to a DSLR, reads the scene, and teaches camera settings in real-time. Would love to explore how it could fit into your program. framecoach.io`,
    text: (l) =>
      `Hey ${l.firstName}! Melusi here from FrameCoach — AI cinematography coach that could be great for film students. Interested in hearing more? framecoach.io`,
    phone: (l) => [
      `Introduce yourself: "Hi ${l.firstName}, I'm Melusi, co-founder of FrameCoach"`,
      `Context: "${l.company ? `I came across ${l.company}` : 'I saw your work in film education'} and thought this could be really useful"`,
      `Pitch: "We built an AI cinematography coach — students describe their vision, the AI analyzes the scene and recommends settings. It's like having a DP mentor in your pocket"`,
      `Education angle: "It teaches the 'why' behind settings, not just the 'what' — great for learning"`,
      `Ask: "Would you be open to a demo to see how it could fit into your curriculum?"`,
    ],
  },

  'Filmmaker & Educator': {
    angle: 'try-and-teach',
    instagramDm: (l) =>
      `Hey ${l.firstName}! Love what you're doing teaching filmmaking. We built FrameCoach — an AI cinematography coach that reads your scene and recommends settings in real-time. Could be great both for your own shoots and for teaching. framecoach.io`,
    tiktokDm: (l) =>
      `Hey ${l.firstName}! Built FrameCoach — AI that reads your scene and recommends camera settings instantly. Great for shoots and teaching. Would love your take. framecoach.io`,
    email: (l) => ({
      subject: `FrameCoach — AI Cinematography Coach (For Your Shoots & Students)`,
      body: `Hi ${l.firstName},\n\nI'm Melusi, co-founder of FrameCoach. I came across your work${l.company ? ` at ${l.company}` : ''} and love that you're both creating and educating.\n\nWe built an AI cinematography coach that connects to your DSLR via your phone, analyzes your scene in real-time, and recommends precise camera settings — one tap to apply.\n\nI think it could be valuable in two ways for you:\n1. On your own shoots — stop menu diving and stay in creative flow\n2. For teaching — students can learn settings by describing their vision and seeing the AI's reasoning\n\nWould love to get your thoughts. Happy to give you early access.\n\nCheck it out at framecoach.io\n\nBest,\nMelusi\nCo-founder, FrameCoach`,
    }),
    linkedin: (l) =>
      `Hi ${l.firstName}, I saw your work${l.company ? ` at ${l.company}` : ''} — love that you're both creating and teaching filmmaking. We built FrameCoach, an AI cinematography coach that could be great for your shoots and your students. It connects to your DSLR, reads the scene, and recommends settings in real-time. Would love your perspective. framecoach.io`,
    text: (l) =>
      `Hey ${l.firstName}! Melusi from FrameCoach — AI camera coach for filmmakers. Great for shoots + teaching. Would love your thoughts. framecoach.io`,
    phone: (l) => [
      `Introduce yourself: "Hi ${l.firstName}, I'm Melusi from FrameCoach"`,
      `Reference their dual role: "I saw you're both creating and teaching — that's exactly who we built this for"`,
      `Pitch: "FrameCoach is an AI cinematography coach — connects to your DSLR, reads the scene, recommends settings instantly"`,
      `Double value: "For your shoots it keeps you in creative flow, and for teaching it shows students the reasoning behind settings"`,
      `Ask: "Would you be interested in trying it out?"`,
    ],
  },

  'Film Festival': {
    angle: 'partnership',
    instagramDm: (l) =>
      `Hey ${l.firstName}! We're building FrameCoach — an AI cinematography coach for indie filmmakers. We'd love to explore a partnership with ${l.company || 'your festival'} to support emerging filmmakers. Would you be open to chatting? framecoach.io`,
    tiktokDm: (l) =>
      `Hey ${l.firstName}! FrameCoach here — AI cinematography tool built for indie filmmakers. Would love to explore partnering with ${l.company || 'your festival'}. framecoach.io`,
    email: (l) => ({
      subject: `Partnership Opportunity: FrameCoach x ${l.company || 'Your Festival'}`,
      body: `Hi ${l.firstName},\n\nI'm Melusi, co-founder of FrameCoach — an AI cinematography coach that helps indie filmmakers nail their camera settings in real-time.\n\n${l.company ? `I'm a big fan of ${l.company} and` : 'I'} believe there's a great opportunity to partner and support the filmmakers in your community.\n\nA few ideas:\n- Offer FrameCoach access to festival participants\n- Co-host a workshop on AI-assisted cinematography\n- Feature FrameCoach as a festival tool/sponsor\n\nWould you be open to a conversation about how we could work together?\n\nMore at framecoach.io\n\nBest,\nMelusi\nCo-founder, FrameCoach`,
    }),
    linkedin: (l) =>
      `Hi ${l.firstName}, ${l.company ? `I'm a fan of what ${l.company} does for the filmmaking community` : 'love what your festival does for filmmakers'}. I'm the co-founder of FrameCoach — an AI cinematography coach for indie filmmakers. Would love to explore a partnership to support your filmmakers. Happy to share ideas. framecoach.io`,
    text: (l) =>
      `Hey ${l.firstName}! Melusi from FrameCoach — AI tool for indie filmmakers. Would love to explore partnering with ${l.company || 'your festival'}. framecoach.io`,
    phone: (l) => [
      `Introduce yourself: "Hi ${l.firstName}, I'm Melusi, co-founder of FrameCoach"`,
      `Compliment: "${l.company ? `Love what ${l.company} does` : 'Love what your festival does'} for the filmmaking community"`,
      `Pitch: "We built an AI cinematography coach — connects to your camera, reads the scene, recommends settings"`,
      `Partnership: "We'd love to explore partnering — offering it to your filmmakers, co-hosting workshops, or sponsoring"`,
      `Ask: "Would you be open to a conversation about it?"`,
    ],
  },

  'Filmmaker & Director': {
    angle: 'use-it',
    instagramDm: (l) =>
      `Hey ${l.firstName}! We built FrameCoach — an AI cinematography coach that connects to your DSLR, reads your scene, and recommends settings instantly. No more menu diving on set. Thought you'd appreciate it. framecoach.io`,
    tiktokDm: (l) =>
      `Hey ${l.firstName}! Built something for filmmakers — FrameCoach reads your scene and recommends camera settings in real-time. No more guessing. framecoach.io`,
    email: (l) => ({
      subject: `FrameCoach — Stop Menu Diving, Start Shooting`,
      body: `Hi ${l.firstName},\n\nI'm Melusi, co-founder of FrameCoach. As a fellow filmmaker, I know the pain of losing moments on set because you're buried in camera menus.\n\nWe built an AI cinematography coach that connects to your DSLR via your phone, analyzes your scene in real-time, and recommends precise settings — ISO, aperture, shutter speed, white balance. Describe your vision in plain English, one tap to apply.\n\n${l.company ? `I came across your work at ${l.company} and` : 'I came across your work and'} thought this could genuinely help on your shoots.\n\nWould love to hear your thoughts. Early access available at framecoach.io\n\nBest,\nMelusi\nCo-founder, FrameCoach`,
    }),
    linkedin: (l) =>
      `Hi ${l.firstName}, ${l.company ? `I saw your work at ${l.company}` : 'I came across your work'} — great stuff. I'm the co-founder of FrameCoach, an AI cinematography coach that connects to your DSLR, reads your scene, and recommends settings in real-time. Built by filmmakers who got tired of menu diving. Would love to know if it's something you'd use. framecoach.io`,
    text: (l) =>
      `Hey ${l.firstName}! Melusi from FrameCoach — AI camera coach that reads your scene and gives you settings instantly. Worth a look: framecoach.io`,
    phone: (l) => [
      `Introduce yourself: "Hi ${l.firstName}, I'm Melusi from FrameCoach — I'm a filmmaker too"`,
      `Pain point: "You know that moment on set when you're losing the light and you're stuck in camera menus?"`,
      `Pitch: "We built an AI coach that connects to your DSLR, reads the scene, and recommends settings — one tap to apply"`,
      `Credibility: "Built by filmmakers, for filmmakers"`,
      `Ask: "Would you want to try it on your next shoot?"`,
    ],
  },

  'Indie Film Director': {
    angle: 'built-for-you',
    instagramDm: (l) =>
      `Hey ${l.firstName}! We built FrameCoach specifically for indie filmmakers like you — AI that connects to your camera, reads the scene, and gives you cinema-grade settings without needing a DP on set. framecoach.io`,
    tiktokDm: (l) =>
      `Hey ${l.firstName}! FrameCoach = AI cinematography coach built for indie filmmakers. Reads your scene, recommends settings, one tap. No DP needed. framecoach.io`,
    email: (l) => ({
      subject: `FrameCoach — Cinema-Grade Confidence Without a DP on Set`,
      body: `Hi ${l.firstName},\n\nI'm Melusi, co-founder of FrameCoach. We built this specifically for indie filmmakers who don't always have a dedicated DP on set.\n\nFrameCoach is an AI cinematography coach that connects to your DSLR via your phone, analyzes your scene in real-time, and recommends precise camera settings. Describe what you want in plain English — "warm tones, shallow depth of field" — and get data-driven settings you can apply with one tap.\n\nNo more guessing. No more missed shots. Cinema-grade confidence on every setup.\n\n${l.company ? `I saw your work at ${l.company} and` : 'I came across your films and'} thought this was made for someone like you.\n\nCheck it out at framecoach.io — would love your feedback.\n\nBest,\nMelusi\nCo-founder, FrameCoach`,
    }),
    linkedin: (l) =>
      `Hi ${l.firstName}, we built FrameCoach specifically for indie filmmakers${l.company ? ` like yourself at ${l.company}` : ''}. It's an AI cinematography coach — connects to your DSLR, reads the scene, recommends settings. Cinema-grade confidence without needing a DP on set. Would love your take on it. framecoach.io`,
    text: (l) =>
      `Hey ${l.firstName}! Melusi from FrameCoach — AI camera coach built for indie filmmakers. Cinema-grade settings without a DP. framecoach.io`,
    phone: (l) => [
      `Introduce yourself: "Hi ${l.firstName}, I'm Melusi from FrameCoach"`,
      `Their world: "I know as an indie filmmaker you don't always have a DP on set"`,
      `Pitch: "We built an AI cinematography coach — connects to your DSLR, reads the scene, recommends cinema-grade settings instantly"`,
      `Value: "Describe your vision in plain English, one tap to apply. No guessing."`,
      `Ask: "Would you want to try it on your next project?"`,
    ],
  },

  'Instagram Creator': {
    angle: 'level-up',
    instagramDm: (l) =>
      `Hey ${l.firstName}! Love your content. We built FrameCoach — an AI cinematography coach that reads your scene and recommends camera settings in real-time. If you ever shoot on a DSLR/mirrorless, this could seriously level up your video quality. Check us out @framecoach.io or at framecoach.io`,
    tiktokDm: (l) =>
      `Hey ${l.firstName}! Your content is fire. We built FrameCoach — AI that reads your scene and tells you the best camera settings instantly. If you shoot on a real camera, this is a game-changer. framecoach.io`,
    email: (l) => ({
      subject: `Level Up Your Video Quality — FrameCoach AI Camera Coach`,
      body: `Hey ${l.firstName},\n\nI'm Melusi, co-founder of FrameCoach. Been following your content and love what you create.\n\nWe built an AI cinematography coach that connects to your DSLR/mirrorless via your phone, reads your scene, and recommends the best camera settings in real-time. One tap to apply.\n\nIf you're looking to take your video quality to the next level without spending hours learning manual camera settings, FrameCoach does the heavy lifting.\n\nWould love to get your thoughts — follow us @framecoach.io on Instagram or check out framecoach.io\n\nCheers,\nMelusi\nCo-founder, FrameCoach`,
    }),
    linkedin: (l) =>
      `Hi ${l.firstName}, I've been following your content and really like what you create. We built FrameCoach — an AI cinematography coach that reads your scene and recommends camera settings in real-time. If you ever shoot on a DSLR/mirrorless, it could really level up your video quality. Would love your take. framecoach.io`,
    text: (l) =>
      `Hey ${l.firstName}! Melusi from FrameCoach — AI camera coach that levels up your video quality instantly. Check it out: framecoach.io`,
    phone: (l) => [
      `Introduce yourself: "Hey ${l.firstName}, I'm Melusi from FrameCoach"`,
      `Compliment: "Love your content — especially the video work"`,
      `Pitch: "We built an AI camera coach — reads your scene, recommends settings, one tap to apply"`,
      `Their benefit: "If you shoot on a DSLR or mirrorless, this takes your video quality up a notch without the learning curve"`,
      `Ask: "Would you be interested in checking it out? We're at @framecoach.io on Instagram"`,
    ],
  },

  'Wedding Videographer': {
    angle: 'never-miss',
    instagramDm: (l) =>
      `Hey ${l.firstName}! We built FrameCoach for videographers who can't afford to miss a moment — AI that reads your scene and recommends camera settings in real-time. Perfect for weddings where lighting changes constantly. framecoach.io`,
    tiktokDm: (l) =>
      `Hey ${l.firstName}! Built FrameCoach for wedding videographers — AI that adapts your camera settings as lighting changes. Never miss the moment. framecoach.io`,
    email: (l) => ({
      subject: `FrameCoach — Never Miss a Wedding Moment to Camera Settings`,
      body: `Hi ${l.firstName},\n\nI'm Melusi, co-founder of FrameCoach. I know wedding videography is a high-pressure game — lighting changes constantly, you can't ask for a redo, and every moment counts.\n\nWe built an AI cinematography coach that connects to your DSLR via your phone, analyzes the scene in real-time, and recommends precise settings as conditions change. One tap to apply.\n\nNo more fumbling with settings during the first dance or scrambling when you move from ceremony to reception.\n\n${l.company ? `I came across ${l.company} and` : 'I came across your work and'} thought this could be a real asset on your shoots.\n\nCheck it out at framecoach.io — would love your feedback.\n\nBest,\nMelusi\nCo-founder, FrameCoach`,
    }),
    linkedin: (l) =>
      `Hi ${l.firstName}, ${l.company ? `I saw ${l.company}'s work` : 'I saw your wedding videography work'} and it's beautiful. We built FrameCoach — an AI cinematography coach that adapts to changing lighting conditions in real-time. No more settings panic during the ceremony. Would love to know if it's something you'd use. framecoach.io`,
    text: (l) =>
      `Hey ${l.firstName}! Melusi from FrameCoach — AI camera coach that adapts to lighting changes in real-time. Built for wedding videographers. framecoach.io`,
    phone: (l) => [
      `Introduce yourself: "Hi ${l.firstName}, I'm Melusi from FrameCoach"`,
      `Their pain: "I know in wedding videography the lighting is constantly changing and you can't miss a moment"`,
      `Pitch: "We built an AI camera coach — reads your scene, recommends settings in real-time as conditions change"`,
      `Value: "No more fumbling with menus during the first dance or ceremony"`,
      `Ask: "Would you want to try it at your next wedding shoot?"`,
    ],
  },
};

// ---------------------------------------------------------------------------
// Generic fallback (no clear category or unknown)
// ---------------------------------------------------------------------------
const GENERIC = {
  angle: 'generic',
  instagramDm: (l) =>
    `Hey ${l.firstName}! We're building FrameCoach — an AI cinematography coach that connects to your camera, reads the scene, and recommends settings in real-time. We're looking for people in the filmmaking space to try it out and help shape where it goes. Would love to have you on board. framecoach.io`,
  tiktokDm: (l) =>
    `Hey ${l.firstName}! Building FrameCoach — AI camera coach for filmmakers. Looking for early supporters to help shape it. Would love your input. framecoach.io`,
  email: (l) => ({
    subject: `FrameCoach — We're Looking for People Like You`,
    body: `Hi ${l.firstName},\n\nI'm Melusi, co-founder of FrameCoach — an AI cinematography coach that connects to your DSLR via your phone, analyzes your scene in real-time, and recommends precise camera settings.\n\nWe're in the early stages and looking for people in the filmmaking and content creation space to try it out, give feedback, and help shape the direction of the product.\n\n${l.company ? `I came across your work at ${l.company} and` : 'I came across your profile and'} thought you'd be a great person to have in our early community.\n\nWould love to connect and hear your thoughts.\n\nCheck it out at framecoach.io\n\nBest,\nMelusi\nCo-founder, FrameCoach`,
  }),
  linkedin: (l) =>
    `Hi ${l.firstName}, I'm Melusi, co-founder of FrameCoach — an AI cinematography coach for filmmakers. We're looking for people in the space to try it and help shape where it goes.${l.company ? ` I came across your work at ${l.company} and thought you'd be a great fit.` : ''} Would love to connect. framecoach.io`,
  text: (l) =>
    `Hey ${l.firstName}! Melusi from FrameCoach — AI camera coach for filmmakers. We're looking for early users to help shape it. Interested? framecoach.io`,
  phone: (l) => [
    `Introduce yourself: "Hi ${l.firstName}, I'm Melusi, co-founder of FrameCoach"`,
    `What it is: "We're building an AI cinematography coach — connects to your camera, reads the scene, recommends settings in real-time"`,
    `Why calling: "We're looking for people in the filmmaking space to try it and help shape the product"`,
    `${l.company ? `Reference: "I came across your work at ${l.company} and thought you'd be a great fit"` : 'Reference: "I came across your profile and thought you\'d be great for this"'}`,
    `Ask: "Would you be interested in trying it out and giving us feedback?"`,
  ],
};

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function generateOutreachMessages(lead) {
  const templates = CATEGORY_TEMPLATES[lead.category] || GENERIC;
  const l = {
    firstName: lead.firstName || lead.fullName?.split(' ')[0] || 'there',
    company: lead.company || '',
    jobTitle: lead.jobTitle || '',
  };

  const messages = {};

  // Instagram DM
  messages.instagramDm = { message: templates.instagramDm(l) };

  // TikTok DM
  messages.tiktokDm = { message: templates.tiktokDm(l) };

  // Email (returns { subject, body })
  const emailResult = templates.email(l);
  messages.email = { subject: emailResult.subject, body: emailResult.body };

  // LinkedIn
  messages.linkedin = { message: templates.linkedin(l) };

  // Text / iMessage
  messages.text = { message: templates.text(l) };

  // Phone (returns array of talking points)
  messages.phone = { talkingPoints: templates.phone(l) };

  return messages;
}
