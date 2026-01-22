import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  id: string;
  message: string;
  sender: string;
  timestamp: Date;
  isOwn: boolean;
  canDelete?: boolean;
  onDelete?: (id: string) => void;
}

const MessageBubble = ({ 
  id, 
  message, 
  sender, 
  timestamp, 
  isOwn, 
  canDelete = false,
  onDelete 
}: MessageBubbleProps) => {
  return (
    <div
      className={cn(
        "flex animate-message-in group",
        isOwn ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 relative",
          isOwn
            ? "bg-jac-bubble-user text-primary-foreground rounded-br-md"
            : "bg-jac-bubble-other text-foreground rounded-bl-md"
        )}
      >
        {!isOwn && (
          <p className="text-xs font-medium text-primary mb-1">{sender}</p>
        )}
        <p className="text-sm leading-relaxed break-words pr-6">{message}</p>
        <div className="flex items-center justify-between mt-1">
          <p
            className={cn(
              "text-[10px]",
              isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
            )}
          >
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          
          {canDelete && onDelete && (
            <button
              onClick={() => onDelete(id)}
              className={cn(
                "opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/20",
                isOwn ? "text-primary-foreground/70 hover:text-primary-foreground" : "text-muted-foreground hover:text-destructive"
              )}
              title="Delete message"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
