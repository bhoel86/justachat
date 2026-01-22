import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: string;
  sender: string;
  timestamp: Date;
  isOwn: boolean;
}

const MessageBubble = ({ message, sender, timestamp, isOwn }: MessageBubbleProps) => {
  return (
    <div
      className={cn(
        "flex animate-message-in",
        isOwn ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3",
          isOwn
            ? "bg-jac-bubble-user text-primary-foreground rounded-br-md"
            : "bg-jac-bubble-other text-foreground rounded-bl-md"
        )}
      >
        {!isOwn && (
          <p className="text-xs font-medium text-primary mb-1">{sender}</p>
        )}
        <p className="text-sm leading-relaxed break-words">{message}</p>
        <p
          className={cn(
            "text-[10px] mt-1",
            isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
          )}
        >
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};

export default MessageBubble;
