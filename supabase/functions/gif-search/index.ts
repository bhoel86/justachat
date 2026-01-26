import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const KLIPY_API_KEY = Deno.env.get('KLIPY_API_KEY');
    if (!KLIPY_API_KEY) {
      throw new Error('KLIPY_API_KEY not configured');
    }

    const { query, trending, limit = 20 } = await req.json();

    // Klipy API format: https://api.klipy.com/api/v1/{API_KEY}/gifs/{endpoint}
    let url: string;
    if (trending) {
      url = `https://api.klipy.com/api/v1/${KLIPY_API_KEY}/gifs/trending?limit=${limit}`;
    } else {
      url = `https://api.klipy.com/api/v1/${KLIPY_API_KEY}/gifs/search?q=${encodeURIComponent(query || '')}&limit=${limit}`;
    }

    console.log(`Fetching GIFs: ${trending ? 'trending' : `search: ${query}`}`);

    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Klipy API error:', response.status, errorText);
      throw new Error(`Klipy API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Klipy response structure: { result: true, data: { data: [...] } }
    const gifs = data?.data?.data || [];
    console.log(`Found ${gifs.length} GIFs`);
    
    const results = gifs.map((item: any) => {
      // Get the best available URL: prefer webp for preview (smaller), gif for full
      const hd = item.file?.hd || {};
      const md = item.file?.md || {};
      const sd = item.file?.sd || {};
      
      // For preview, use smaller version
      const previewUrl = sd?.webp?.url || sd?.gif?.url || md?.webp?.url || md?.gif?.url || hd?.webp?.url || hd?.gif?.url || '';
      // For full GIF, use best quality
      const fullUrl = hd?.gif?.url || md?.gif?.url || sd?.gif?.url || hd?.webp?.url || '';
      
      return {
        id: item.id?.toString() || item.slug || crypto.randomUUID(),
        title: item.title || '',
        preview: previewUrl,
        url: fullUrl,
      };
    });

    console.log(`Mapped ${results.length} GIFs`);

    return new Response(
      JSON.stringify({ results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('GIF search error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage, results: [] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
