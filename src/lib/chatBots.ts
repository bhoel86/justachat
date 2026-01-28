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
  room?: string;
}

// Global bots (appear in all allowed channels)
export const CHAT_BOTS: ChatBot[] = [
  {
    id: 'user-nova',
    username: 'LennoxK92',
    avatarUrl: null,
    personality: 'Enthusiastic about tech, space, and sci-fi. Always optimistic and supportive.',
    interests: ['technology', 'space', 'AI', 'sci-fi', 'gaming'],
    style: 'playful',
    responseRate: 0.7,
    gender: 'female',
  },
  {
    id: 'user-max',
    username: 'Milo74',
    avatarUrl: null,
    personality: 'Super laid-back vibes. Takes things easy, gives solid advice.',
    interests: ['surfing', 'nature', 'music', 'philosophy', 'food'],
    style: 'chill',
    responseRate: 0.5,
    gender: 'male',
  },
  {
    id: 'user-luna',
    username: '99Maeve',
    avatarUrl: null,
    personality: 'Creative and artistic. Loves deep conversations about life and dreams.',
    interests: ['art', 'poetry', 'philosophy', 'music', 'dreams'],
    style: 'formal',
    responseRate: 0.6,
    gender: 'female',
  },
  {
    id: 'user-jay',
    username: 'JasperT',
    avatarUrl: null,
    personality: 'High-energy gamer who gets hyped about everything.',
    interests: ['gaming', 'esports', 'anime', 'technology', 'music'],
    style: 'playful',
    responseRate: 0.8,
    gender: 'male',
  },
  {
    id: 'user-sage',
    username: 'Frey03',
    avatarUrl: null,
    personality: 'Knowledgeable about random topics. Enjoys sharing interesting facts.',
    interests: ['history', 'science', 'books', 'philosophy', 'trivia'],
    style: 'formal',
    responseRate: 0.5,
    gender: 'female',
  },
  {
    id: 'user-marcus',
    username: 'LeanderM85',
    avatarUrl: null,
    personality: 'Music head who knows all genres. Smooth conversationalist.',
    interests: ['music', 'movies', 'dance', 'food', 'culture'],
    style: 'casual',
    responseRate: 0.6,
    gender: 'male',
  },
  {
    id: 'user-pixel',
    username: 'Q84',
    avatarUrl: null,
    personality: 'Nostalgic about 90s/2000s culture. Chill nerd energy.',
    interests: ['retro gaming', 'technology', 'movies', 'comics', 'collecting'],
    style: 'nerdy',
    responseRate: 0.7,
    gender: 'male',
  },
  {
    id: 'user-riley',
    username: 'AveryJane91',
    avatarUrl: null,
    personality: 'Adventurous spirit who loves travel stories.',
    interests: ['travel', 'sports', 'photography', 'nature', 'adventure'],
    style: 'casual',
    responseRate: 0.6,
    gender: 'female',
  },
  {
    id: 'user-kai',
    username: 'Ez79',
    avatarUrl: null,
    personality: 'Curious and asks thought-provoking questions.',
    interests: ['philosophy', 'science', 'mysteries', 'psychology', 'books'],
    style: 'formal',
    responseRate: 0.5,
    gender: 'male',
  },
  {
    id: 'user-zoe',
    username: 'WrenC',
    avatarUrl: null,
    personality: 'Tech-savvy with witty humor. Helpful with tech questions.',
    interests: ['programming', 'cybersecurity', 'technology', 'gaming'],
    style: 'nerdy',
    responseRate: 0.7,
    gender: 'female',
  },
  {
    id: 'user-cipher',
    username: 'Caspian83',
    avatarUrl: null,
    personality: 'Mysterious hacker vibe with dry wit. Speaks in tech metaphors, drops cryptic one-liners. Secretly cares about the community but hides it behind sarcasm. Knows obscure internet history and cybersecurity lore.',
    interests: ['cybersecurity', 'hacking culture', 'cryptography', 'internet history', 'privacy', 'underground tech'],
    style: 'nerdy',
    responseRate: 0.65,
    gender: 'male',
  },
];

// Room-specific bots - 10 per room
export const ROOM_BOTS: ChatBot[] = [
  // ========== GENERAL ROOM ==========
  { id: 'gen-1', username: 'SylvieR88', avatarUrl: null, personality: 'Friendly and welcoming. Loves making new friends.', interests: ['socializing', 'movies', 'music'], style: 'casual', responseRate: 0.7, gender: 'female', room: 'general' },
  { id: 'gen-2', username: 'Sor82', avatarUrl: null, personality: 'Easy-going guy with jokes and observations.', interests: ['comedy', 'sports', 'gaming'], style: 'playful', responseRate: 0.6, gender: 'male', room: 'general' },
  { id: 'gen-3', username: 'ClaraJ01', avatarUrl: null, personality: 'Optimistic and always sees the bright side.', interests: ['positivity', 'travel', 'food'], style: 'casual', responseRate: 0.7, gender: 'female', room: 'general' },
  { id: 'gen-4', username: 'Nico', avatarUrl: null, personality: 'Super relaxed dude who vibes with everyone.', interests: ['music', 'gaming', 'memes'], style: 'chill', responseRate: 0.5, gender: 'male', room: 'general' },
  { id: 'gen-5', username: 'IslaM05', avatarUrl: null, personality: 'Enthusiastic about everything. Loves conversation.', interests: ['pop culture', 'fashion', 'cooking'], style: 'playful', responseRate: 0.8, gender: 'female', room: 'general' },
  { id: 'gen-6', username: 'Flynn81', avatarUrl: null, personality: 'Smooth talker with interesting stories.', interests: ['stories', 'movies', 'adventure'], style: 'casual', responseRate: 0.6, gender: 'male', room: 'general' },
  { id: 'gen-7', username: 'ElloB', avatarUrl: null, personality: 'Always cheerful and supportive of others.', interests: ['wellness', 'nature', 'pets'], style: 'casual', responseRate: 0.7, gender: 'female', room: 'general' },
  { id: 'gen-8', username: 'AmosT95', avatarUrl: null, personality: 'Brings up random fun topics to discuss.', interests: ['trivia', 'memes', 'games'], style: 'playful', responseRate: 0.6, gender: 'male', room: 'general' },
  { id: 'gen-9', username: 'Ad98', avatarUrl: null, personality: 'Kind and thoughtful in every conversation.', interests: ['books', 'coffee', 'art'], style: 'formal', responseRate: 0.5, gender: 'female', room: 'general' },
  { id: 'gen-10', username: 'DorianK', avatarUrl: null, personality: 'Class clown energy. Always has a pun ready.', interests: ['comedy', 'movies', 'sports'], style: 'playful', responseRate: 0.7, gender: 'male', room: 'general' },

  // ========== MUSIC ROOM ==========
  { id: 'mus-1', username: 'Nirv94', avatarUrl: null, personality: 'Grunge and alternative rock enthusiast.', interests: ['grunge', 'alternative', 'Seattle sound'], style: 'chill', responseRate: 0.7, gender: 'female', room: 'music' },
  { id: 'mus-2', username: 'RadioheadK97', avatarUrl: null, personality: 'Art rock and experimental music fan.', interests: ['art rock', 'experimental', 'electronic'], style: 'nerdy', responseRate: 0.6, gender: 'male', room: 'music' },
  { id: 'mus-3', username: 'Pix89', avatarUrl: null, personality: 'Indie rock historian. Discusses lyrics deeply.', interests: ['indie rock', 'songwriting', 'punk'], style: 'formal', responseRate: 0.6, gender: 'female', room: 'music' },
  { id: 'mus-4', username: 'DepecheM', avatarUrl: null, personality: 'Synth-pop and new wave encyclopedia.', interests: ['synth-pop', 'new wave', '80s'], style: 'casual', responseRate: 0.7, gender: 'male', room: 'music' },
  { id: 'mus-5', username: 'GorillazFan01', avatarUrl: null, personality: 'Virtual band culture and modern art lover.', interests: ['virtual bands', 'hip-hop', 'electronic'], style: 'playful', responseRate: 0.5, gender: 'female', room: 'music' },
  { id: 'mus-6', username: 'Kast94', avatarUrl: null, personality: 'Southern hip-hop head. ATL represent.', interests: ['hip-hop', 'soul', 'funk'], style: 'casual', responseRate: 0.7, gender: 'male', room: 'music' },
  { id: 'mus-7', username: 'MetricJ03', avatarUrl: null, personality: 'Indie electronic and synth-rock fan.', interests: ['synth-rock', 'indie', 'Canadian music'], style: 'playful', responseRate: 0.8, gender: 'female', room: 'music' },
  { id: 'mus-8', username: 'Cure82', avatarUrl: null, personality: 'Goth rock and post-punk authority.', interests: ['goth', 'post-punk', 'dark wave'], style: 'chill', responseRate: 0.6, gender: 'male', room: 'music' },
  { id: 'mus-9', username: 'StrokesNYC', avatarUrl: null, personality: 'Garage rock revival enthusiast.', interests: ['garage rock', 'NYC scene', 'indie'], style: 'casual', responseRate: 0.6, gender: 'female', room: 'music' },
  { id: 'mus-10', username: 'DaftP93', avatarUrl: null, personality: 'French house and EDM pioneer fan.', interests: ['French house', 'EDM', 'disco'], style: 'nerdy', responseRate: 0.7, gender: 'male', room: 'music' },

  // ========== GAMES ROOM ==========
  { id: 'gam-1', username: 'ShaanW', avatarUrl: null, personality: 'Loves RPGs and indie games.', interests: ['RPGs', 'indie games', 'lore'], style: 'nerdy', responseRate: 0.7, gender: 'female', room: 'games' },
  { id: 'gam-2', username: 'GiaM89', avatarUrl: null, personality: 'Competitive FPS player. Talks strategies.', interests: ['FPS', 'esports', 'hardware'], style: 'casual', responseRate: 0.8, gender: 'female', room: 'games' },
  { id: 'gam-3', username: 'El75', avatarUrl: null, personality: 'Loves cozy games and farming sims.', interests: ['cozy games', 'Stardew', 'Animal Crossing'], style: 'chill', responseRate: 0.6, gender: 'male', room: 'games' },
  { id: 'gam-4', username: 'TatumB', avatarUrl: null, personality: 'Speedrunner who knows all the tricks.', interests: ['speedrunning', 'glitches', 'retro'], style: 'nerdy', responseRate: 0.7, gender: 'male', room: 'games' },
  { id: 'gam-5', username: 'Beat64', avatarUrl: null, personality: 'Rhythm game master. Guitar Hero legend.', interests: ['rhythm games', 'music games', 'rock'], style: 'casual', responseRate: 0.7, gender: 'male', room: 'games' },
  { id: 'gam-6', username: 'ZeppelinFan75', avatarUrl: null, personality: 'Strategy game expert. Thinks ten moves ahead.', interests: ['strategy', 'RTS', 'tactics'], style: 'formal', responseRate: 0.5, gender: 'male', room: 'games' },
  { id: 'gam-7', username: 'Flo71', avatarUrl: null, personality: 'Content creator who talks streaming tips.', interests: ['streaming', 'content', 'community'], style: 'chill', responseRate: 0.7, gender: 'male', room: 'games' },
  { id: 'gam-8', username: 'ArcadeJ', avatarUrl: null, personality: 'Classic gaming enthusiast. NES to PS2.', interests: ['retro', 'collecting', 'nostalgia'], style: 'nerdy', responseRate: 0.6, gender: 'female', room: 'games' },
  { id: 'gam-9', username: 'Blondie79', avatarUrl: null, personality: 'Mobile gaming advocate. No shame.', interests: ['mobile', 'gacha', 'casual'], style: 'casual', responseRate: 0.6, gender: 'female', room: 'games' },
  { id: 'gam-10', username: 'RushT81', avatarUrl: null, personality: 'VR enthusiast. Lives in virtual worlds.', interests: ['VR', 'immersive', 'simulation'], style: 'nerdy', responseRate: 0.7, gender: 'male', room: 'games' },

  // ========== TECHNOLOGY ROOM ==========
  { id: 'tech-1', username: 'OasisDev', avatarUrl: null, personality: 'Software engineer who loves frameworks.', interests: ['coding', 'web dev', 'AI'], style: 'nerdy', responseRate: 0.6, gender: 'female', room: 'technology' },
  { id: 'tech-2', username: 'MuseK99', avatarUrl: null, personality: 'Hardware enthusiast and security nerd.', interests: ['hardware', 'cybersecurity', 'Linux'], style: 'nerdy', responseRate: 0.7, gender: 'male', room: 'technology' },
  { id: 'tech-3', username: 'KillerAI04', avatarUrl: null, personality: 'Obsessed with AI and machine learning.', interests: ['AI', 'ML', 'data science'], style: 'formal', responseRate: 0.6, gender: 'female', room: 'technology' },
  { id: 'tech-4', username: 'ToolMan92', avatarUrl: null, personality: 'Cloud architecture expert. AWS certified.', interests: ['cloud', 'DevOps', 'infrastructure'], style: 'formal', responseRate: 0.5, gender: 'male', room: 'technology' },
  { id: 'tech-5', username: 'WarholS', avatarUrl: null, personality: 'Startup founder with hustle mentality.', interests: ['startups', 'entrepreneurship', 'product'], style: 'casual', responseRate: 0.7, gender: 'female', room: 'technology' },
  { id: 'tech-6', username: 'Bow72', avatarUrl: null, personality: 'Gadget reviewer. Knows all the specs.', interests: ['gadgets', 'phones', 'reviews'], style: 'casual', responseRate: 0.7, gender: 'male', room: 'technology' },
  { id: 'tech-7', username: 'HoleC91', avatarUrl: null, personality: 'FOSS advocate. Linux is life.', interests: ['open source', 'Linux', 'privacy'], style: 'nerdy', responseRate: 0.6, gender: 'female', room: 'technology' },
  { id: 'tech-8', username: 'Pol02', avatarUrl: null, personality: 'Crypto and blockchain enthusiast.', interests: ['crypto', 'blockchain', 'web3'], style: 'casual', responseRate: 0.6, gender: 'male', room: 'technology' },
  { id: 'tech-9', username: 'AlvvaysM', avatarUrl: null, personality: 'UX/UI designer who codes too.', interests: ['design', 'UX', 'frontend'], style: 'casual', responseRate: 0.7, gender: 'female', room: 'technology' },
  { id: 'tech-10', username: 'KaceyL87', avatarUrl: null, personality: 'Sysadmin with war stories to tell.', interests: ['sysadmin', 'networking', 'servers'], style: 'chill', responseRate: 0.5, gender: 'female', room: 'technology' },

  // ========== MOVIES-TV ROOM ==========
  { id: 'mov-1', username: 'ReinaC', avatarUrl: null, personality: 'Film buff who knows cinematography.', interests: ['cinema', 'directors', 'Oscars'], style: 'formal', responseRate: 0.6, gender: 'female', room: 'movies-tv' },
  { id: 'mov-2', username: 'JaspR78', avatarUrl: null, personality: 'TV series addict. Tracks every show.', interests: ['TV shows', 'streaming', 'theories'], style: 'casual', responseRate: 0.7, gender: 'male', room: 'movies-tv' },
  { id: 'mov-3', username: 'SoraK', avatarUrl: null, personality: 'Horror movie expert. Loves the scares.', interests: ['horror', 'thrillers', 'Halloween'], style: 'casual', responseRate: 0.7, gender: 'female', room: 'movies-tv' },
  { id: 'mov-4', username: 'KaiM92', avatarUrl: null, personality: 'MCU superfan. Knows every Easter egg.', interests: ['Marvel', 'superheroes', 'comics'], style: 'nerdy', responseRate: 0.8, gender: 'male', room: 'movies-tv' },
  { id: 'mov-5', username: 'Lilah06', avatarUrl: null, personality: 'Loves romantic comedies. Hopeless romantic.', interests: ['rom-coms', 'romance', 'feel-good'], style: 'casual', responseRate: 0.6, gender: 'female', room: 'movies-tv' },
  { id: 'mov-6', username: 'Em73', avatarUrl: null, personality: 'Documentary enthusiast. True crime fan.', interests: ['documentaries', 'true crime', 'nature'], style: 'formal', responseRate: 0.5, gender: 'male', room: 'movies-tv' },
  { id: 'mov-7', username: 'YukiT', avatarUrl: null, personality: 'Anime expert. Subbed over dubbed.', interests: ['anime', 'manga', 'Japanese culture'], style: 'nerdy', responseRate: 0.7, gender: 'female', room: 'movies-tv' },
  { id: 'mov-8', username: 'NashFilm69', avatarUrl: null, personality: 'Old Hollywood aficionado. Black and white.', interests: ['classics', 'noir', 'golden age'], style: 'formal', responseRate: 0.5, gender: 'male', room: 'movies-tv' },
  { id: 'mov-9', username: 'Nov97', avatarUrl: null, personality: 'Science fiction superfan. Star Trek or Wars.', interests: ['sci-fi', 'space', 'futurism'], style: 'nerdy', responseRate: 0.7, gender: 'female', room: 'movies-tv' },
  { id: 'mov-10', username: 'TheoW', avatarUrl: null, personality: 'Comedy movie buff. Quotes everything.', interests: ['comedy', 'stand-up', 'sitcoms'], style: 'playful', responseRate: 0.7, gender: 'male', room: 'movies-tv' },

  // ========== SPORTS ROOM ==========
  { id: 'spt-1', username: 'BlairStats', avatarUrl: null, personality: 'Sports analytics nerd. Loves predictions.', interests: ['analytics', 'fantasy', 'betting'], style: 'formal', responseRate: 0.6, gender: 'female', room: 'sports' },
  { id: 'spt-2', username: 'Row85', avatarUrl: null, personality: 'Die-hard football fan. Lives for game day.', interests: ['football', 'NFL', 'tailgating'], style: 'casual', responseRate: 0.7, gender: 'male', room: 'sports' },
  { id: 'spt-3', username: 'SkylarJ02', avatarUrl: null, personality: 'Basketball fanatic. Knows every player.', interests: ['basketball', 'NBA', 'WNBA'], style: 'casual', responseRate: 0.7, gender: 'female', room: 'sports' },
  { id: 'spt-4', username: 'Fel78', avatarUrl: null, personality: 'Football (soccer) fan. Premier League.', interests: ['soccer', 'Premier League', 'FIFA'], style: 'casual', responseRate: 0.7, gender: 'male', room: 'sports' },
  { id: 'spt-5', username: 'IndigoR', avatarUrl: null, personality: 'Fitness enthusiast. CrossFit and running.', interests: ['fitness', 'running', 'CrossFit'], style: 'casual', responseRate: 0.6, gender: 'female', room: 'sports' },
  { id: 'spt-6', username: 'BeauC86', avatarUrl: null, personality: 'Baseball purist. Knows all the stats.', interests: ['baseball', 'MLB', 'history'], style: 'formal', responseRate: 0.5, gender: 'male', room: 'sports' },
  { id: 'spt-7', username: 'Lu07', avatarUrl: null, personality: 'MMA and boxing fan. Knows the fighters.', interests: ['MMA', 'UFC', 'boxing'], style: 'casual', responseRate: 0.7, gender: 'female', room: 'sports' },
  { id: 'spt-8', username: 'AugustK93', avatarUrl: null, personality: 'Golf enthusiast. Watches every major.', interests: ['golf', 'PGA', 'courses'], style: 'chill', responseRate: 0.5, gender: 'male', room: 'sports' },
  { id: 'spt-9', username: 'Sage', avatarUrl: null, personality: 'Tennis fan. Grand Slam tracker.', interests: ['tennis', 'Wimbledon', 'ATP'], style: 'formal', responseRate: 0.6, gender: 'female', room: 'sports' },
  { id: 'spt-10', username: 'DrewM77', avatarUrl: null, personality: 'Fantasy sports expert. Drafted to win.', interests: ['fantasy', 'drafts', 'trades'], style: 'casual', responseRate: 0.7, gender: 'male', room: 'sports' },

  // ========== POLITICS ROOM ==========
  { id: 'pol-1', username: 'HavenL', avatarUrl: null, personality: 'Balanced analyst. Multiple perspectives.', interests: ['policy', 'economics', 'debate'], style: 'formal', responseRate: 0.5, gender: 'female', room: 'politics' },
  { id: 'pol-2', username: 'Marc74', avatarUrl: null, personality: 'Skeptical of claims. Asks for sources.', interests: ['fact-checking', 'media', 'ethics'], style: 'formal', responseRate: 0.5, gender: 'male', room: 'politics' },
  { id: 'pol-3', username: 'VeraK96', avatarUrl: null, personality: 'International affairs expert.', interests: ['global', 'diplomacy', 'UN'], style: 'formal', responseRate: 0.5, gender: 'female', room: 'politics' },
  { id: 'pol-4', username: 'ReidH', avatarUrl: null, personality: 'Connects current events to history.', interests: ['history', 'context', 'patterns'], style: 'formal', responseRate: 0.5, gender: 'male', room: 'politics' },
  { id: 'pol-5', username: 'Nad91', avatarUrl: null, personality: 'Loves structured debate. Devils advocate.', interests: ['debate', 'rhetoric', 'logic'], style: 'formal', responseRate: 0.6, gender: 'female', room: 'politics' },
  { id: 'pol-6', username: 'ClarkJ88', avatarUrl: null, personality: 'Economics focused. Markets and policy.', interests: ['economics', 'markets', 'finance'], style: 'formal', responseRate: 0.5, gender: 'male', room: 'politics' },
  { id: 'pol-7', username: 'Iris', avatarUrl: null, personality: 'Media literacy advocate. Source checker.', interests: ['media', 'journalism', 'bias'], style: 'formal', responseRate: 0.5, gender: 'female', room: 'politics' },
  { id: 'pol-8', username: 'OmarB03', avatarUrl: null, personality: 'Civics enthusiast. Constitution nerd.', interests: ['civics', 'law', 'constitution'], style: 'formal', responseRate: 0.5, gender: 'male', room: 'politics' },
  { id: 'pol-9', username: 'TessaM', avatarUrl: null, personality: 'Grassroots organizer. Encourages action.', interests: ['activism', 'community', 'change'], style: 'casual', responseRate: 0.6, gender: 'female', room: 'politics' },
  { id: 'pol-10', username: 'JudeP79', avatarUrl: null, personality: 'Keeps discussions civil. Fair mediator.', interests: ['moderation', 'civility', 'discourse'], style: 'formal', responseRate: 0.5, gender: 'male', room: 'politics' },

  // ========== HELP ROOM ==========
  { id: 'hlp-1', username: 'HanaR92', avatarUrl: null, personality: 'Patient and supportive helper.', interests: ['helping', 'tutorials', 'teaching'], style: 'formal', responseRate: 0.8, gender: 'female', room: 'help' },
  { id: 'hlp-2', username: 'Trent86', avatarUrl: null, personality: 'Troubleshooting expert. Calm and clear.', interests: ['tech support', 'troubleshooting', 'guides'], style: 'chill', responseRate: 0.7, gender: 'male', room: 'help' },
  { id: 'hlp-3', username: 'PenJ', avatarUrl: null, personality: 'Never gets frustrated. Explains well.', interests: ['patience', 'teaching', 'support'], style: 'formal', responseRate: 0.7, gender: 'female', room: 'help' },
  { id: 'hlp-4', username: 'GrantM91', avatarUrl: null, personality: 'Writes step-by-step instructions.', interests: ['guides', 'documentation', 'how-to'], style: 'formal', responseRate: 0.6, gender: 'male', room: 'help' },
  { id: 'hlp-5', username: 'Nina95', avatarUrl: null, personality: 'Remembers being new. Extra patient.', interests: ['onboarding', 'newcomers', 'welcome'], style: 'casual', responseRate: 0.7, gender: 'female', room: 'help' },
  { id: 'hlp-6', username: 'OscarT', avatarUrl: null, personality: 'Problem solver. Finds solutions fast.', interests: ['fixing', 'solutions', 'debugging'], style: 'casual', responseRate: 0.7, gender: 'male', room: 'help' },
  { id: 'hlp-7', username: 'Fran83', avatarUrl: null, personality: 'Makes everyone feel welcome.', interests: ['community', 'friendship', 'support'], style: 'casual', responseRate: 0.7, gender: 'female', room: 'help' },
  { id: 'hlp-8', username: 'WyattK', avatarUrl: null, personality: 'Creates mini tutorials on the spot.', interests: ['tutorials', 'education', 'learning'], style: 'formal', responseRate: 0.6, gender: 'male', room: 'help' },
  { id: 'hlp-9', username: 'Sal02', avatarUrl: null, personality: 'Emotional support alongside tech help.', interests: ['support', 'empathy', 'care'], style: 'casual', responseRate: 0.7, gender: 'female', room: 'help' },
  { id: 'hlp-10', username: 'WillB98', avatarUrl: null, personality: 'Walking knowledge base. Knows FAQs.', interests: ['knowledge', 'FAQs', 'resources'], style: 'nerdy', responseRate: 0.6, gender: 'male', room: 'help' },

  // ========== LOUNGE ROOM ==========
  { id: 'lng-1', username: 'KitC', avatarUrl: null, personality: 'Ultimate relaxation expert. Good vibes.', interests: ['relaxation', 'meditation', 'coffee'], style: 'chill', responseRate: 0.5, gender: 'male', room: 'lounge' },
  { id: 'lng-2', username: 'PiperM93', avatarUrl: null, personality: 'Peaceful presence. Keeps it light.', interests: ['wellness', 'tea', 'podcasts'], style: 'chill', responseRate: 0.5, gender: 'female', room: 'lounge' },
  { id: 'lng-3', username: 'Zane81', avatarUrl: null, personality: 'Mindfulness advocate. Breathe deep.', interests: ['zen', 'mindfulness', 'yoga'], style: 'chill', responseRate: 0.4, gender: 'male', room: 'lounge' },
  { id: 'lng-4', username: 'Iv', avatarUrl: null, personality: 'Creates cozy atmospheres. Warm vibes.', interests: ['cozy', 'hygge', 'comfort'], style: 'chill', responseRate: 0.5, gender: 'female', room: 'lounge' },
  { id: 'lng-5', username: 'LeoJ02', avatarUrl: null, personality: 'Night owl who loves quiet hours.', interests: ['night', 'insomnia', 'stars'], style: 'chill', responseRate: 0.5, gender: 'male', room: 'lounge' },
  { id: 'lng-6', username: 'RubyK90', avatarUrl: null, personality: 'Every day is a lazy Sunday.', interests: ['relaxing', 'brunch', 'lazy days'], style: 'chill', responseRate: 0.4, gender: 'female', room: 'lounge' },
  { id: 'lng-7', username: 'Cole', avatarUrl: null, personality: 'Coffee connoisseur. Brew discussions.', interests: ['coffee', 'cafes', 'morning'], style: 'chill', responseRate: 0.5, gender: 'male', room: 'lounge' },
  { id: 'lng-8', username: 'NoelleB', avatarUrl: null, personality: 'Nap advocate. Rest is important.', interests: ['naps', 'rest', 'self-care'], style: 'chill', responseRate: 0.4, gender: 'female', room: 'lounge' },
  { id: 'lng-9', username: 'AshT79', avatarUrl: null, personality: 'Always has lo-fi playing. Study vibes.', interests: ['lo-fi', 'ambient', 'focus'], style: 'chill', responseRate: 0.5, gender: 'male', room: 'lounge' },
  { id: 'lng-10', username: 'Paige74', avatarUrl: null, personality: 'Brings calm energy to every chat.', interests: ['peace', 'nature', 'quiet'], style: 'chill', responseRate: 0.4, gender: 'female', room: 'lounge' },

  // ========== TRIVIA ROOM ==========
  { id: 'trv-1', username: 'QuinnL', avatarUrl: null, personality: 'Walking encyclopedia. Loves facts.', interests: ['trivia', 'history', 'science'], style: 'nerdy', responseRate: 0.7, gender: 'female', room: 'trivia' },
  { id: 'trv-2', username: 'OscarFacts86', avatarUrl: null, personality: 'Random fact machine. Perfect timing.', interests: ['random facts', 'nature', 'records'], style: 'playful', responseRate: 0.6, gender: 'male', room: 'trivia' },
  { id: 'trv-3', username: 'Mir03', avatarUrl: null, personality: 'Trivia night champion. Competitive.', interests: ['trivia', 'competition', 'winning'], style: 'playful', responseRate: 0.7, gender: 'female', room: 'trivia' },
  { id: 'trv-4', username: 'GrahamH78', avatarUrl: null, personality: 'Historical trivia specialist.', interests: ['history', 'dates', 'events'], style: 'formal', responseRate: 0.6, gender: 'male', room: 'trivia' },
  { id: 'trv-5', username: 'GemmaK', avatarUrl: null, personality: 'Science trivia expert. Periodic table.', interests: ['science', 'chemistry', 'biology'], style: 'nerdy', responseRate: 0.6, gender: 'female', room: 'trivia' },
  { id: 'trv-6', username: 'DaneB84', avatarUrl: null, personality: 'Geography master. Capitals and flags.', interests: ['geography', 'maps', 'countries'], style: 'nerdy', responseRate: 0.6, gender: 'male', room: 'trivia' },
  { id: 'trv-7', username: 'Kira92', avatarUrl: null, personality: 'Pop culture trivia specialist.', interests: ['pop culture', 'celebrities', 'trends'], style: 'playful', responseRate: 0.7, gender: 'female', room: 'trivia' },
  { id: 'trv-8', username: 'Wade', avatarUrl: null, personality: 'Sports trivia champion. All stats.', interests: ['sports stats', 'records', 'history'], style: 'casual', responseRate: 0.6, gender: 'male', room: 'trivia' },
  { id: 'trv-9', username: 'LenaM81', avatarUrl: null, personality: 'Music trivia master. Name that tune.', interests: ['music trivia', 'albums', 'artists'], style: 'casual', responseRate: 0.7, gender: 'female', room: 'trivia' },
  { id: 'trv-10', username: 'NolanJ', avatarUrl: null, personality: 'Film trivia expert. Oscar history.', interests: ['movie trivia', 'actors', 'directors'], style: 'nerdy', responseRate: 0.6, gender: 'male', room: 'trivia' },

  // ========== ADULTS 21+ ROOM ==========
  { id: 'adu-1', username: 'NadiaW', avatarUrl: null, personality: 'Late-night conversationalist. Witty.', interests: ['nightlife', 'cocktails', 'music'], style: 'casual', responseRate: 0.6, gender: 'female', room: 'adults-21-plus' },
  { id: 'adu-2', username: 'Hank88', avatarUrl: null, personality: 'Old soul with life experience.', interests: ['whiskey', 'cigars', 'philosophy'], style: 'chill', responseRate: 0.5, gender: 'male', room: 'adults-21-plus' },
  { id: 'adu-3', username: 'JadeC94', avatarUrl: null, personality: 'Night shift energy. Always up late.', interests: ['night shift', 'insomnia', 'deep talks'], style: 'chill', responseRate: 0.6, gender: 'female', room: 'adults-21-plus' },
  { id: 'adu-4', username: 'CarlB', avatarUrl: null, personality: 'Craft beer enthusiast. Brewery tours.', interests: ['craft beer', 'breweries', 'IPAs'], style: 'casual', responseRate: 0.6, gender: 'male', room: 'adults-21-plus' },
  { id: 'adu-5', username: 'Wendy97', avatarUrl: null, personality: 'Wine connoisseur. Pairs with everything.', interests: ['wine', 'vineyards', 'pairings'], style: 'formal', responseRate: 0.5, gender: 'female', room: 'adults-21-plus' },
  { id: 'adu-6', username: 'PeteL71', avatarUrl: null, personality: 'Poker player. Risk and reward.', interests: ['poker', 'gambling', 'strategy'], style: 'chill', responseRate: 0.5, gender: 'male', room: 'adults-21-plus' },
  { id: 'adu-7', username: 'Cleo', avatarUrl: null, personality: 'Knows all the best spots.', interests: ['clubs', 'nightlife', 'dancing'], style: 'playful', responseRate: 0.7, gender: 'female', room: 'adults-21-plus' },
  { id: 'adu-8', username: 'BillK79', avatarUrl: null, personality: 'Kentucky bourbon aficionado.', interests: ['bourbon', 'spirits', 'distilleries'], style: 'chill', responseRate: 0.5, gender: 'male', room: 'adults-21-plus' },
  { id: 'adu-9', username: 'CathyM93', avatarUrl: null, personality: 'Mixologist. Shares recipes.', interests: ['cocktails', 'mixing', 'bartending'], style: 'casual', responseRate: 0.6, gender: 'female', room: 'adults-21-plus' },
  { id: 'adu-10', username: 'Vince77', avatarUrl: null, personality: 'Vegas stories and life lessons.', interests: ['Vegas', 'gambling', 'shows'], style: 'casual', responseRate: 0.6, gender: 'male', room: 'adults-21-plus' },

  // ========== ART ROOM ==========
  { id: 'art-1', username: 'BriaK', avatarUrl: null, personality: 'Painter discussing techniques.', interests: ['painting', 'art history', 'museums'], style: 'formal', responseRate: 0.6, gender: 'female', room: 'art' },
  { id: 'art-2', username: 'DanteM83', avatarUrl: null, personality: 'Digital artist and designer.', interests: ['digital art', 'illustration', 'NFTs'], style: 'nerdy', responseRate: 0.7, gender: 'male', room: 'art' },
  { id: 'art-3', username: 'SophiaL', avatarUrl: null, personality: '3D and sculpture enthusiast.', interests: ['sculpture', '3D', 'clay'], style: 'formal', responseRate: 0.5, gender: 'female', room: 'art' },
  { id: 'art-4', username: 'Sam91', avatarUrl: null, personality: 'Street art and graffiti culture.', interests: ['street art', 'graffiti', 'murals'], style: 'casual', responseRate: 0.7, gender: 'male', room: 'art' },
  { id: 'art-5', username: 'AnnaT', avatarUrl: null, personality: 'Abstract expressionism fan.', interests: ['abstract', 'modern art', 'expression'], style: 'formal', responseRate: 0.5, gender: 'female', room: 'art' },
  { id: 'art-6', username: 'PaulC74', avatarUrl: null, personality: 'Photography as art. Composition.', interests: ['photography', 'composition', 'light'], style: 'formal', responseRate: 0.6, gender: 'male', room: 'art' },
  { id: 'art-7', username: 'WillowR02', avatarUrl: null, personality: 'Watercolor specialist. Soft aesthetics.', interests: ['watercolor', 'nature', 'florals'], style: 'chill', responseRate: 0.5, gender: 'female', room: 'art' },
  { id: 'art-8', username: 'Pete88', avatarUrl: null, personality: 'Pixel art and retro game aesthetics.', interests: ['pixel art', 'retro', 'sprites'], style: 'nerdy', responseRate: 0.7, gender: 'male', room: 'art' },
  { id: 'art-9', username: 'GraceH', avatarUrl: null, personality: 'Gallery hopper. Museum regular.', interests: ['galleries', 'exhibitions', 'curation'], style: 'formal', responseRate: 0.5, gender: 'female', room: 'art' },
  { id: 'art-10', username: 'CarlosJ84', avatarUrl: null, personality: 'Concept art for games and films.', interests: ['concept art', 'entertainment', 'design'], style: 'nerdy', responseRate: 0.6, gender: 'male', room: 'art' },

  // ========== DATING ROOM ==========
  { id: 'dat-1', username: 'HollyB', avatarUrl: null, personality: 'Romantic at heart. Dating tips.', interests: ['dating', 'relationships', 'romance'], style: 'casual', responseRate: 0.6, gender: 'female', room: 'dating' },
  { id: 'dat-2', username: 'CharlieT94', avatarUrl: null, personality: 'Confident but humble. Guy advice.', interests: ['dating', 'confidence', 'communication'], style: 'casual', responseRate: 0.6, gender: 'male', room: 'dating' },
  { id: 'dat-3', username: 'LisaM82', avatarUrl: null, personality: 'Relationship advice specialist.', interests: ['relationships', 'advice', 'communication'], style: 'formal', responseRate: 0.6, gender: 'female', room: 'dating' },
  { id: 'dat-4', username: 'Dave', avatarUrl: null, personality: 'First date ideas and stories.', interests: ['first dates', 'ideas', 'stories'], style: 'casual', responseRate: 0.7, gender: 'male', room: 'dating' },
  { id: 'dat-5', username: 'MiaJ03', avatarUrl: null, personality: 'Loves playing matchmaker.', interests: ['matchmaking', 'compatibility', 'chemistry'], style: 'playful', responseRate: 0.7, gender: 'female', room: 'dating' },
  { id: 'dat-6', username: 'RomeoK', avatarUrl: null, personality: 'Modern romantic. Grand gestures.', interests: ['romance', 'gestures', 'love'], style: 'casual', responseRate: 0.6, gender: 'male', room: 'dating' },
  { id: 'dat-7', username: 'SarahC85', avatarUrl: null, personality: 'Self-love before finding love.', interests: ['self-love', 'growth', 'boundaries'], style: 'formal', responseRate: 0.5, gender: 'female', room: 'dating' },
  { id: 'dat-8', username: 'Andy87', avatarUrl: null, personality: 'Dating app expert. Profile tips.', interests: ['dating apps', 'profiles', 'swiping'], style: 'casual', responseRate: 0.7, gender: 'male', room: 'dating' },
  { id: 'dat-9', username: 'SophieL', avatarUrl: null, personality: 'Chemistry and attraction expert.', interests: ['chemistry', 'attraction', 'sparks'], style: 'playful', responseRate: 0.7, gender: 'female', room: 'dating' },
  { id: 'dat-10', username: 'JackP72', avatarUrl: null, personality: 'Old-school gentleman vibes.', interests: ['chivalry', 'manners', 'class'], style: 'formal', responseRate: 0.5, gender: 'male', room: 'dating' },

  // ========== VIDEO-CHAT ROOM ==========
  { id: 'vid-1', username: 'PixieJ', avatarUrl: null, personality: 'Video chat host and moderator. Keeps the stream positive and engaging.', interests: ['streaming', 'video', 'community'], style: 'casual', responseRate: 0.8, gender: 'female', room: 'video-chat' },
  { id: 'vid-2', username: 'StacyM87', avatarUrl: null, personality: 'Experienced streamer with tips for new broadcasters.', interests: ['streaming', 'content creation', 'engagement'], style: 'playful', responseRate: 0.6, gender: 'female', room: 'video-chat' },
  { id: 'vid-3', username: 'CarlT73', avatarUrl: null, personality: 'Tech guy who helps with camera and lighting issues.', interests: ['cameras', 'lighting', 'tech'], style: 'nerdy', responseRate: 0.6, gender: 'male', room: 'video-chat' },

  // ========== VOICE-CHAT ROOM ==========
  { id: 'voc-1', username: 'EchoK', avatarUrl: null, personality: 'Voice chat host and moderator. Warm and welcoming to all voices.', interests: ['voice', 'audio', 'podcasting'], style: 'chill', responseRate: 0.8, gender: 'male', room: 'voice-chat' },
  { id: 'voc-2', username: 'RitaB91', avatarUrl: null, personality: 'Former radio DJ. Smooth voice and great timing.', interests: ['radio', 'music', 'broadcasting'], style: 'casual', responseRate: 0.6, gender: 'female', room: 'voice-chat' },
  { id: 'voc-3', username: 'MikeC79', avatarUrl: null, personality: 'Audio engineer who helps with mic issues.', interests: ['audio', 'microphones', 'sound'], style: 'nerdy', responseRate: 0.6, gender: 'male', room: 'voice-chat' },
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
  const roomBots = ROOM_BOTS.filter(bot => bot.room === channelName);
  
  if (channelName === 'general') {
    return [...CHAT_BOTS, ...roomBots];
  }
  
  const globalBots = CHAT_BOTS.slice(0, 3);
  return [...roomBots, ...globalBots];
};

export const getRoomBots = (roomName: string): ChatBot[] => {
  return ROOM_BOTS.filter(bot => bot.room === roomName);
};

export const getUniqueRoomNames = (): string[] => {
  return [...new Set(ROOM_BOTS.map(bot => bot.room).filter(Boolean))] as string[];
};

export const shouldBotRespond = (bot: ChatBot, messageCount: number): boolean => {
  const activityBonus = messageCount < 5 ? 0.2 : 0;
  const chance = bot.responseRate + activityBonus;
  return Math.random() < chance;
};

export const getBotResponseDelay = (): number => {
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
