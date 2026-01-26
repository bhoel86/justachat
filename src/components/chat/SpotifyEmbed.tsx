import React from 'react';

interface SpotifyEmbedProps {
  playlistId?: string;
  className?: string;
}

// Default playlist - can be changed to any public Spotify playlist
const DEFAULT_PLAYLIST_ID = '7HlTC97fdMbode7ke12M22';

export const SpotifyEmbed: React.FC<SpotifyEmbedProps> = ({ 
  playlistId = DEFAULT_PLAYLIST_ID,
  className = ''
}) => {
  return (
    <div className={`w-full rounded-lg overflow-hidden ${className}`}>
      <iframe
        title="Spotify Embed: Recommendation Playlist"
        src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`}
        width="100%"
        height="100%"
        style={{ minHeight: '360px', borderRadius: '12px' }}
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      />
    </div>
  );
};

export default SpotifyEmbed;
