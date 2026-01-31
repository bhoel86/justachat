import React from 'react';
import retroHeader from '@/assets/justachat-header-80s.png';

interface RetroWelcomeBannerProps {
  onJoinClick?: () => void;
  variant?: 'mobile' | 'desktop';
}

export const RetroWelcomeBanner: React.FC<RetroWelcomeBannerProps> = ({ onJoinClick, variant = 'desktop' }) => {
  return (
    <div 
      onClick={onJoinClick}
      className={`relative overflow-hidden ${onJoinClick ? 'cursor-pointer hover:opacity-95 transition-opacity' : ''}`}
    >
      <img 
        src={retroHeader} 
        alt="Justachat - Connect Instantly, Chat Freely" 
        className="w-full h-auto object-contain"
      />
    </div>
  );
};
