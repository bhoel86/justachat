import { useState, useEffect, forwardRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Volume2, Users, Headphones } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceChannel {
  id: string;
  name: string;
  userCount: number;
}

interface VoiceChannelListProps {
  onJoinChannel: (channelId: string, channelName: string) => void;
  currentChannelId?: string;
  compact?: boolean;
}

const DEFAULT_VOICE_CHANNELS: VoiceChannel[] = [
  { id: 'voice-lounge', name: 'Voice Lounge', userCount: 0 },
  { id: 'voice-gaming', name: 'Gaming Chat', userCount: 0 },
  { id: 'voice-music', name: 'Music Room', userCount: 0 },
  { id: 'voice-chill', name: 'Chill Zone', userCount: 0 },
];

const VoiceChannelList = forwardRef<HTMLDivElement, VoiceChannelListProps>(
  ({ onJoinChannel, currentChannelId, compact = false }, ref) => {
    const [channels] = useState<VoiceChannel[]>(DEFAULT_VOICE_CHANNELS);
    const [userCounts, setUserCounts] = useState<Record<string, number>>({});

    // Subscribe to presence for each channel
    useEffect(() => {
      const subscriptions: ReturnType<typeof supabase.channel>[] = [];

      channels.forEach(channel => {
        const sub = supabase.channel(`voice:${channel.id}`)
          .on('presence', { event: 'sync' }, () => {
            const state = sub.presenceState();
            setUserCounts(prev => ({
              ...prev,
              [channel.id]: Object.keys(state).length,
            }));
          })
          .subscribe();
        
        subscriptions.push(sub);
      });

      return () => {
        subscriptions.forEach(sub => supabase.removeChannel(sub));
      };
    }, [channels]);

    if (compact) {
      // Compact mode for channel list sidebar
      return (
        <div ref={ref} className="space-y-1">
          {channels.map(channel => {
            const count = userCounts[channel.id] || 0;
            const isActive = currentChannelId === channel.id;
            
            return (
              <button
                key={channel.id}
                onClick={() => !isActive && onJoinChannel(channel.id, channel.name)}
                className={cn(
                  "w-full px-2 py-1.5 rounded-md flex items-center gap-2 transition-all text-sm",
                  "hover:bg-muted/50",
                  isActive && "bg-primary/10 text-primary"
                )}
              >
                <Volume2 className={cn(
                  "h-3.5 w-3.5",
                  count > 0 ? "text-green-500" : "text-muted-foreground"
                )} />
                <span className="truncate flex-1 text-left">{channel.name}</span>
                {count > 0 && (
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <Users className="h-2.5 w-2.5" />
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      );
    }

    // Full card mode for dedicated voice page
    return (
      <div ref={ref} className="bg-card/50 backdrop-blur-sm rounded-lg border border-border">
        <div className="p-3 border-b border-border">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Headphones className="h-4 w-4 text-primary" />
            Voice Channels
          </h3>
        </div>
        <div className="p-2 space-y-1">
          {channels.map(channel => {
            const count = userCounts[channel.id] || 0;
            const isActive = currentChannelId === channel.id;
            
            return (
              <button
                key={channel.id}
                onClick={() => !isActive && onJoinChannel(channel.id, channel.name)}
                className={cn(
                  "w-full p-3 rounded-lg flex items-center gap-3 transition-all",
                  "hover:bg-muted/50",
                  isActive && "bg-primary/10 ring-1 ring-primary/50"
                )}
              >
                <div className={cn(
                  "p-2 rounded-full",
                  count > 0 ? "bg-green-500/20" : "bg-muted"
                )}>
                  <Volume2 className={cn(
                    "h-4 w-4",
                    count > 0 ? "text-green-500" : "text-muted-foreground"
                  )} />
                </div>
                
                <div className="flex-1 text-left">
                  <div className="font-medium text-sm">{channel.name}</div>
                  {count > 0 && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {count} {count === 1 ? 'user' : 'users'}
                    </div>
                  )}
                </div>
                
                {isActive && (
                  <div className="px-2 py-0.5 bg-green-500 rounded text-xs text-white font-medium">
                    Connected
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }
);

VoiceChannelList.displayName = 'VoiceChannelList';

export default VoiceChannelList;
