import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ArtPiece {
  id: string;
  title: string;
  artist: string;
  year: string | null;
  period: string | null;
  medium: string | null;
  image_url: string;
  description: string | null;
}

interface FeaturedArt {
  piece: ArtPiece;
  commentary: string;
  image_url: string;
}

export const useArtCurator = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentArt, setCurrentArt] = useState<FeaturedArt | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchFeaturedArt = useCallback(async (): Promise<FeaturedArt | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('art-curator', {
        body: { action: 'get_featured_art' }
      });

      if (fnError) {
        console.error('Art curator error:', fnError);
        setError('Failed to fetch featured art');
        return null;
      }

      if (data?.piece) {
        const featured: FeaturedArt = {
          piece: data.piece,
          commentary: data.commentary,
          image_url: data.image_url
        };
        setCurrentArt(featured);
        return featured;
      }

      return null;
    } catch (e) {
      console.error('Error fetching art:', e);
      setError('Failed to fetch featured art');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchNewArtPieces = useCallback(async (): Promise<boolean> => {
    try {
      const { data, error: fnError } = await supabase.functions.invoke('art-curator', {
        body: { action: 'fetch_new_art' }
      });

      if (fnError) {
        console.error('Fetch new art error:', fnError);
        return false;
      }

      console.log(`Fetched ${data?.count || 0} new art pieces`);
      return true;
    } catch (e) {
      console.error('Error fetching new art:', e);
      return false;
    }
  }, []);

  return {
    isLoading,
    currentArt,
    error,
    fetchFeaturedArt,
    fetchNewArtPieces,
    setCurrentArt
  };
};
