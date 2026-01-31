import { useTheme } from "@/contexts/ThemeContext";
import matrixRabbitImg from '@/assets/matrix/ascii-rabbit.png';

/**
 * Matrix footer mascots - ASCII rabbit with red/blue pill
 * Left: rabbit + red pill, Right: blue pill + rabbit
 */

// Red pill icon
const RedPill = () => (
  <div
    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center"
    style={{
      background: 'linear-gradient(135deg, hsl(0 80% 50%) 0%, hsl(0 70% 40%) 100%)',
      boxShadow: '0 0 15px hsl(0 80% 50% / 0.6)',
      border: '1px solid hsl(0 80% 60%)',
      animation: 'matrixGlow 2s ease-in-out infinite',
    }}
  >
    <span className="font-mono text-[8px] sm:text-[10px] text-white font-bold" style={{ textShadow: '0 0 5px hsl(0 80% 50%)' }}>
      真
    </span>
  </div>
);

// Blue pill icon
const BluePill = () => (
  <div
    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center"
    style={{
      background: 'linear-gradient(135deg, hsl(210 80% 50%) 0%, hsl(210 70% 40%) 100%)',
      boxShadow: '0 0 15px hsl(210 80% 50% / 0.6)',
      border: '1px solid hsl(210 80% 60%)',
      animation: 'matrixGlow 2s ease-in-out infinite 0.5s',
    }}
  >
    <span className="font-mono text-[8px] sm:text-[10px] text-white font-bold" style={{ textShadow: '0 0 5px hsl(210 80% 50%)' }}>
      偽
    </span>
  </div>
);

// Small rabbit image for footer
const MatrixRabbitSmall = ({ flip = false }: { flip?: boolean }) => (
  <img
    src={matrixRabbitImg}
    alt=""
    className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
    style={{
      filter: 'drop-shadow(0 0 8px hsl(120 100% 50% / 0.5))',
      transform: flip ? 'scaleX(-1)' : 'none',
      opacity: 0.85,
    }}
  />
);

export const MatrixMascot = ({ side }: { side: 'left' | 'right' }) => {
  const { theme } = useTheme();
  
  if (theme !== 'matrix') return null;
  
  return (
    <div 
      className="h-14 sm:h-16 flex items-center justify-center gap-2"
      style={{
        animation: 'matrixRabbitFloat 5s ease-in-out infinite',
        animationDelay: side === 'right' ? '0.5s' : '0s',
      }}
    >
      {side === 'left' ? (
        <>
          <MatrixRabbitSmall />
          <RedPill />
        </>
      ) : (
        <>
          <BluePill />
          <MatrixRabbitSmall flip />
        </>
      )}
    </div>
  );
};
