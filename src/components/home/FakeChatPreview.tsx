import { useState, useEffect, useRef, useMemo } from "react";
import UserAvatar from "@/components/avatar/UserAvatar";
import { Shield, Crown } from "lucide-react";

interface FakeMessage {
  id: number;
  username: string;
  message: string;
  timestamp: Date;
  isReply?: boolean;
  replyTo?: string;
}

interface FakeUser {
  username: string;
  isAdmin?: boolean;
  isOwner?: boolean;
  avatarSeed: string;
}

// Pool of fake users with avatar seeds
const FAKE_USERS: FakeUser[] = [
  { username: "JustaChatBot", isOwner: true, avatarSeed: "bot-official" },
  { username: "ModeratorMax", isAdmin: true, avatarSeed: "mod-max" },
  { username: "CoolCat92", avatarSeed: "coolcat" },
  { username: "NightOwl", avatarSeed: "nightowl" },
  { username: "SunnyDaze", avatarSeed: "sunny" },
  { username: "TechWiz", avatarSeed: "techwiz" },
  { username: "MoonRider", avatarSeed: "moonrider" },
  { username: "StarGazer", avatarSeed: "stargazer" },
  { username: "BlueSky", avatarSeed: "bluesky" },
  { username: "RedPanda", avatarSeed: "redpanda" },
  { username: "GreenLeaf", avatarSeed: "greenleaf" },
  { username: "PurpleRain", avatarSeed: "purplerain" },
  { username: "GoldenEagle", avatarSeed: "goldeneagle" },
  { username: "SilverFox", avatarSeed: "silverfox" },
  { username: "CryptoKing", avatarSeed: "cryptoking" },
  { username: "GameMaster", avatarSeed: "gamemaster" },
  { username: "MusicLover", avatarSeed: "musiclover" },
  { username: "BookWorm", avatarSeed: "bookworm" },
  { username: "CoffeeBean", avatarSeed: "coffeebean" },
  { username: "PizzaFan", avatarSeed: "pizzafan" },
  { username: "ChillVibes", avatarSeed: "chillvibes" },
  { username: "HappyCamper", avatarSeed: "happycamper" },
];

// Conversation pairs for realistic back-and-forth
const CONVERSATIONS = [
  { starter: "hey everyone!", replies: ["hey!", "what's up?", "yo!"] },
  { starter: "anyone here play games?", replies: ["yeah! what do you play?", "I'm a gamer too", "depends on the game lol"] },
  { starter: "this place is pretty cool", replies: ["right? I love it here", "agreed!", "welcome!"] },
  { starter: "what's everyone up to?", replies: ["just chilling", "nothing much hbu?", "working lol"] },
  { starter: "music recommendations anyone?", replies: ["what genre?", "I got you!", "depends on your mood"] },
  { starter: "good morning!", replies: ["morning!", "gm!", "hey good morning!"] },
  { starter: "who's watching the game?", replies: ["which one?", "me!", "what game?"] },
  { starter: "just finished work", replies: ["nice! relax time", "same here", "congrats!"] },
  { starter: "weekend plans?", replies: ["sleeping lol", "nothing yet", "maybe going out"] },
  { starter: "how's everyone doing?", replies: ["great!", "pretty good", "can't complain"] },
];

// Standalone messages
const STANDALONE_MESSAGES = [
  "lol nice", "haha", "facts", "true that", "mood", "same",
  "exactly", "yup", "brb", "back", "gotta go soon", "have a good one",
  "catch you later", "for real", "totally", "sounds fun",
];

// Welcome messages
const WELCOME_MESSAGES = [
  "Welcome to #General! Feel free to chat.",
  "Hey there! Jump into the conversation!",
  "Welcome! This is the main hangout spot.",
  "Glad you're here! Say hi!",
];

// Generate avatar URL using DiceBear
const getAvatarUrl = (seed: string) => 
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=transparent`;

// Shuffle array helper
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const FakeChatPreview = () => {
  const [messages, setMessages] = useState<FakeMessage[]>([]);
  const [usedConversations, setUsedConversations] = useState<Set<number>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageIdRef = useRef(0);
  
  // Randomize initial scroll position and welcome message per session
  const sessionSeed = useMemo(() => Math.random(), []);
  const welcomeMessage = useMemo(() => 
    WELCOME_MESSAGES[Math.floor(sessionSeed * WELCOME_MESSAGES.length)], [sessionSeed]);
  
  // Simulated online users (subset of fake users)
  const onlineUsers = useMemo(() => {
    const shuffled = shuffleArray(FAKE_USERS);
    const count = 8 + Math.floor(Math.random() * 6); // 8-13 users
    return shuffled.slice(0, count);
  }, []);

  const getRandomUser = () => {
    const regularUsers = FAKE_USERS.filter(u => !u.isOwner && !u.isAdmin);
    return regularUsers[Math.floor(Math.random() * regularUsers.length)];
  };

  // Add a conversation (starter + reply)
  const addConversation = () => {
    const availableConvos = CONVERSATIONS
      .map((c, i) => ({ ...c, index: i }))
      .filter(c => !usedConversations.has(c.index));
    
    if (availableConvos.length === 0) {
      setUsedConversations(new Set());
      return;
    }
    
    const convo = availableConvos[Math.floor(Math.random() * availableConvos.length)];
    const starterUser = getRandomUser();
    
    // Add starter message
    const starterMsg: FakeMessage = {
      id: messageIdRef.current++,
      username: starterUser.username,
      message: convo.starter,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, starterMsg].slice(-12));
    setUsedConversations(prev => new Set([...prev, convo.index]));
    
    // Add reply after a delay
    setTimeout(() => {
      let replyUser = getRandomUser();
      while (replyUser.username === starterUser.username) {
        replyUser = getRandomUser();
      }
      
      const replyMsg: FakeMessage = {
        id: messageIdRef.current++,
        username: replyUser.username,
        message: convo.replies[Math.floor(Math.random() * convo.replies.length)],
        timestamp: new Date(),
        isReply: true,
        replyTo: starterUser.username,
      };
      
      setMessages(prev => [...prev, replyMsg].slice(-12));
    }, 2000 + Math.random() * 3000);
  };

  // Add standalone message
  const addStandaloneMessage = () => {
    const user = getRandomUser();
    const msg: FakeMessage = {
      id: messageIdRef.current++,
      username: user.username,
      message: STANDALONE_MESSAGES[Math.floor(Math.random() * STANDALONE_MESSAGES.length)],
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, msg].slice(-12));
  };

  // Initialize with varied starting messages
  useEffect(() => {
    const startIndex = Math.floor(sessionSeed * (CONVERSATIONS.length - 3));
    const initialConvos = CONVERSATIONS.slice(startIndex, startIndex + 2);
    const initialMessages: FakeMessage[] = [];
    const usedIndices = new Set<number>();
    
    initialConvos.forEach((convo, i) => {
      const user1 = FAKE_USERS[2 + i * 2];
      const user2 = FAKE_USERS[3 + i * 2];
      
      initialMessages.push({
        id: messageIdRef.current++,
        username: user1.username,
        message: convo.starter,
        timestamp: new Date(Date.now() - (4 - i * 2) * 45000),
      });
      
      initialMessages.push({
        id: messageIdRef.current++,
        username: user2.username,
        message: convo.replies[0],
        timestamp: new Date(Date.now() - (3 - i * 2) * 45000),
        isReply: true,
        replyTo: user1.username,
      });
      
      usedIndices.add(startIndex + i);
    });

    setMessages(initialMessages);
    setUsedConversations(usedIndices);
  }, [sessionSeed]);

  // Schedule new messages at random intervals
  useEffect(() => {
    const scheduleNextMessage = () => {
      const delay = 10000 + Math.random() * 15000; // 10-25 seconds
      return setTimeout(() => {
        // 70% chance for conversation, 30% for standalone
        if (Math.random() > 0.3) {
          addConversation();
        } else {
          addStandaloneMessage();
        }
        scheduleNextMessage();
      }, delay);
    };

    const timeoutId = scheduleNextMessage();
    return () => clearTimeout(timeoutId);
  }, [usedConversations]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getUserData = (username: string) => 
    FAKE_USERS.find(u => u.username === username) || { username, avatarSeed: username };

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        {/* Welcome Message */}
        <div className="px-4 py-2 bg-primary/10 border-b border-border">
          <p className="text-xs text-primary font-medium">{welcomeMessage}</p>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => {
            const userData = getUserData(msg.username);
            return (
              <div
                key={msg.id}
                className="flex gap-2 animate-fade-in"
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <UserAvatar
                    avatarUrl={getAvatarUrl(userData.avatarSeed)}
                    username={msg.username}
                    size="sm"
                  />
                </div>
                
                {/* Message bubble */}
                <div className="bg-secondary/50 rounded-2xl rounded-bl-md px-3 py-2 max-w-[80%]">
                  <div className="flex items-center gap-1.5">
                    <p className={`text-xs font-medium ${
                      userData.isOwner ? 'text-amber-500' : 
                      userData.isAdmin ? 'text-red-500' : 'text-primary'
                    }`}>
                      {msg.username}
                    </p>
                    {userData.isOwner && <Crown className="w-3 h-3 text-amber-500" />}
                    {userData.isAdmin && <Shield className="w-3 h-3 text-red-500" />}
                  </div>
                  <p className="text-sm text-foreground">{msg.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Fake input (disabled) */}
        <div className="p-4 border-t border-border">
          <div className="bg-input rounded-xl px-4 py-3 text-sm text-muted-foreground cursor-not-allowed">
            Join the chat to send messages...
          </div>
        </div>
      </div>

      {/* Right Side - Fake User List */}
      <div className="w-48 border-l border-border bg-card/50 hidden lg:flex flex-col">
        <div className="px-3 py-2 border-b border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Online — {onlineUsers.length}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {onlineUsers.map((user) => (
            <div 
              key={user.username}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <div className="relative">
                <UserAvatar
                  avatarUrl={getAvatarUrl(user.avatarSeed)}
                  username={user.username}
                  size="xs"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-background" />
              </div>
              <span className={`text-xs truncate ${
                user.isOwner ? 'text-amber-500 font-medium' : 
                user.isAdmin ? 'text-red-500 font-medium' : 'text-foreground'
              }`}>
                {user.username}
              </span>
              {user.isOwner && <Crown className="w-3 h-3 text-amber-500 flex-shrink-0" />}
              {user.isAdmin && <Shield className="w-3 h-3 text-red-500 flex-shrink-0" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FakeChatPreview;
