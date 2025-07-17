// TMDb API Service for BrokieFlix
const TMDB_API_KEY = 'REALAPIKEY'; // Replace with actual API key
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  adult: boolean;
  popularity: number;
  media_type?: 'movie';
}

export interface TVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  first_air_date: string;
  vote_average: number;
  genre_ids: number[];
  popularity: number;
  media_type?: 'tv';
}

export interface Person {
  id: number;
  name: string;
  profile_path: string;
  known_for_department: string;
  popularity: number;
  known_for: (Movie | TVShow)[];
}

export interface Genre {
  id: number;
  name: string;
}

export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string;
  order: number;
}

export interface Season {
  id: number;
  season_number: number;
  name: string;
  episode_count: number;
  poster_path: string;
  air_date: string;
}

export interface Episode {
  id: number;
  episode_number: number;
  season_number: number;
  name: string;
  overview: string;
  still_path: string;
  air_date: string;
  runtime: number;
  vote_average: number;
}

export interface DetailedMovie extends Movie {
  genres: Genre[];
  runtime: number;
  production_companies: any[];
  spoken_languages: any[];
  credits: {
    cast: Cast[];
    crew: any[];
  };
}

export interface DetailedTVShow extends TVShow {
  genres: Genre[];
  seasons: Season[];
  number_of_episodes: number;
  number_of_seasons: number;
  episode_run_time: number[];
  created_by: any[];
  credits: {
    cast: Cast[];
    crew: any[];
  };
}

class TMDbService {
  private async fetchFromAPI(endpoint: string, params: Record<string, string> = {}) {
    const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
    url.searchParams.append('api_key', TMDB_API_KEY);
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    try {
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`TMDb API error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('TMDb API fetch error:', error);
      throw error;
    }
  }

  // Image URL helpers
  getImageUrl(path: string, size: string = 'w500'): string {
    if (!path) return '/placeholder-poster.jpg';
    return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
  }

  getBackdropUrl(path: string, size: string = 'w1280'): string {
    if (!path) return '/placeholder-backdrop.jpg';
    return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
  }

  // Trending content
  async getTrending(mediaType: 'all' | 'movie' | 'tv' = 'all', timeWindow: 'day' | 'week' = 'day') {
    return this.fetchFromAPI(`/trending/${mediaType}/${timeWindow}`);
  }

  // Popular content
  async getPopularMovies(page: number = 1) {
    return this.fetchFromAPI('/movie/popular', { page: page.toString() });
  }

  async getPopularTVShows(page: number = 1) {
    return this.fetchFromAPI('/tv/popular', { page: page.toString() });
  }

  // Top rated content
  async getTopRatedMovies(page: number = 1) {
    return this.fetchFromAPI('/movie/top_rated', { page: page.toString() });
  }

  async getTopRatedTVShows(page: number = 1) {
    return this.fetchFromAPI('/tv/top_rated', { page: page.toString() });
  }

  // Search
  async searchMulti(query: string, page: number = 1) {
    return this.fetchFromAPI('/search/multi', { 
      query: encodeURIComponent(query), 
      page: page.toString() 
    });
  }

  async searchMovies(query: string, page: number = 1) {
    return this.fetchFromAPI('/search/movie', { 
      query: encodeURIComponent(query), 
      page: page.toString() 
    });
  }

  async searchTVShows(query: string, page: number = 1) {
    return this.fetchFromAPI('/search/tv', { 
      query: encodeURIComponent(query), 
      page: page.toString() 
    });
  }

  async searchPeople(query: string, page: number = 1) {
    return this.fetchFromAPI('/search/person', { 
      query: encodeURIComponent(query), 
      page: page.toString() 
    });
  }

  // Details
  async getMovieDetails(movieId: number): Promise<DetailedMovie> {
    return this.fetchFromAPI(`/movie/${movieId}`, { append_to_response: 'credits' });
  }

  async getTVShowDetails(tvId: number): Promise<DetailedTVShow> {
    return this.fetchFromAPI(`/tv/${tvId}`, { append_to_response: 'credits' });
  }

  async getPersonDetails(personId: number) {
    return this.fetchFromAPI(`/person/${personId}`, { 
      append_to_response: 'movie_credits,tv_credits' 
    });
  }

  // TV Show specific
  async getTVShowSeason(tvId: number, seasonNumber: number) {
    return this.fetchFromAPI(`/tv/${tvId}/season/${seasonNumber}`);
  }

  async getTVShowEpisode(tvId: number, seasonNumber: number, episodeNumber: number) {
    return this.fetchFromAPI(`/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`);
  }

  // Genres
  async getMovieGenres() {
    return this.fetchFromAPI('/genre/movie/list');
  }

  async getTVGenres() {
    return this.fetchFromAPI('/genre/tv/list');
  }

  // Recommendations
  async getMovieRecommendations(movieId: number, page: number = 1) {
    return this.fetchFromAPI(`/movie/${movieId}/recommendations`, { 
      page: page.toString() 
    });
  }

  async getTVShowRecommendations(tvId: number, page: number = 1) {
    return this.fetchFromAPI(`/tv/${tvId}/recommendations`, { 
      page: page.toString() 
    });
  }
}

export const tmdbService = new TMDbService();
