import { useEffect, useRef, forwardRef, useState, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Video, VideoOff, Sparkles } from 'lucide-react';

interface VideoTileProps {
  stream?: MediaStream | null;
  username: string;
  avatarUrl?: string | null;
  isLocal?: boolean;
  isBroadcasting?: boolean;
  roleBadge?: React.ReactNode;
  aiEnhanced?: boolean;
}

const VideoTile = forwardRef<HTMLDivElement, VideoTileProps>(({ 
  stream, 
  username, 
  avatarUrl, 
  isLocal = false,
  isBroadcasting = false,
  roleBadge,
  aiEnhanced = false
}, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [useCanvas, setUseCanvas] = useState(false);

  // Apply simple real-time sharpening filter via canvas
  const applyEnhancement = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !aiEnhanced) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx || video.paused || video.ended) return;

    // Match canvas size to video
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
    }

    // Draw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Apply sharpening convolution kernel
    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const width = canvas.width;
      const height = canvas.height;

      // Create a copy for the sharpening operation
      const original = new Uint8ClampedArray(data);

      // Sharpening kernel: center = 5, edges = -1
      const sharpenAmount = 0.5; // Moderate sharpening
      
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = (y * width + x) * 4;
          
          for (let c = 0; c < 3; c++) { // RGB channels only
            const center = original[idx + c];
            const top = original[((y - 1) * width + x) * 4 + c];
            const bottom = original[((y + 1) * width + x) * 4 + c];
            const left = original[(y * width + (x - 1)) * 4 + c];
            const right = original[(y * width + (x + 1)) * 4 + c];
            
            // Unsharp mask formula
            const sharpened = center + sharpenAmount * (4 * center - top - bottom - left - right);
            data[idx + c] = Math.max(0, Math.min(255, sharpened));
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
    } catch (e) {
      // Fallback: just draw video
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }

    animationFrameRef.current = requestAnimationFrame(applyEnhancement);
  }, [aiEnhanced]);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Start/stop enhancement loop
  useEffect(() => {
    if (aiEnhanced && stream) {
      setUseCanvas(true);
      // Small delay to ensure video is playing
      const timer = setTimeout(() => {
        applyEnhancement();
      }, 100);
      return () => {
        clearTimeout(timer);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    } else {
      setUseCanvas(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  }, [aiEnhanced, stream, applyEnhancement]);

  return (
    <div 
      ref={ref}
      className={`relative bg-gradient-to-br ${
        isBroadcasting 
          ? 'from-green-500/20 to-emerald-500/20 border-green-500/50' 
          : 'from-muted/50 to-muted/30 border-border'
      } rounded-xl border overflow-hidden aspect-video`}
    >
      {/* Live Badge */}
      {isBroadcasting && (
        <div className="absolute top-2 right-2 z-10 flex gap-1">
          {aiEnhanced && (
            <Badge variant="secondary" className="text-[10px] bg-purple-500/80 text-white">
              <Sparkles className="w-3 h-3 mr-1" />
              AI
            </Badge>
          )}
          <Badge variant="destructive" className="text-[10px] animate-pulse">
            <Video className="w-3 h-3 mr-1" />
            LIVE
          </Badge>
        </div>
      )}

      {/* Local indicator */}
      {isLocal && (
        <div className="absolute top-2 left-2 z-10">
          <Badge variant="secondary" className="text-[10px]">
            You
          </Badge>
        </div>
      )}

      {/* Video or Placeholder */}
      {stream ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isLocal}
            className={`w-full h-full object-cover ${useCanvas ? 'hidden' : ''}`}
          />
          {useCanvas && (
            <canvas
              ref={canvasRef}
              className="w-full h-full object-cover"
            />
          )}
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-muted/50">
          <Avatar className="w-16 h-16">
            <AvatarImage src={avatarUrl || undefined} />
            <AvatarFallback className="text-2xl bg-primary/20">
              {username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <VideoOff className="w-5 h-5 text-muted-foreground" />
        </div>
      )}

      {/* Username overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
        <div className="flex items-center gap-2">
          <span className="text-white text-sm font-medium truncate">{username}</span>
          {roleBadge}
        </div>
      </div>
    </div>
  );
});

VideoTile.displayName = 'VideoTile';

export default VideoTile;
