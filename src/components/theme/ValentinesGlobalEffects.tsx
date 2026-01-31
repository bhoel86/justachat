import { useTheme } from "@/contexts/ThemeContext";
import { Heart, Sparkles } from "lucide-react";

/**
 * Global Valentine's theme effects - floating hearts and glowing background
 * Renders everywhere EXCEPT radio UI and main chat message areas
 */
export const ValentinesGlobalEffects = () => {
  const { theme } = useTheme();
  
  if (theme !== 'valentines') return null;
  
  return (
    <>
      {/* Global glowing gradient background overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% 20%, hsl(340 82% 52% / 0.15) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 80%, hsl(350 70% 60% / 0.12) 0%, transparent 50%),
            radial-gradient(ellipse 50% 30% at 50% 50%, hsl(340 90% 65% / 0.08) 0%, transparent 50%)
          `,
        }}
      />
      
      {/* Floating hearts - scattered around viewport edges */}
      <div className="fixed inset-0 pointer-events-none z-[5] overflow-hidden">
        {/* Top left cluster */}
        <Heart 
          className="absolute text-pink-400/30 animate-pulse" 
          style={{ top: '5%', left: '3%', animationDelay: '0s', animationDuration: '3s' }}
          size={24} 
          fill="currentColor"
        />
        <Sparkles 
          className="absolute text-rose-300/25 animate-pulse" 
          style={{ top: '12%', left: '8%', animationDelay: '1.5s', animationDuration: '4s' }}
          size={16}
        />
        <Heart 
          className="absolute text-pink-300/20 animate-pulse" 
          style={{ top: '8%', left: '15%', animationDelay: '0.5s', animationDuration: '3.5s' }}
          size={18} 
          fill="currentColor"
        />
        
        {/* Top right cluster */}
        <Heart 
          className="absolute text-rose-400/30 animate-pulse" 
          style={{ top: '4%', right: '5%', animationDelay: '2s', animationDuration: '3s' }}
          size={28} 
          fill="currentColor"
        />
        <Sparkles 
          className="absolute text-pink-300/20 animate-pulse" 
          style={{ top: '15%', right: '10%', animationDelay: '0.8s', animationDuration: '4.5s' }}
          size={14}
        />
        <Heart 
          className="absolute text-pink-400/25 animate-pulse" 
          style={{ top: '10%', right: '18%', animationDelay: '1.2s', animationDuration: '3.2s' }}
          size={20} 
          fill="currentColor"
        />
        
        {/* Bottom left cluster */}
        <Heart 
          className="absolute text-pink-400/25 animate-pulse" 
          style={{ bottom: '8%', left: '4%', animationDelay: '0.3s', animationDuration: '3.8s' }}
          size={22} 
          fill="currentColor"
        />
        <Sparkles 
          className="absolute text-rose-300/20 animate-pulse" 
          style={{ bottom: '15%', left: '12%', animationDelay: '2.2s', animationDuration: '4s' }}
          size={18}
        />
        <Heart 
          className="absolute text-rose-400/20 animate-pulse" 
          style={{ bottom: '5%', left: '20%', animationDelay: '1.8s', animationDuration: '3.5s' }}
          size={16} 
          fill="currentColor"
        />
        
        {/* Bottom right cluster */}
        <Heart 
          className="absolute text-pink-300/30 animate-pulse" 
          style={{ bottom: '6%', right: '6%', animationDelay: '1s', animationDuration: '3.3s' }}
          size={26} 
          fill="currentColor"
        />
        <Sparkles 
          className="absolute text-pink-400/25 animate-pulse" 
          style={{ bottom: '12%', right: '15%', animationDelay: '0.5s', animationDuration: '4.2s' }}
          size={15}
        />
        <Heart 
          className="absolute text-rose-300/20 animate-pulse" 
          style={{ bottom: '18%', right: '8%', animationDelay: '2.5s', animationDuration: '3.7s' }}
          size={18} 
          fill="currentColor"
        />
        
        {/* Side accents - left */}
        <Heart 
          className="absolute text-pink-400/15 animate-pulse" 
          style={{ top: '35%', left: '2%', animationDelay: '1.3s', animationDuration: '4s' }}
          size={20} 
          fill="currentColor"
        />
        <Heart 
          className="absolute text-rose-400/20 animate-pulse" 
          style={{ top: '55%', left: '3%', animationDelay: '2.8s', animationDuration: '3.5s' }}
          size={16} 
          fill="currentColor"
        />
        
        {/* Side accents - right */}
        <Heart 
          className="absolute text-rose-300/15 animate-pulse" 
          style={{ top: '40%', right: '2%', animationDelay: '0.7s', animationDuration: '3.8s' }}
          size={22} 
          fill="currentColor"
        />
        <Heart 
          className="absolute text-pink-400/20 animate-pulse" 
          style={{ top: '60%', right: '4%', animationDelay: '1.9s', animationDuration: '4.2s' }}
          size={18} 
          fill="currentColor"
        />
        
        {/* Scattered sparkles */}
        <Sparkles 
          className="absolute text-pink-300/15 animate-pulse" 
          style={{ top: '25%', left: '25%', animationDelay: '3s', animationDuration: '5s' }}
          size={12}
        />
        <Sparkles 
          className="absolute text-rose-300/15 animate-pulse" 
          style={{ top: '70%', right: '25%', animationDelay: '2.3s', animationDuration: '4.8s' }}
          size={14}
        />
      </div>
    </>
  );
};
