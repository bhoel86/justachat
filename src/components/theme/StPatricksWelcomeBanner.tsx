import { useTheme } from "@/contexts/ThemeContext";
import { Sparkles } from "lucide-react";

/**
 * St. Patrick's Day welcome banner with Irish flair
 */

const Shamrock: React.FC<{ size: number; className?: string; style?: React.CSSProperties }> = ({ size, className, style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    style={style}
  >
    <path d="M12 2c-1.5 0-3 1.5-3 3.5 0 1.5 1 2.5 2 3-2 0-4.5 1-4.5 3.5S8.5 15.5 10 15c-1 1-2 3-2 4.5 0 1.5 1.5 2.5 3 2.5s2-1 2-2v-6c0 0 0 2 0 2v4c0 1 .5 2 2 2s3-1 3-2.5c0-1.5-1-3.5-2-4.5 1.5.5 3.5-.5 3.5-3S16 9.5 14 9.5c1-0.5 2-1.5 2-3C16 3.5 14.5 2 13 2c-0.5 0-1 0.5-1 1.5V5c0-1.5-.5-3-1-3z" />
  </svg>
);

export const StPatricksWelcomeBanner = () => {
  const { theme } = useTheme();
  
  if (theme !== 'stpatricks') return null;
  
  return (
    <div className="relative w-full flex flex-col items-center justify-center py-6 overflow-hidden">
      {/* Background glow */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, hsl(142 76% 36% / 0.15) 0%, transparent 70%)',
        }}
      />
      
      {/* Floating shamrocks around banner */}
      <Shamrock 
        size={24} 
        className="absolute top-2 left-8 text-primary opacity-60"
      />
      <Shamrock 
        size={18} 
        className="absolute top-4 right-12 text-primary opacity-50"
      />
      <Shamrock 
        size={20} 
        className="absolute bottom-2 left-16 text-primary opacity-40"
      />
      <Shamrock 
        size={16} 
        className="absolute bottom-4 right-8 text-primary opacity-50"
      />
      
      {/* Gold sparkles */}
      <Sparkles 
        size={16} 
        className="absolute top-3 left-20 text-accent opacity-60"
        style={{ animation: 'stpatricksSparkle 2s ease-in-out infinite' }}
      />
      <Sparkles 
        size={14} 
        className="absolute bottom-3 right-20 text-accent opacity-50"
        style={{ animation: 'stpatricksSparkle 2s ease-in-out infinite 0.5s' }}
      />
      
      {/* Main banner content */}
      <div className="relative z-10 flex items-center gap-3">
        <Shamrock size={32} className="text-primary" style={{ filter: 'drop-shadow(0 0 8px hsl(142 76% 36% / 0.5))' }} />
        
        <div className="text-center">
          <h1 
            className="text-2xl sm:text-3xl font-bold"
            style={{
              background: 'linear-gradient(135deg, hsl(142 76% 45%) 0%, hsl(45 93% 50%) 50%, hsl(142 76% 40%) 100%)',
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'stpatricksRainbow 4s ease-in-out infinite',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
            }}
          >
            Justachat™
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            ☘️ Luck of the Irish in Every Chat ☘️
          </p>
        </div>
        
        <Shamrock size={32} className="text-primary" style={{ filter: 'drop-shadow(0 0 8px hsl(142 76% 36% / 0.5))' }} />
      </div>
    </div>
  );
};
