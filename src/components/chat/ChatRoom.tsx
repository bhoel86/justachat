import { useState, useRef, useEffect } from "react";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";

interface Message {
  id: string;
  message: string;
  sender: string;
  timestamp: Date;
  isOwn: boolean;
}

interface ChatRoomProps {
  username: string;
}

const MOCK_USERS = ["Alex", "Jordan", "Sam", "Casey", "Riley"];
const MOCK_MESSAGES = [
  "Hey everyone! 👋",
  "What's up?",
  "Just chilling, you?",
  "Anyone want to chat?",
  "This app is pretty cool!",
  "Love the design 💙",
  "How's everyone doing today?",
];

const ChatRoom = ({ username }: ChatRoomProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      message: "Welcome to JAC! Start chatting with others 🎉",
      sender: "JAC Bot",
      timestamp: new Date(),
      isOwn: false,
    },
  ]);
  const [onlineCount] = useState(Math.floor(Math.random() * 50) + 10);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simulate incoming messages
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const randomUser = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
        const randomMessage = MOCK_MESSAGES[Math.floor(Math.random() * MOCK_MESSAGES.length)];
        
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            message: randomMessage,
            sender: randomUser,
            timestamp: new Date(),
            isOwn: false,
          },
        ]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleSend = (message: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        message,
        sender: username,
        timestamp: new Date(),
        isOwn: true,
      },
    ]);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <ChatHeader username={username} onlineCount={onlineCount} />
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg.message}
            sender={msg.sender}
            timestamp={msg.timestamp}
            isOwn={msg.isOwn}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <ChatInput onSend={handleSend} />
    </div>
  );
};

export default ChatRoom;
