 /**
  * ╔═ JustAChat™ ════════ Est. Jan 22, 2026 · 1:03 PM ═ © Unix ═╗
  * ╚═ Proprietary software. All rights reserved. ══════════════╝
  */
 
 import React from 'react';
 import { useTheme } from '@/contexts/ThemeContext';
 import { MessageSquare, Sparkles } from 'lucide-react';
 
 /**
  * OG Theme Watermark - Modern, clean aesthetic with gradient text and subtle glow
  * Matches the sophisticated OG theme palette
  */
 export const OGWatermark: React.FC = () => {
   const { theme } = useTheme();
 
   // Only show for OG/jac theme (default theme)
   if (theme !== 'jac') {
     return null;
   }
 
   return (
     <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
       {/* Main watermark container */}
       <div 
         className="text-center select-none"
         style={{ 
           opacity: 0.08,
           transform: 'rotate(-8deg)',
         }}
       >
         {/* Decorative icon cluster */}
         <div className="flex justify-center items-center gap-3 mb-2">
           <Sparkles 
             className="w-8 h-8 sm:w-10 sm:h-10"
             style={{ 
               color: 'hsl(var(--primary))',
               filter: 'drop-shadow(0 0 20px hsl(var(--primary) / 0.5))',
               transform: 'rotate(-15deg)',
             }}
           />
           <div 
             className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center"
             style={{
               background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))',
               boxShadow: '0 0 40px hsl(var(--primary) / 0.3)',
             }}
           >
             <MessageSquare 
               className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white"
               strokeWidth={2.5}
             />
           </div>
           <Sparkles 
             className="w-8 h-8 sm:w-10 sm:h-10"
             style={{ 
               color: 'hsl(var(--primary))',
               filter: 'drop-shadow(0 0 20px hsl(var(--primary) / 0.5))',
               transform: 'rotate(15deg)',
             }}
           />
         </div>
         
         {/* Brand name with gradient */}
         <div 
           className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight"
           style={{
             background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.6), hsl(var(--primary)))',
             WebkitBackgroundClip: 'text',
             WebkitTextFillColor: 'transparent',
             backgroundClip: 'text',
             textShadow: '0 0 60px hsl(var(--primary) / 0.3)',
           }}
         >
           JUSTACHAT
         </div>
         
         {/* Trademark */}
         <div 
           className="font-display text-lg sm:text-xl font-semibold mt-1 tracking-[0.3em]"
           style={{
             color: 'hsl(var(--muted-foreground))',
           }}
         >
           ™
         </div>
         
         {/* Tagline */}
         <div 
           className="font-display text-sm sm:text-base md:text-lg font-medium mt-2 tracking-widest"
           style={{
             color: 'hsl(var(--primary) / 0.8)',
           }}
         >
           CONNECT · CHAT · CREATE
         </div>
       </div>
       
       {/* Subtle decorative orbs */}
       <div 
         className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full"
         style={{
           background: 'radial-gradient(circle, hsl(var(--primary) / 0.1), transparent)',
           filter: 'blur(40px)',
         }}
       />
       <div 
         className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full"
         style={{
           background: 'radial-gradient(circle, hsl(var(--primary) / 0.08), transparent)',
           filter: 'blur(60px)',
         }}
       />
     </div>
   );
 };