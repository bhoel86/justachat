import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Radio, Play, Pause, SkipForward, Volume2, VolumeX, X, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

// Curated list of royalty-free/embeddable music streams
const RADIO_STATIONS = [
  { name: 'Lofi Hip Hop', videoId: 'jfKfPfyJRdk', artist: 'Lofi Girl' },
  { name: 'Chillhop Radio', videoId: '5yx6BWlEVcY', artist: 'Chillhop Music' },
  { name: 'Jazz Radio', videoId: 'Dx5qFachd3A', artist: 'Cafe Music BGM' },
  { name: 'Synthwave Radio', videoId: '4xDzrJKXOOY', artist: 'Synthwave Goose' },
  { name: 'Classical Piano', videoId: 'klPZIGQcrHA', artist: 'Rousseau' },
  { name: 'Ambient Chill', videoId: 'S_MOd40zlYU', artist: 'Ambient Worlds' },
];

export interface RadioPlayerRef {
  play: () => void;
  pause: () => void;
  skip: () => void;
  getCurrentStation: () => { name: string; artist: string } | null;
  isPlaying: () => boolean;
  toggle: () => void;
}

interface RadioPlayerProps {
  onStatusChange?: (status: string) => void;
  minimized?: boolean;
}

interface YTPlayer {
  destroy: () => void;
  playVideo: () => void;
  pauseVideo: () => void;
  setVolume: (volume: number) => void;
  loadVideoById: (videoId: string) => void;
}

interface YTWindow extends Window {
  YT?: {
    Player: new (elementId: string, config: unknown) => YTPlayer;
    PlayerState: { PLAYING: number; PAUSED: number };
  };
  onYouTubeIframeAPIReady?: () => void;
}

const RadioPlayer = forwardRef<RadioPlayerRef, RadioPlayerProps>(({ onStatusChange, minimized = false }, ref) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStationIndex, setCurrentStationIndex] = useState(0);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const playerRef = useRef<YTPlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentStation = RADIO_STATIONS[currentStationIndex];
  const ytWindow = window as YTWindow;

  // Load YouTube IFrame API
  useEffect(() => {
    if (!ytWindow.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // Initialize player when visible
  useEffect(() => {
    if (!isVisible) return;

    const initPlayer = () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }

      if (!ytWindow.YT?.Player) return;

      playerRef.current = new ytWindow.YT.Player('youtube-player', {
        height: '0',
        width: '0',
        videoId: currentStation.videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
        },
        events: {
          onReady: (event: { target: YTPlayer }) => {
            event.target.setVolume(volume);
            if (isPlaying) {
              event.target.playVideo();
            }
          },
          onStateChange: (event: { data: number }) => {
            if (ytWindow.YT?.PlayerState) {
              if (event.data === ytWindow.YT.PlayerState.PLAYING) {
                setIsPlaying(true);
              } else if (event.data === ytWindow.YT.PlayerState.PAUSED) {
                setIsPlaying(false);
              }
            }
          },
        },
      });
    };

    if (ytWindow.YT?.Player) {
      initPlayer();
    } else {
      ytWindow.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [isVisible, currentStation.videoId]);

  // Update volume
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.setVolume(isMuted ? 0 : volume);
    }
  }, [volume, isMuted]);

  const handlePlay = () => {
    if (!isVisible) {
      setIsVisible(true);
      setIsPlaying(true);
    } else if (playerRef.current) {
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
    onStatusChange?.(`▶️ Now playing: ${currentStation.name} by ${currentStation.artist}`);
  };

  const handlePause = () => {
    if (playerRef.current) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    }
    onStatusChange?.(`⏸️ Radio paused`);
  };

  const handleSkip = () => {
    const nextIndex = (currentStationIndex + 1) % RADIO_STATIONS.length;
    setCurrentStationIndex(nextIndex);
    const nextStation = RADIO_STATIONS[nextIndex];
    
    if (playerRef.current) {
      playerRef.current.loadVideoById(nextStation.videoId);
      if (isPlaying) {
        playerRef.current.playVideo();
      }
    }
    onStatusChange?.(`⏭️ Skipped to: ${nextStation.name} by ${nextStation.artist}`);
  };

  const handleToggle = () => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  };

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    play: handlePlay,
    pause: handlePause,
    skip: handleSkip,
    getCurrentStation: () => isVisible ? { name: currentStation.name, artist: currentStation.artist } : null,
    isPlaying: () => isPlaying,
    toggle: handleToggle,
  }));

  if (!isVisible && minimized) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handlePlay}
        className="text-muted-foreground hover:text-foreground"
        title="Start Radio"
      >
        <Radio className="h-5 w-5" />
      </Button>
    );
  }

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg"
    >
      <div id="youtube-player" className="hidden" />
      
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
            <Music className={`h-5 w-5 text-primary ${isPlaying ? 'animate-pulse' : ''}`} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {currentStation.name}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {currentStation.artist}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggle}
            className="h-8 w-8"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleSkip}
            className="h-8 w-8"
          >
            <SkipForward className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMuted(!isMuted)}
            className="h-8 w-8"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>

          <div className="w-20 hidden sm:block">
            <Slider
              value={[isMuted ? 0 : volume]}
              max={100}
              step={1}
              onValueChange={(value) => {
                setVolume(value[0]);
                setIsMuted(false);
              }}
              className="cursor-pointer"
            />
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              handlePause();
              setIsVisible(false);
            }}
            className="h-8 w-8 text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
});

RadioPlayer.displayName = 'RadioPlayer';

export default RadioPlayer;
