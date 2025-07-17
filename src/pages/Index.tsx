import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { HeroSection } from '../components/HeroSection';
import { ContentRow } from '../components/ContentRow';
import { ContinueWatching } from '../components/ContinueWatching';
import { tmdbService, Movie, TVShow } from '../services/tmdb';

const Index = () => {
  const [trendingContent, setTrendingContent] = useState<(Movie | TVShow)[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [popularTVShows, setPopularTVShows] = useState<TVShow[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [topRatedTVShows, setTopRatedTVShows] = useState<TVShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setIsLoading(true);
      
      const [
        trending,
        movies,
        tvShows,
        topMovies,
        topTV
      ] = await Promise.all([
        tmdbService.getTrending('all', 'day'),
        tmdbService.getPopularMovies(),
        tmdbService.getPopularTVShows(),
        tmdbService.getTopRatedMovies(),
        tmdbService.getTopRatedTVShows()
      ]);

      setTrendingContent(trending.results);
      setPopularMovies(movies.results);
      setPopularTVShows(tvShows.results);
      setTopRatedMovies(topMovies.results);
      setTopRatedTVShows(topTV.results);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Content Sections */}
      <div className="space-y-12 pb-12">
        {/* Continue Watching */}
        <ContinueWatching />
        
        {/* Trending Now */}
        <ContentRow
          title="Trending Now"
          items={trendingContent}
          isLoading={isLoading}
        />
        
        {/* Popular Movies */}
        <ContentRow
          title="Popular Movies"
          items={popularMovies}
          isLoading={isLoading}
        />
        
        {/* Popular TV Shows */}
        <ContentRow
          title="Popular TV Shows"
          items={popularTVShows}
          isLoading={isLoading}
        />
        
        {/* Top Rated Movies */}
        <ContentRow
          title="Top Rated Movies"
          items={topRatedMovies}
          isLoading={isLoading}
        />
        
        {/* Top Rated TV Shows */}
        <ContentRow
          title="Top Rated TV Shows"
          items={topRatedTVShows}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default Index;
