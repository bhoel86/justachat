import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Zap, Star, Sparkles } from 'lucide-react';

interface RetroWelcomeBannerProps {
  onJoinClick?: () => void;
  variant?: 'mobile' | 'desktop';
}

export const RetroWelcomeBanner: React.FC<RetroWelcomeBannerProps> = ({ 
  onJoinClick,
  variant = 'desktop'
}) => {
  const { theme } = useTheme();

  // Only show for retro80s theme
  if (theme !== 'retro80s') {
    return null;
  }

  const isMobile = variant === 'mobile';

  return (
    <div 
      className={`relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-400 ${
        isMobile ? 'h-24' : 'h-24 sm:h-32 md:h-40'
      }`}
      style={{
        borderTop: '4px solid black',
        borderBottom: '4px solid black',
      }}
    >
      {/* Scanline effect overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)',
        }}
      />
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'linear-gradient(hsl(var(--accent)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--accent)) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* Decorative stars */}
      <Star className="absolute top-2 left-4 w-4 h-4 text-yellow-300 animate-pulse" fill="currentColor" />
      <Sparkles className="absolute top-3 right-8 w-5 h-5 text-cyan-300 animate-pulse" style={{ animationDelay: '0.5s' }} />
      <Star className="absolute bottom-3 left-12 w-3 h-3 text-pink-300 animate-pulse" fill="currentColor" style={{ animationDelay: '1s' }} />
      <Zap className="absolute bottom-2 right-16 w-4 h-4 text-yellow-300" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <h2 
            className={`font-display font-black tracking-tight ${
              isMobile ? 'text-3xl' : 'text-3xl sm:text-4xl md:text-5xl'
            }`}
            style={{
              color: 'hsl(var(--accent))',
              textShadow: '3px 3px 0 black, -1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black',
              WebkitTextStroke: '1px black',
            }}
          >
            WELCOME!
          </h2>
          <p 
            className={`font-display font-bold mt-1 ${
              isMobile ? 'text-xs' : 'text-xs sm:text-sm md:text-base'
            }`}
            style={{
              color: 'white',
              textShadow: '2px 2px 0 black',
            }}
          >
            This is the main hangout spot.
          </p>
        </div>
        
        {/* Join button for desktop */}
        {!isMobile && onJoinClick && (
          <Button 
            onClick={onJoinClick}
            className="absolute right-2 sm:right-4 top-2 sm:top-4 bg-accent text-accent-foreground hover:bg-accent/90 text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 h-auto font-display font-bold border-2 border-foreground"
            style={{ boxShadow: '3px 3px 0 black' }}
          >
            Join Chat
          </Button>
        )}
      </div>
    </div>
  );
};
