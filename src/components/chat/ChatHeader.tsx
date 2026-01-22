import { MessageCircle, Users } from "lucide-react";

interface ChatHeaderProps {
  username: string;
  onlineCount: number;
}

const ChatHeader = ({ username, onlineCount }: ChatHeaderProps) => {
  return (
    <header className="flex items-center justify-between px-4 py-4 bg-card border-b border-border">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl jac-gradient-bg flex items-center justify-center jac-glow">
          <MessageCircle className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display font-bold text-lg jac-gradient-text">JAC</h1>
          <p className="text-xs text-muted-foreground">Just A Chat</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="h-4 w-4" />
        <span>{onlineCount} online</span>
      </div>
    </header>
  );
};

export default ChatHeader;
