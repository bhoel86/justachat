import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  Sparkles, Folder, MessageSquare, FileText, Hourglass, Disc, 
  Star, Search, ThumbsUp, StickyNote, Save, Monitor
} from 'lucide-react';

const floatingIcons = [
  { Icon: Sparkles, className: 'top-[5%] left-[5%] text-cyan-400', size: 24, rotate: 0 },
  { Icon: Star, className: 'top-[8%] right-[15%] text-cyan-400', size: 20, rotate: 15 },
  { Icon: Folder, className: 'top-[12%] left-[20%] text-yellow-400', size: 32, rotate: -10 },
  { Icon: MessageSquare, className: 'top-[6%] right-[30%] text-yellow-300', size: 36, rotate: 5 },
  { Icon: FileText, className: 'top-[15%] right-[8%] text-white', size: 28, rotate: -5 },
  { Icon: Sparkles, className: 'top-[25%] left-[3%] text-purple-400', size: 16, rotate: 45 },
  { Icon: Star, className: 'top-[35%] right-[5%] text-cyan-400', size: 18, rotate: 0 },
  { Icon: Hourglass, className: 'bottom-[25%] left-[8%] text-yellow-400', size: 28, rotate: 0 },
  { Icon: Disc, className: 'bottom-[30%] left-[15%] text-purple-300', size: 32, rotate: 15 },
  { Icon: StickyNote, className: 'bottom-[20%] right-[12%] text-yellow-300', size: 24, rotate: -15 },
  { Icon: ThumbsUp, className: 'bottom-[35%] right-[6%] text-cyan-400', size: 26, rotate: 10 },
  { Icon: Search, className: 'top-[45%] left-[4%] text-cyan-400', size: 22, rotate: -10 },
  { Icon: Star, className: 'bottom-[15%] left-[25%] text-purple-400', size: 14, rotate: 30 },
  { Icon: Sparkles, className: 'bottom-[10%] right-[25%] text-cyan-400', size: 20, rotate: 0 },
  { Icon: Folder, className: 'bottom-[8%] left-[40%] text-yellow-400', size: 26, rotate: 5 },
  { Icon: Star, className: 'top-[50%] right-[3%] text-yellow-300', size: 16, rotate: -20 },
  { Icon: FileText, className: 'bottom-[40%] left-[2%] text-white', size: 20, rotate: 10 },
  { Icon: Sparkles, className: 'top-[70%] right-[10%] text-purple-400', size: 18, rotate: -30 },
];

export const RetroFloatingIcons: React.FC = () => {
  const { theme } = useTheme();

  // Only show for retro80s theme
  if (theme !== 'retro80s') {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {floatingIcons.map((item, index) => {
        const { Icon, className, size, rotate } = item;
        return (
          <div
            key={index}
            className={`absolute ${className} opacity-60 animate-pulse`}
            style={{ 
              transform: `rotate(${rotate}deg)`,
              animationDelay: `${index * 0.2}s`,
              animationDuration: `${2 + (index % 3)}s`
            }}
          >
            <Icon size={size} strokeWidth={2.5} />
          </div>
        );
      })}
    </div>
  );
};
