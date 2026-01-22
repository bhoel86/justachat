import { useState } from "react";
import WelcomeScreen from "@/components/WelcomeScreen";
import ChatRoom from "@/components/chat/ChatRoom";

const Index = () => {
  const [username, setUsername] = useState<string | null>(null);

  const handleJoin = (name: string) => {
    setUsername(name);
  };

  if (!username) {
    return <WelcomeScreen onJoin={handleJoin} />;
  }

  return <ChatRoom username={username} />;
};

export default Index;
