import { useState, useEffect, useRef } from "react";

interface FakeMessage {
  id: number;
  username: string;
  message: string;
  timestamp: Date;
}

// Pool of fake usernames
const FAKE_USERS = [
  "CoolCat92", "NightOwl", "SunnyDaze", "TechWiz", "MoonRider",
  "StarGazer", "BlueSky", "RedPanda", "GreenLeaf", "PurpleRain",
  "GoldenEagle", "SilverFox", "CryptoKing", "GameMaster", "MusicLover",
  "BookWorm", "CoffeeBean", "PizzaFan", "ChillVibes", "HappyCamper"
];

// Pool of fake messages - varied and natural
const FAKE_MESSAGES = [
  "hey everyone!",
  "what's up?",
  "anyone here?",
  "this is cool",
  "lol nice",
  "yo",
  "hey hey",
  "wassup people",
  "just chilling",
  "how's everyone doing?",
  "nice weather today",
  "anyone wanna chat?",
  "sup guys",
  "haha",
  "that's awesome",
  "agreed",
  "totally",
  "brb",
  "back",
  "what did I miss?",
  "nothing much lol",
  "just got here",
  "hey!",
  "anyone play games here?",
  "music recommendations?",
  "this place is chill",
  "I like it here",
  "good vibes",
  "what's new?",
  "just finished work",
  "weekend plans anyone?",
  "sounds fun",
  "count me in",
  "nice to meet everyone",
  "first time here",
  "welcome!",
  "hello from the other side",
  "lmao",
  "for real",
  "same here",
  "mood",
  "facts",
  "true that",
  "exactly",
  "yup",
  "nah",
  "maybe later",
  "gotta go soon",
  "catch you later",
  "have a good one",
];

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
  const [usedMessages, setUsedMessages] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageIdRef = useRef(0);

  // Get a random message that hasn't been used recently
  const getUniqueMessage = () => {
    const availableMessages = FAKE_MESSAGES.filter(m => !usedMessages.has(m));
    
    // If all messages used, reset the pool
    if (availableMessages.length === 0) {
      setUsedMessages(new Set());
      return FAKE_MESSAGES[Math.floor(Math.random() * FAKE_MESSAGES.length)];
    }
    
    return availableMessages[Math.floor(Math.random() * availableMessages.length)];
  };

  // Add a new fake message
  const addFakeMessage = () => {
    const username = FAKE_USERS[Math.floor(Math.random() * FAKE_USERS.length)];
    const messageText = getUniqueMessage();
    
    const newMessage: FakeMessage = {
      id: messageIdRef.current++,
      username,
      message: messageText,
      timestamp: new Date(),
    };

    setUsedMessages(prev => new Set([...prev, messageText]));
    setMessages(prev => {
      const updated = [...prev, newMessage];
      // Keep only last 8 messages
      return updated.slice(-8);
    });
  };

  // Initialize with a few messages
  useEffect(() => {
    const shuffledMessages = shuffleArray(FAKE_MESSAGES).slice(0, 4);
    const shuffledUsers = shuffleArray(FAKE_USERS);
    
    const initialMessages: FakeMessage[] = shuffledMessages.map((msg, i) => ({
      id: messageIdRef.current++,
      username: shuffledUsers[i],
      message: msg,
      timestamp: new Date(Date.now() - (4 - i) * 30000), // Stagger timestamps
    }));

    setMessages(initialMessages);
    setUsedMessages(new Set(shuffledMessages));
  }, []);

  // Add new messages at random intervals (8-20 seconds)
  useEffect(() => {
    const scheduleNextMessage = () => {
      const delay = 8000 + Math.random() * 12000; // 8-20 seconds
      return setTimeout(() => {
        addFakeMessage();
        scheduleNextMessage();
      }, delay);
    };

    const timeoutId = scheduleNextMessage();
    return () => clearTimeout(timeoutId);
  }, [usedMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="flex gap-2 animate-fade-in"
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary-foreground">
                {msg.username.charAt(0).toUpperCase()}
              </span>
            </div>
            
            {/* Message bubble */}
            <div className="bg-secondary/50 rounded-2xl rounded-bl-md px-3 py-2 max-w-[80%]">
              <p className="text-xs font-medium text-primary">{msg.username}</p>
              <p className="text-sm text-foreground">{msg.message}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Fake input (disabled) */}
      <div className="p-4 border-t border-border">
        <div className="bg-input rounded-xl px-4 py-3 text-sm text-muted-foreground cursor-not-allowed">
          Join the chat to send messages...
        </div>
      </div>
    </div>
  );
};

export default FakeChatPreview;
