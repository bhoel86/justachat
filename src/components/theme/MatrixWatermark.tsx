import { useTheme } from "@/contexts/ThemeContext";
import matrixRabbitImg from '@/assets/matrix/ascii-rabbit.png';

/**
 * Matrix watermark - ASCII rabbit hidden in matrix code
 * Subtly visible in chat backgrounds
 */
export const MatrixWatermark = () => {
  const { theme } = useTheme();
  
  if (theme !== 'matrix') return null;

  return (
    <div 
      className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
      style={{ opacity: 0.08 }}
    >
      <div className="relative">
        {/* Main rabbit image */}
        <img
          src={matrixRabbitImg}
          alt=""
          className="w-64 h-64 sm:w-80 sm:h-80 object-contain"
          style={{
            filter: 'drop-shadow(0 0 30px hsl(120 100% 50% / 0.3))',
            animation: 'matrixRabbitFloat 8s ease-in-out infinite',
          }}
        />
        
        {/* Overlay text hint */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-sm whitespace-nowrap"
          style={{
            color: 'hsl(120 100% 60%)',
            textShadow: '0 0 10px hsl(120 100% 50%)',
            opacity: 0.9,
          }}
        >
          Wake up, Neo...
        </div>
      </div>
    </div>
  );
};
