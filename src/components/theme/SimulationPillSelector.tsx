import { useState } from 'react';
import { useSimulationPill, PillChoice } from '@/hooks/useSimulationPill';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface SimulationPillSelectorProps {
  onComplete?: () => void;
}

/**
 * Red pill / Blue pill selector shown on the login page when Simulation theme is active
 * "You take the blue pill... the story ends. You take the red pill... you stay in Wonderland."
 */
export const SimulationPillSelector = ({ onComplete }: SimulationPillSelectorProps) => {
  const { theme } = useTheme();
  const { pill, setPill, hasPill } = useSimulationPill();
  const [hovering, setHovering] = useState<PillChoice>(null);
  const [selected, setSelected] = useState<PillChoice>(null);
  const [animating, setAnimating] = useState(false);

  // Only show for Simulation theme and if no pill chosen yet
  if (theme !== 'matrix') return null;

  const handleSelect = (choice: PillChoice) => {
    if (animating || !choice) return;
    
    setSelected(choice);
    setAnimating(true);
    
    // Animate then save
    setTimeout(() => {
      setPill(choice);
      setAnimating(false);
      onComplete?.();
    }, 1500);
  };

  // If already has pill, show current choice indicator (can be clicked to change)
  if (hasPill && !animating) {
    return (
      <button
        onClick={() => setPill(null)} // Reset to allow re-selection
        className="flex items-center gap-2 px-3 py-1.5 rounded border border-green-500/30 bg-black/50 hover:bg-green-900/20 transition-colors group"
        title="Click to choose again"
      >
        <span className="text-lg">{pill === 'red' ? '🔴' : '🔵'}</span>
        <span className="text-xs text-green-400/70 font-mono group-hover:text-green-400">
          {pill === 'red' ? 'RED PILL' : 'BLUE PILL'}
        </span>
      </button>
    );
  }

  return (
    <div className={cn(
      "fixed inset-0 z-[100] flex items-center justify-center bg-black/95 transition-opacity duration-500",
      animating && "opacity-0 pointer-events-none"
    )}>
      {/* CRT scanline effect */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.03) 2px, rgba(0,255,0,0.03) 4px)'
        }}
      />
      
      <div className="text-center space-y-8 px-4">
        {/* Morpheus quote */}
        <div className="space-y-2">
          <p className="text-green-400 font-mono text-sm md:text-base animate-pulse">
            This is your last chance.
          </p>
          <p className="text-green-500/80 font-mono text-xs md:text-sm max-w-md mx-auto leading-relaxed">
            After this, there is no turning back.
          </p>
        </div>

        {/* Pills */}
        <div className="flex items-center justify-center gap-8 md:gap-16">
          {/* Blue Pill */}
          <button
            onClick={() => handleSelect('blue')}
            onMouseEnter={() => setHovering('blue')}
            onMouseLeave={() => setHovering(null)}
            className={cn(
              "relative group transition-all duration-300",
              selected === 'blue' && "scale-125",
              selected === 'red' && "opacity-0 scale-75"
            )}
          >
            <div className={cn(
              "w-16 h-10 md:w-20 md:h-12 rounded-full transition-all duration-300",
              "bg-gradient-to-br from-blue-400 via-blue-500 to-blue-700",
              "shadow-lg group-hover:shadow-blue-500/50 group-hover:shadow-xl",
              hovering === 'blue' && "scale-110",
              "border-2 border-blue-300/50"
            )} />
            <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent to-white/30" />
            
            {/* Glow effect */}
            <div className={cn(
              "absolute -inset-4 rounded-full bg-blue-500/20 blur-xl transition-opacity",
              hovering === 'blue' ? "opacity-100" : "opacity-0"
            )} />
          </button>

          {/* Divider */}
          <div className="text-green-500/50 font-mono text-2xl">|</div>

          {/* Red Pill */}
          <button
            onClick={() => handleSelect('red')}
            onMouseEnter={() => setHovering('red')}
            onMouseLeave={() => setHovering(null)}
            className={cn(
              "relative group transition-all duration-300",
              selected === 'red' && "scale-125",
              selected === 'blue' && "opacity-0 scale-75"
            )}
          >
            <div className={cn(
              "w-16 h-10 md:w-20 md:h-12 rounded-full transition-all duration-300",
              "bg-gradient-to-br from-red-400 via-red-500 to-red-700",
              "shadow-lg group-hover:shadow-red-500/50 group-hover:shadow-xl",
              hovering === 'red' && "scale-110",
              "border-2 border-red-300/50"
            )} />
            <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent to-white/30" />
            
            {/* Glow effect */}
            <div className={cn(
              "absolute -inset-4 rounded-full bg-red-500/20 blur-xl transition-opacity",
              hovering === 'red' ? "opacity-100" : "opacity-0"
            )} />
          </button>
        </div>

        {/* Description based on hover */}
        <div className="h-16 flex items-center justify-center">
          {hovering === 'blue' && (
            <p className="text-blue-400 font-mono text-xs md:text-sm max-w-xs animate-fade-in">
              The story ends. You wake up and believe whatever you want to believe.
            </p>
          )}
          {hovering === 'red' && (
            <p className="text-red-400 font-mono text-xs md:text-sm max-w-xs animate-fade-in">
              You stay in Wonderland, and I show you how deep the rabbit hole goes.
            </p>
          )}
          {!hovering && !selected && (
            <p className="text-green-500/50 font-mono text-xs">
              Choose wisely...
            </p>
          )}
          {selected && (
            <p className={cn(
              "font-mono text-sm animate-pulse",
              selected === 'red' ? "text-red-400" : "text-blue-400"
            )}>
              {selected === 'red' ? "Welcome to the real world..." : "Sweet dreams..."}
            </p>
          )}
        </div>

        {/* Skip option */}
        {!selected && (
          <button
            onClick={() => {
              setPill('blue'); // Default to blue if skipped
              onComplete?.();
            }}
            className="text-green-500/30 hover:text-green-500/60 font-mono text-xs transition-colors"
          >
            [skip]
          </button>
        )}
      </div>
    </div>
  );
};
