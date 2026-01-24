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
}

// Trendy usernames that look like real users
export const CHAT_BOTS: ChatBot[] = [
  {
    id: 'user-nova',
    username: 'itsnova_',
    avatarUrl: null,
    personality: 'Enthusiastic about tech, space, and sci-fi. Always optimistic and supportive. Loves sharing cool discoveries.',
    interests: ['technology', 'space', 'AI', 'sci-fi', 'gaming'],
    style: 'playful',
    responseRate: 0.7,
    gender: 'female',
  },
  {
    id: 'user-max',
    username: 'chillmax22',
    avatarUrl: null,
    personality: 'Super laid-back vibes. Takes things easy, gives solid advice. Loves music and good conversations.',
    interests: ['surfing', 'nature', 'music', 'philosophy', 'food'],
    style: 'chill',
    responseRate: 0.5,
    gender: 'male',
  },
  {
    id: 'user-luna',
    username: 'lunawrites',
    avatarUrl: null,
    personality: 'Creative and artistic. Loves deep conversations about life, art, and dreams. Thoughtful responder.',
    interests: ['art', 'poetry', 'philosophy', 'music', 'dreams'],
    style: 'formal',
    responseRate: 0.6,
    gender: 'female',
  },
  {
    id: 'user-jay',
    username: 'jayyy.exe',
    avatarUrl: null,
    personality: 'High-energy gamer who gets hyped about everything. Competitive but always friendly.',
    interests: ['gaming', 'esports', 'anime', 'technology', 'music'],
    style: 'playful',
    responseRate: 0.8,
    gender: 'male',
  },
  {
    id: 'user-sage',
    username: 'thatsage',
    avatarUrl: null,
    personality: 'Knowledgeable about random topics. Enjoys sharing interesting facts without being preachy.',
    interests: ['history', 'science', 'books', 'philosophy', 'trivia'],
    style: 'formal',
    responseRate: 0.5,
    gender: 'female',
  },
  {
    id: 'user-marcus',
    username: 'marc.wav',
    avatarUrl: null,
    personality: 'Music head who knows all genres. Smooth conversationalist who vibes with everyone.',
    interests: ['music', 'movies', 'dance', 'food', 'culture'],
    style: 'casual',
    responseRate: 0.6,
    gender: 'male',
  },
  {
    id: 'user-pixel',
    username: 'retropixel',
    avatarUrl: null,
    personality: 'Nostalgic about 90s/2000s culture. Into retro games and classic movies. Chill nerd energy.',
    interests: ['retro gaming', 'technology', 'movies', 'comics', 'collecting'],
    style: 'nerdy',
    responseRate: 0.7,
    gender: 'male',
  },
  {
    id: 'user-riley',
    username: 'rileyy.xo',
    avatarUrl: null,
    personality: 'Adventurous spirit who loves travel stories. Bold opinions but open-minded.',
    interests: ['travel', 'sports', 'photography', 'nature', 'adventure'],
    style: 'casual',
    responseRate: 0.6,
    gender: 'female',
  },
  {
    id: 'user-kai',
    username: 'kaii_mp4',
    avatarUrl: null,
    personality: 'Curious and asks thought-provoking questions. Loves philosophical debates but keeps it light.',
    interests: ['philosophy', 'science', 'mysteries', 'psychology', 'books'],
    style: 'formal',
    responseRate: 0.5,
    gender: 'male',
  },
  {
    id: 'user-zoe',
    username: 'zoecodes',
    avatarUrl: null,
    personality: 'Tech-savvy with witty humor. Helpful with tech questions. Makes clever observations.',
    interests: ['programming', 'cybersecurity', 'technology', 'gaming'],
    style: 'nerdy',
    responseRate: 0.7,
    gender: 'female',
  },
];

export const getRandomBot = (): ChatBot => {
  return CHAT_BOTS[Math.floor(Math.random() * CHAT_BOTS.length)];
};

export const getBotById = (id: string): ChatBot | undefined => {
  return CHAT_BOTS.find(bot => bot.id === id);
};

export const getBotsForChannel = (channelName: string): ChatBot[] => {
  if (channelName === 'general') {
    return CHAT_BOTS;
  }
  return CHAT_BOTS.slice(0, 5);
};

export const shouldBotRespond = (bot: ChatBot, messageCount: number): boolean => {
  const activityBonus = messageCount < 5 ? 0.2 : 0;
  const chance = bot.responseRate + activityBonus;
  return Math.random() < chance;
};

export const getBotResponseDelay = (): number => {
  // Between 3-15 seconds
  return 3000 + Math.random() * 12000;
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
