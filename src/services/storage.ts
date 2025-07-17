// Local Storage Service for BrokieFlix
export interface WatchHistory {
  id: number;
  type: 'movie' | 'tv';
  title: string;
  poster_path: string;
  timestamp: number;
  progress?: number; // For episodes/movies
  season?: number; // For TV shows
  episode?: number; // For TV shows
  episodeTitle?: string; // For TV shows
}

export interface StreamingSource {
  name: string;
  url: string;
  quality: string;
}

class StorageService {
  private readonly CONTINUE_WATCHING_KEY = 'brokieflix_continue_watching';
  private readonly WATCH_HISTORY_KEY = 'brokieflix_watch_history';
  private readonly PREFERRED_SOURCES_KEY = 'brokieflix_preferred_sources';
  private readonly USER_PREFERENCES_KEY = 'brokieflix_preferences';

  // Continue Watching functionality
  getContinueWatching(): WatchHistory[] {
    try {
      const data = localStorage.getItem(this.CONTINUE_WATCHING_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading continue watching data:', error);
      return [];
    }
  }

  addToContinueWatching(item: Omit<WatchHistory, 'timestamp'>) {
    try {
      const continueWatching = this.getContinueWatching();
      const newItem: WatchHistory = {
        ...item,
        timestamp: Date.now()
      };

      // Remove existing entry for same content
      const filtered = continueWatching.filter(
        existing => !(existing.id === item.id && existing.type === item.type)
      );

      // Add new item to beginning and limit to 20 items
      const updated = [newItem, ...filtered].slice(0, 20);
      
      localStorage.setItem(this.CONTINUE_WATCHING_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving continue watching data:', error);
    }
  }

  removeFromContinueWatching(id: number, type: 'movie' | 'tv') {
    try {
      const continueWatching = this.getContinueWatching();
      const filtered = continueWatching.filter(
        item => !(item.id === id && item.type === type)
      );
      localStorage.setItem(this.CONTINUE_WATCHING_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing continue watching item:', error);
    }
  }

  clearContinueWatching() {
    try {
      localStorage.removeItem(this.CONTINUE_WATCHING_KEY);
    } catch (error) {
      console.error('Error clearing continue watching:', error);
    }
  }

  // Watch History
  getWatchHistory(): WatchHistory[] {
    try {
      const data = localStorage.getItem(this.WATCH_HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading watch history:', error);
      return [];
    }
  }

  addToWatchHistory(item: Omit<WatchHistory, 'timestamp'>) {
    try {
      const history = this.getWatchHistory();
      const newItem: WatchHistory = {
        ...item,
        timestamp: Date.now()
      };

      // Remove existing entry and add new one to beginning
      const filtered = history.filter(
        existing => !(existing.id === item.id && existing.type === item.type)
      );
      
      const updated = [newItem, ...filtered].slice(0, 100); // Keep last 100 items
      localStorage.setItem(this.WATCH_HISTORY_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving watch history:', error);
    }
  }

  // Streaming Sources
  getPreferredSources(): Record<string, string> {
    try {
      const data = localStorage.getItem(this.PREFERRED_SOURCES_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error reading preferred sources:', error);
      return {};
    }
  }

  setPreferredSource(contentId: string, sourceUrl: string) {
    try {
      const sources = this.getPreferredSources();
      sources[contentId] = sourceUrl;
      localStorage.setItem(this.PREFERRED_SOURCES_KEY, JSON.stringify(sources));
    } catch (error) {
      console.error('Error saving preferred source:', error);
    }
  }

  // User Preferences
  getUserPreferences() {
    try {
      const data = localStorage.getItem(this.USER_PREFERENCES_KEY);
      return data ? JSON.parse(data) : {
        autoplay: true,
        quality: 'auto',
        subtitles: false,
        volume: 1.0
      };
    } catch (error) {
      console.error('Error reading user preferences:', error);
      return {
        autoplay: true,
        quality: 'auto',
        subtitles: false,
        volume: 1.0
      };
    }
  }

  setUserPreferences(preferences: any) {
    try {
      localStorage.setItem(this.USER_PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving user preferences:', error);
    }
  }

  // Helper methods for episode tracking
  saveEpisodeProgress(tvId: number, season: number, episode: number, progress: number) {
    const key = `continue-${tvId}`;
    const title = this.getShowTitleFromHistory(tvId) || 'Unknown Show';
    
    this.addToContinueWatching({
      id: tvId,
      type: 'tv',
      title,
      poster_path: this.getShowPosterFromHistory(tvId) || '',
      progress,
      season,
      episode
    });
  }

  getEpisodeProgress(tvId: number, season: number, episode: number): number {
    const continueWatching = this.getContinueWatching();
    const item = continueWatching.find(
      item => item.id === tvId && item.type === 'tv' && 
               item.season === season && item.episode === episode
    );
    return item?.progress || 0;
  }

  private getShowTitleFromHistory(tvId: number): string | null {
    const history = this.getWatchHistory();
    const item = history.find(h => h.id === tvId && h.type === 'tv');
    return item?.title || null;
  }

  private getShowPosterFromHistory(tvId: number): string | null {
    const history = this.getWatchHistory();
    const item = history.find(h => h.id === tvId && h.type === 'tv');
    return item?.poster_path || null;
  }
}

export const storageService = new StorageService();