import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  Sparkles, Folder, MessageSquare, FileText, Hourglass, Disc, 
  Star, Search, ThumbsUp, StickyNote
} from 'lucide-react';

// Icons positioned with safe margins (8% from edges minimum) and consistent sizing
const floatingIcons = [
  // Top section - safe from header
  { Icon: Star, top: '15%', left: '8%', color: 'text-cyan-400', size: 18, rotate: 0 },
  { Icon: Sparkles, top: '18%', right: '10%', color: 'text-purple-400', size: 16, rotate: 15 },
  { Icon: Folder, top: '22%', left: '15%', color: 'text-yellow-400', size: 20, rotate: -10 },
  
  // Upper-middle section
  { Icon: MessageSquare, top: '30%', right: '12%', color: 'text-pink-400', size: 18, rotate: 5 },
  { Icon: FileText, top: '35%', left: '10%', color: 'text-cyan-300', size: 16, rotate: -5 },
  { Icon: Star, top: '40%', right: '8%', color: 'text-yellow-300', size: 14, rotate: 20 },
  
  // Middle section
  { Icon: Disc, top: '50%', left: '8%', color: 'text-purple-300', size: 20, rotate: 0 },
  { Icon: Sparkles, top: '55%', right: '10%', color: 'text-cyan-400', size: 14, rotate: 30 },
  
  // Lower-middle section
  { Icon: Hourglass, bottom: '35%', left: '12%', color: 'text-yellow-400', size: 18, rotate: 0 },
  { Icon: Search, bottom: '40%', right: '10%', color: 'text-pink-300', size: 16, rotate: -10 },
  
  // Bottom section - safe from footer
  { Icon: StickyNote, bottom: '22%', left: '10%', color: 'text-yellow-300', size: 16, rotate: -15 },
  { Icon: ThumbsUp, bottom: '25%', right: '12%', color: 'text-cyan-400', size: 18, rotate: 10 },
  { Icon: Star, bottom: '18%', left: '18%', color: 'text-purple-400', size: 12, rotate: 30 },
  { Icon: Sparkles, bottom: '15%', right: '15%', color: 'text-pink-400', size: 14, rotate: 0 },
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
        const { Icon, color, size, rotate, ...position } = item;
        return (
          <div
            key={index}
            className={`absolute ${color} opacity-50`}
            style={{ 
              ...position,
              transform: `rotate(${rotate}deg)`,
              animation: `pulse ${2 + (index % 2)}s ease-in-out infinite`,
              animationDelay: `${index * 0.3}s`,
            }}
          >
            <Icon size={size} strokeWidth={2} />
          </div>
        );
      })}
    </div>
  );
};
