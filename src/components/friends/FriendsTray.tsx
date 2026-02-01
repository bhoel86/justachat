import { useState, useRef, useEffect, useCallback } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Users, X, Minus, GripHorizontal, ChevronUp, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import FriendsList from "./FriendsList";

interface FriendsTrayProps {
  currentUserId: string;
  onOpenPm: (userId: string, username: string) => void;
}

type SizeMode = 'normal' | 'mid' | 'full';

const FriendsTray = ({ 
  currentUserId, 
  onOpenPm, 
}: FriendsTrayProps) => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [sizeMode, setSizeMode] = useState<SizeMode>('normal');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [counts, setCounts] = useState({ total: 0, online: 0, pending: 0 });
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null);
  const trayRef = useRef<HTMLDivElement>(null);

  const handleCountsChange = useCallback((newCounts: { total: number; online: number; pending: number }) => {
    setCounts(newCounts);
  }, []);

  // Click outside to minimize
  useEffect(() => {
    if (!isOpen || isMinimized || isMobile) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (trayRef.current && !trayRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsMinimized(true);
        setPosition({ x: 0, y: 0 });
      }
    };

    // Delay adding listener to prevent immediate trigger
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, isMinimized, isMobile]);

  // Handle dragging the popup window
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragRef.current) return;
      
      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;
      
      setPosition({
        x: dragRef.current.initialX + deltaX,
        y: dragRef.current.initialY + deltaY,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragRef.current = null;
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't allow dragging when maximized
    if (sizeMode !== 'normal') return;
    e.preventDefault();
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
    };
  };

  const handleToggle = () => {
    if (isMinimized) {
      setIsMinimized(false);
      setIsOpen(true);
    } else {
      setIsOpen(!isOpen);
    }
  };

  const handleMinimize = () => {
    setIsOpen(false);
    setIsMinimized(true);
    setPosition({ x: 0, y: 0 });
    setSizeMode('normal');
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(true);
    setPosition({ x: 0, y: 0 });
    setSizeMode('normal');
  };

  const handleToggleSize = () => {
    // Cycle through: normal -> mid -> full -> normal
    if (sizeMode === 'normal') {
      setSizeMode('mid');
      setPosition({ x: 0, y: 0 });
    } else if (sizeMode === 'mid') {
      setSizeMode('full');
      setPosition({ x: 0, y: 0 });
    } else {
      setSizeMode('normal');
    }
  };

  // Get size styles based on mode
  const getSizeStyles = () => {
    if (isMobile) return {};
    
    switch (sizeMode) {
      case 'full':
        return {
          top: 16,
          right: 16,
          bottom: 16,
          left: 'auto',
          width: 'calc(100vw - 32px)',
          maxWidth: 500,
          height: 'calc(100vh - 32px)',
        };
      case 'mid':
        return {
          right: 16,
          bottom: 16,
          width: 320,
          height: 'calc(50vh)',
          minHeight: 300,
        };
      default:
        return {
          right: 16,
          bottom: 16,
          width: 288,
          height: 400,
          transform: `translate(${position.x}px, ${position.y}px)`,
        };
    }
  };

  // Minimized state - just the icon tab at the bottom
  if (isMinimized && !isOpen) {
    return (
      <div className="fixed bottom-0 right-4 z-[998]">
        <button
          onClick={handleToggle}
          className={cn(
            "relative flex items-center gap-2 px-4 py-2 rounded-t-lg border border-b-0",
            "bg-card/95 backdrop-blur-sm shadow-lg transition-all hover:bg-muted",
            "border-border hover:border-primary/50"
          )}
        >
          <Users className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Friends</span>
          {counts.total > 0 && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0">
              {counts.online}/{counts.total}
            </Badge>
          )}
          {counts.pending > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold animate-pulse">
              {counts.pending}
            </span>
          )}
          <ChevronUp className="h-3 w-3 text-muted-foreground ml-1" />
        </button>
      </div>
    );
  }

  // Open popup state
  return (
    <div 
      ref={trayRef}
      className={cn(
        "fixed z-[998] flex flex-col",
        "bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-2xl",
        isMobile && "inset-x-2 bottom-2 max-h-[70vh]"
      )}
      style={!isMobile ? getSizeStyles() : undefined}
    >
      {/* Header */}
      <div 
        className={cn(
          "flex items-center gap-2 px-3 py-2 border-b border-border rounded-t-lg bg-muted/50",
          !isMobile && sizeMode === 'normal' && "cursor-grab active:cursor-grabbing"
        )}
        onMouseDown={!isMobile ? handleMouseDown : undefined}
      >
        {!isMobile && sizeMode === 'normal' && (
          <GripHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
        <Users className="h-4 w-4 text-primary shrink-0" />
        <span className="font-medium text-sm flex-1">Friends</span>
        {counts.pending > 0 && (
          <Badge variant="destructive" className="text-xs px-1.5 py-0">
            {counts.pending} new
          </Badge>
        )}
        {/* Size toggle button */}
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded hover:bg-muted shrink-0"
            onClick={handleToggleSize}
            title={sizeMode === 'normal' ? 'Expand' : sizeMode === 'mid' ? 'Fullscreen' : 'Restore'}
          >
            {sizeMode === 'full' ? (
              <Minimize2 className="h-3 w-3" />
            ) : (
              <Maximize2 className="h-3 w-3" />
            )}
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded hover:bg-muted shrink-0"
          onClick={handleMinimize}
          title="Minimize"
        >
          <Minus className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded hover:bg-destructive/20 hover:text-destructive shrink-0"
          onClick={handleClose}
          title="Close"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      {/* Friends List Content */}
      <div className="flex-1 overflow-hidden">
        <FriendsList
          currentUserId={currentUserId}
          onOpenPm={onOpenPm}
          onCountsChange={handleCountsChange}
        />
      </div>
    </div>
  );
};

export default FriendsTray;
