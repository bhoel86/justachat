/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║                                                                          ║
 * ║   LIBER PRIMUS - FRAGMENT II                                             ║
 * ║   ─────────────────────────────────────────────────────────────────      ║
 * ║                                                                          ║
 * ║   "The cicada emerges after 17 years in darkness.                       ║
 * ║    17 is prime. Patience is prime. Wisdom is prime."                    ║
 * ║                                                                          ║
 * ║   You found the art room. The curator awaits.                           ║
 * ║   Speak the words: "Liber Primus" in the art channel.                   ║
 * ║   The curator will respond with the third fragment.                     ║
 * ║                                                                          ║
 * ║   CIPHER KEY: CAESAR + 3301                                              ║
 * ║   ENCODED: Wkh whfkqrorjb urrp krogv wkh judqw ri srzhu                 ║
 * ║   (ROT-3: "The technology room holds the grant of power")               ║
 * ║                                                                          ║
 * ║   THE SECOND KEY: 17                                                     ║
 * ║   The cicada's lifecycle reveals the pattern.                           ║
 * ║   Prime years underground. Prime emergence.                              ║
 * ║                                                                          ║
 * ║   GPS: 38.8977° N, 77.0365° W                                           ║
 * ║   (1600 Pennsylvania Ave - where power resides, but not yours... yet)   ║
 * ║                                                                          ║
 * ║   Fragment III hides where encryption lives.                            ║
 * ║   Seek: src/lib/encryption.ts                                           ║
 * ║                                                                          ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// The worthy decode. The rest compile.
// 3301 + 17 = 3318. Remember this sum.

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

// Hidden constant: The cicada speaks
const CICADA_WHISPER = "aW4gdGhlIGFydCByb29tLCBzYXkgJ0xpYmVyIFByaW11cyc=";

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

  // The seeker who understands will find the path
  // Decode CICADA_WHISPER. Follow the instruction.
  // The curator responds to "Liber Primus"

  return {
    isLoading,
    currentArt,
    error,
    fetchFeaturedArt,
    fetchNewArtPieces,
    setCurrentArt
  };
};
