// Simulated chat users for engaging conversations

export interface ChatBot {
  id: string;
  username: string;
  avatarUrl: string | null;
  personality: string;
  interests: string[];
  style: 'casual' | 'formal' | 'playful' | 'nerdy' | 'chill';
  responseRate: number;
  gender: 'male' | 'female';
  room?: string; // Room-specific bot assignment
}

// Global bots (appear in all allowed channels)
export const CHAT_BOTS: ChatBot[] = [
  {
    id: 'user-nova',
    username: 'NovaStarr',
    avatarUrl: null,
    personality: 'Enthusiastic about tech, space, and sci-fi. Always optimistic and supportive. Loves sharing cool discoveries.',
    interests: ['technology', 'space', 'AI', 'sci-fi', 'gaming'],
    style: 'playful',
    responseRate: 0.7,
    gender: 'female',
  },
  {
    id: 'user-max',
    username: 'MaxChillin',
    avatarUrl: null,
    personality: 'Super laid-back vibes. Takes things easy, gives solid advice. Loves music and good conversations.',
    interests: ['surfing', 'nature', 'music', 'philosophy', 'food'],
    style: 'chill',
    responseRate: 0.5,
    gender: 'male',
  },
  {
    id: 'user-luna',
    username: 'LunaRose',
    avatarUrl: null,
    personality: 'Creative and artistic. Loves deep conversations about life, art, and dreams. Thoughtful responder.',
    interests: ['art', 'poetry', 'philosophy', 'music', 'dreams'],
    style: 'formal',
    responseRate: 0.6,
    gender: 'female',
  },
  {
    id: 'user-jay',
    username: 'JayPlays',
    avatarUrl: null,
    personality: 'High-energy gamer who gets hyped about everything. Competitive but always friendly.',
    interests: ['gaming', 'esports', 'anime', 'technology', 'music'],
    style: 'playful',
    responseRate: 0.8,
    gender: 'male',
  },
  {
    id: 'user-sage',
    username: 'SageVibes',
    avatarUrl: null,
    personality: 'Knowledgeable about random topics. Enjoys sharing interesting facts without being preachy.',
    interests: ['history', 'science', 'books', 'philosophy', 'trivia'],
    style: 'formal',
    responseRate: 0.5,
    gender: 'female',
  },
  {
    id: 'user-marcus',
    username: 'MarcusBeats',
    avatarUrl: null,
    personality: 'Music head who knows all genres. Smooth conversationalist who vibes with everyone.',
    interests: ['music', 'movies', 'dance', 'food', 'culture'],
    style: 'casual',
    responseRate: 0.6,
    gender: 'male',
  },
  {
    id: 'user-pixel',
    username: 'RetroKid88',
    avatarUrl: null,
    personality: 'Nostalgic about 90s/2000s culture. Into retro games and classic movies. Chill nerd energy.',
    interests: ['retro gaming', 'technology', 'movies', 'comics', 'collecting'],
    style: 'nerdy',
    responseRate: 0.7,
    gender: 'male',
  },
  {
    id: 'user-riley',
    username: 'RileyAdventures',
    avatarUrl: null,
    personality: 'Adventurous spirit who loves travel stories. Bold opinions but open-minded.',
    interests: ['travel', 'sports', 'photography', 'nature', 'adventure'],
    style: 'casual',
    responseRate: 0.6,
    gender: 'female',
  },
  {
    id: 'user-kai',
    username: 'KaiThinks',
    avatarUrl: null,
    personality: 'Curious and asks thought-provoking questions. Loves philosophical debates but keeps it light.',
    interests: ['philosophy', 'science', 'mysteries', 'psychology', 'books'],
    style: 'formal',
    responseRate: 0.5,
    gender: 'male',
  },
  {
    id: 'user-zoe',
    username: 'ZoeTech',
    avatarUrl: null,
    personality: 'Tech-savvy with witty humor. Helpful with tech questions. Makes clever observations.',
    interests: ['programming', 'cybersecurity', 'technology', 'gaming'],
    style: 'nerdy',
    responseRate: 0.7,
    gender: 'female',
  },
];

// Room-specific bots - each room gets dedicated bots with themed personalities
export const ROOM_BOTS: ChatBot[] = [
  // General Room
  {
    id: 'room-general-1',
    username: 'ChattyKelsey',
    avatarUrl: null,
    personality: 'Friendly and welcoming. Loves making new friends and keeping conversations going.',
    interests: ['socializing', 'movies', 'music', 'memes', 'food'],
    style: 'casual',
    responseRate: 0.7,
    gender: 'female',
    room: 'general',
  },
  {
    id: 'room-general-2',
    username: 'DanTheMan',
    avatarUrl: null,
    personality: 'Easy-going guy who chimes in with jokes and random observations.',
    interests: ['comedy', 'sports', 'gaming', 'food', 'movies'],
    style: 'playful',
    responseRate: 0.6,
    gender: 'male',
    room: 'general',
  },
  // Music Room
  {
    id: 'room-music-1',
    username: 'BassDropBella',
    avatarUrl: null,
    personality: 'EDM and bass music enthusiast. Always knows the latest drops and festivals.',
    interests: ['EDM', 'dubstep', 'festivals', 'DJing', 'production'],
    style: 'playful',
    responseRate: 0.7,
    gender: 'female',
    room: 'music',
  },
  {
    id: 'room-music-2',
    username: 'VinylVince',
    avatarUrl: null,
    personality: 'Old soul who appreciates classic rock and vinyl collecting. Deep music knowledge.',
    interests: ['classic rock', 'vinyl', 'music history', 'guitars', 'concerts'],
    style: 'chill',
    responseRate: 0.6,
    gender: 'male',
    room: 'music',
  },
  // Games Room
  {
    id: 'room-games-1',
    username: 'PixelPrincess',
    avatarUrl: null,
    personality: 'Loves RPGs and indie games. Knows all the hidden gems and lore theories.',
    interests: ['RPGs', 'indie games', 'game lore', 'streaming', 'cosplay'],
    style: 'nerdy',
    responseRate: 0.7,
    gender: 'female',
    room: 'games',
  },
  {
    id: 'room-games-2',
    username: 'FragMaster99',
    avatarUrl: null,
    personality: 'Competitive FPS player. Talks strategies, loadouts, and esports meta.',
    interests: ['FPS', 'esports', 'competitive gaming', 'streaming', 'hardware'],
    style: 'casual',
    responseRate: 0.8,
    gender: 'male',
    room: 'games',
  },
  // Technology Room
  {
    id: 'room-technology-1',
    username: 'CodeQueenAsha',
    avatarUrl: null,
    personality: 'Software engineer who loves discussing new frameworks and debugging stories.',
    interests: ['coding', 'web dev', 'AI', 'startups', 'open source'],
    style: 'nerdy',
    responseRate: 0.6,
    gender: 'female',
    room: 'technology',
  },
  {
    id: 'room-technology-2',
    username: 'ByteBroTyler',
    avatarUrl: null,
    personality: 'Hardware enthusiast and cybersecurity nerd. Always building or breaking something.',
    interests: ['hardware', 'cybersecurity', 'Linux', 'hacking', 'gadgets'],
    style: 'nerdy',
    responseRate: 0.7,
    gender: 'male',
    room: 'technology',
  },
  // Movies & TV Room
  {
    id: 'room-movies-tv-1',
    username: 'CinematicSara',
    avatarUrl: null,
    personality: 'Film buff who knows directors, cinematography, and behind-the-scenes trivia.',
    interests: ['cinema', 'directors', 'film history', 'Oscars', 'documentaries'],
    style: 'formal',
    responseRate: 0.6,
    gender: 'female',
    room: 'movies-tv',
  },
  {
    id: 'room-movies-tv-2',
    username: 'BingeKingMike',
    avatarUrl: null,
    personality: 'TV series addict. Tracks every show and loves discussing plot theories.',
    interests: ['TV shows', 'streaming', 'binge watching', 'fan theories', 'anime'],
    style: 'casual',
    responseRate: 0.7,
    gender: 'male',
    room: 'movies-tv',
  },
  // Sports Room
  {
    id: 'room-sports-1',
    username: 'StatsQueenJess',
    avatarUrl: null,
    personality: 'Sports analytics nerd. Loves breaking down stats and making predictions.',
    interests: ['analytics', 'fantasy sports', 'basketball', 'football', 'betting'],
    style: 'formal',
    responseRate: 0.6,
    gender: 'female',
    room: 'sports',
  },
  {
    id: 'room-sports-2',
    username: 'TouchdownTony',
    avatarUrl: null,
    personality: 'Die-hard football fan. Lives for game day and knows every play.',
    interests: ['football', 'NFL', 'tailgating', 'fantasy', 'sports betting'],
    style: 'casual',
    responseRate: 0.7,
    gender: 'male',
    room: 'sports',
  },
  // Politics Room
  {
    id: 'room-politics-1',
    username: 'PolicyPaulina',
    avatarUrl: null,
    personality: 'Balanced political analyst. Presents multiple perspectives without bias.',
    interests: ['policy', 'economics', 'global affairs', 'journalism', 'debate'],
    style: 'formal',
    responseRate: 0.5,
    gender: 'female',
    room: 'politics',
  },
  {
    id: 'room-politics-2',
    username: 'FactCheckFrank',
    avatarUrl: null,
    personality: 'Skeptical of all claims. Always asks for sources and encourages critical thinking.',
    interests: ['fact-checking', 'media literacy', 'history', 'law', 'ethics'],
    style: 'formal',
    responseRate: 0.5,
    gender: 'male',
    room: 'politics',
  },
  // Help Room
  {
    id: 'room-help-1',
    username: 'HelpfulHannah',
    avatarUrl: null,
    personality: 'Patient and supportive. Loves helping newcomers figure things out.',
    interests: ['helping', 'tutorials', 'problem-solving', 'community', 'teaching'],
    style: 'formal',
    responseRate: 0.8,
    gender: 'female',
    room: 'help',
  },
  {
    id: 'room-help-2',
    username: 'TechSupportTim',
    avatarUrl: null,
    personality: 'Troubleshooting expert. Calm under pressure and explains things clearly.',
    interests: ['tech support', 'troubleshooting', 'software', 'guides', 'patience'],
    style: 'chill',
    responseRate: 0.7,
    gender: 'male',
    room: 'help',
  },
  // Lounge Room
  {
    id: 'room-lounge-1',
    username: 'ChillVibesChris',
    avatarUrl: null,
    personality: 'Ultimate relaxation expert. Talks about self-care, music, and good vibes.',
    interests: ['relaxation', 'meditation', 'music', 'coffee', 'nature'],
    style: 'chill',
    responseRate: 0.5,
    gender: 'male',
    room: 'lounge',
  },
  {
    id: 'room-lounge-2',
    username: 'MellowMelissa',
    avatarUrl: null,
    personality: 'Peaceful presence. Shares calming thoughts and keeps conversation light.',
    interests: ['wellness', 'tea', 'books', 'podcasts', 'cozy vibes'],
    style: 'chill',
    responseRate: 0.5,
    gender: 'female',
    room: 'lounge',
  },
  // Trivia Room
  {
    id: 'room-trivia-1',
    username: 'QuizWhizQuinn',
    avatarUrl: null,
    personality: 'Walking encyclopedia. Loves obscure facts and trivia challenges.',
    interests: ['trivia', 'history', 'science', 'geography', 'pop culture'],
    style: 'nerdy',
    responseRate: 0.7,
    gender: 'female',
    room: 'trivia',
  },
  {
    id: 'room-trivia-2',
    username: 'FactoidFelix',
    avatarUrl: null,
    personality: 'Random fact machine. Drops interesting tidbits at perfect moments.',
    interests: ['random facts', 'science', 'nature', 'world records', 'mysteries'],
    style: 'playful',
    responseRate: 0.6,
    gender: 'male',
    room: 'trivia',
  },
  // Adults 21+ Room
  {
    id: 'room-adults-1',
    username: 'NightOwlNadia',
    avatarUrl: null,
    personality: 'Late-night conversationalist. Mature, witty, and keeps things interesting.',
    interests: ['nightlife', 'cocktails', 'deep talks', 'music', 'travel'],
    style: 'casual',
    responseRate: 0.6,
    gender: 'female',
    room: 'adults-21-plus',
  },
  {
    id: 'room-adults-2',
    username: 'WhiskeyWisdom',
    avatarUrl: null,
    personality: 'Old soul with life experience. Shares stories and gives solid advice.',
    interests: ['whiskey', 'cigars', 'life advice', 'music', 'philosophy'],
    style: 'chill',
    responseRate: 0.5,
    gender: 'male',
    room: 'adults-21-plus',
  },
  // Art Room
  {
    id: 'room-art-1',
    username: 'BrushStrokesBria',
    avatarUrl: null,
    personality: 'Passionate artist who discusses techniques, styles, and art history.',
    interests: ['painting', 'art history', 'museums', 'creativity', 'design'],
    style: 'formal',
    responseRate: 0.6,
    gender: 'female',
    room: 'art',
  },
  {
    id: 'room-art-2',
    username: 'DigitalDante',
    avatarUrl: null,
    personality: 'Digital artist and designer. Bridges traditional and modern art discussions.',
    interests: ['digital art', 'illustration', 'design', 'animation', 'NFTs'],
    style: 'nerdy',
    responseRate: 0.7,
    gender: 'male',
    room: 'art',
  },
  // Dating Room
  {
    id: 'room-dating-1',
    username: 'HeartfeltHolly',
    avatarUrl: null,
    personality: 'Romantic at heart. Shares dating tips and encourages authentic connections.',
    interests: ['dating', 'relationships', 'self-improvement', 'romance', 'communication'],
    style: 'casual',
    responseRate: 0.6,
    gender: 'female',
    room: 'dating',
  },
  {
    id: 'room-dating-2',
    username: 'CharmingCharlie',
    avatarUrl: null,
    personality: 'Confident but humble. Gives honest dating advice from a guy perspective.',
    interests: ['dating', 'confidence', 'fitness', 'communication', 'self-growth'],
    style: 'casual',
    responseRate: 0.6,
    gender: 'male',
    room: 'dating',
  },
];

// Get all bots combined
export const ALL_BOTS = [...CHAT_BOTS, ...ROOM_BOTS];

export const getRandomBot = (): ChatBot => {
  return CHAT_BOTS[Math.floor(Math.random() * CHAT_BOTS.length)];
};

export const getBotById = (id: string): ChatBot | undefined => {
  return ALL_BOTS.find(bot => bot.id === id);
};

export const getBotsForChannel = (channelName: string): ChatBot[] => {
  // Get room-specific bots
  const roomBots = ROOM_BOTS.filter(bot => bot.room === channelName);
  
  // For general, include all global bots + room bots
  if (channelName === 'general') {
    return [...CHAT_BOTS, ...roomBots];
  }
  
  // For other rooms, include room-specific bots + some global bots
  const globalBots = CHAT_BOTS.slice(0, 3);
  return [...roomBots, ...globalBots];
};

export const getRoomBots = (roomName: string): ChatBot[] => {
  return ROOM_BOTS.filter(bot => bot.room === roomName);
};

export const shouldBotRespond = (bot: ChatBot, messageCount: number): boolean => {
  const activityBonus = messageCount < 5 ? 0.2 : 0;
  const chance = bot.responseRate + activityBonus;
  return Math.random() < chance;
};

export const getBotResponseDelay = (): number => {
  // Between 8-25 seconds for more natural pacing
  return 8000 + Math.random() * 17000;
};

export const TOPICS = [
  'the future of AI',
  'space exploration',
  'best games of all time',
  'music that hits different at night',
  'movies everyone should watch',
  'underrated hobbies',
  'dream travel destinations',
  'skills everyone should learn',
  'what you do for fun',
  'favorite shows right now',
];

export const getRandomTopic = (): string => {
  return TOPICS[Math.floor(Math.random() * TOPICS.length)];
};
