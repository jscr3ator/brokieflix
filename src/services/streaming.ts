// Streaming Sources Service for BrokieFlix
export interface StreamingSource {
  name: string;
  url: string;
  quality: string;
  type: 'embed' | 'direct';
}

export interface DownloadLink {
  quality: string;
  size: string;
  url: string;
}

class StreamingService {
  // Get streaming sources for movies
  async getMovieSources(tmdbId: number, title: string, year?: string): Promise<StreamingSource[]> {
    const sources: StreamingSource[] = [];
    
    try {
      sources.push({
        name: 'Vidlink',
        url: `https://vidlink.pro/movie/${tmdbId}`,
        quality: 'Auto',
        type: 'embed'
      });

      sources.push({
        name: 'Vidsrc',
        url: `https://vidsrc.xyz/embed/movie/${tmdbId}`,
        quality: 'Auto',
        type: 'embed'
      });

      sources.push({
        name: '2Embed',
        url: `https://www.2embed.cc/embed/${tmdbId}`,
        quality: 'HD',
        type: 'embed'
      });

      sources.push({
        name: 'Vidjoy',
        url: `https://vidjoy.pro/embed/movie/${tmdbId}`,
        quality: 'HD',
        type: 'embed'
      });

      sources.push({
        name: 'Vidfast',
        url: `https://vidfast.pro/movie/${tmdbId}`,
        quality: 'HD',
        type: 'embed'
      });

      sources.push({
        name: 'Vidzee',
        url: `https://player.vidzee.wtf/embed/movie/${tmdbId}`,
        quality: 'HD',
        type: 'embed'
      });

      sources.push({
        name: 'Videasy',
        url: `https://player.videasy.net/movie/${tmdbId}`,
        quality: 'HD',
        type: 'embed'
      });

      sources.push({
        name: 'Embed.su',
        url: `https://embed.su/embed/movie/${tmdbId}`,
        quality: 'HD',
        type: 'embed'
      });

    } catch (error) {
      console.error('Error getting movie sources:', error);
    }

    return sources;
  }

  // Get streaming sources for TV episodes
  async getTVSources(tmdbId: number, season: number, episode: number, title: string): Promise<StreamingSource[]> {
    const sources: StreamingSource[] = [];
    
    try {
      sources.push({
        name: 'Vidlink',
        url: `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}`,
        quality: 'Auto',
        type: 'embed'
      });

      sources.push({
        name: 'Vidsrc',
        url: `https://vidsrc.xyz/embed/tv/${tmdbId}/${season}/${episode}`,
        quality: 'Auto',
        type: 'embed'
      });

      sources.push({
        name: '2Embed',
        url: `https://www.2embed.cc/embedtv/${tmdbId}&s=${season}&e=${episode}`,
        quality: 'HD',
        type: 'embed'
      });

      sources.push({
        name: 'Vidjoy',
        url: `https://vidjoy.pro/embed/tv/${season}/${tmdbId}`,
        quality: 'HD',
        type: 'embed'
      });

      sources.push({
        name: 'Vidfast',
        url: `https://vidfast.pro/tv/${tmdbId}/${season}/${episode}`,
        quality: 'HD',
        type: 'embed'
      });

      sources.push({
        name: 'Vidzee',
        url: `https://player.vidzee.wtf/embed/tv/${season}/${tmdbId}`,
        quality: 'HD',
        type: 'embed'
      });

      sources.push({
        name: 'Videasy',
        url: `https://player.videasy.net/tv/${tmdbId}/${season}/${episode}`,
        quality: 'HD',
        type: 'embed'
      });

      sources.push({
        name: 'Embed.su',
        url: `https://embed.su/embed/tv/${tmdbId}/${season}/${episode}`,
        quality: 'HD',
        type: 'embed'
      });

    } catch (error) {
      console.error('Error getting TV sources:', error);
    }

    return sources;
  }

  // Get download links using the provided API
  async getDownloadLinks(tmdbId: number, type: 'movie' | 'tv', season?: number, episode?: number): Promise<DownloadLink[]> {
    try {
      let url: string;
      
      if (type === 'movie') {
        url = `https://dl.vidzee.wtf/download/movie/v1/${tmdbId}`;
      } else if (type === 'tv' && season && episode) {
        url = `https://dl.vidzee.wtf/download/tv/v1/${tmdbId}/${season}/${episode}`;
      } else {
        return [];
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      
      if (data.success && data.downloads) {
        return data.downloads.map((download: any) => ({
          quality: download.quality || 'Unknown',
          size: download.size || 'Unknown',
          url: download.url
        }));
      }
    } catch (error) {
      console.error('Error fetching download links:', error);
    }

    return [];
  }

  // Get the best available source based on user preferences
  getBestSource(sources: StreamingSource[], preferredQuality: string = 'Auto'): StreamingSource | null {
    if (sources.length === 0) return null;

    // Prefer sources with the requested quality
    const qualityMatch = sources.find(source => 
      source.quality.toLowerCase() === preferredQuality.toLowerCase()
    );

    if (qualityMatch) return qualityMatch;

    // Fallback to first available source
    return sources[0];
  }

  // Check if a source is available
  async isSourceAvailable(url: string): Promise<boolean> {
    try {
      // For embed sources, we'll assume they're available
      // In a real implementation, you might want to check the iframe source
      return true;
    } catch (error) {
      console.error('Error checking source availability:', error);
      return false;
    }
  }

  // Generate iframe HTML for embedding
  generateEmbedHTML(source: StreamingSource): string {
    return `
      <iframe 
        src="${source.url}" 
        width="100%" 
        height="100%" 
        frameborder="0" 
        allowfullscreen
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
      ></iframe>
    `;
  }

  // Get subtitle options (placeholder for future implementation)
  async getSubtitles(tmdbId: number, type: 'movie' | 'tv', season?: number, episode?: number): Promise<any[]> {
    // This would integrate with subtitle APIs like OpenSubtitles
    return [];
  }
}

export const streamingService = new StreamingService();