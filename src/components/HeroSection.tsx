import { useState, useEffect } from 'react';
import { Play, Info, Star } from 'lucide-react';
import { tmdbService, Movie, TVShow } from '../services/tmdb';
import { useNavigate } from 'react-router-dom';

interface HeroSectionProps {
  content?: Movie | TVShow;
}

export const HeroSection = ({ content }: HeroSectionProps) => {
  const [currentContent, setCurrentContent] = useState<Movie | TVShow | null>(content || null);
  const [heroItems, setHeroItems] = useState<(Movie | TVShow)[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(!content);
  const navigate = useNavigate();

  useEffect(() => {
    if (!content) {
      loadHeroContent();
    }
  }, [content]);

  useEffect(() => {
    if (heroItems.length > 0 && !content) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % heroItems.length);
      }, 8000); // Change every 8 seconds

      return () => clearInterval(interval);
    }
  }, [heroItems.length, content]);

  useEffect(() => {
    if (heroItems.length > 0 && !content) {
      setCurrentContent(heroItems[currentIndex]);
    }
  }, [currentIndex, heroItems, content]);

  const loadHeroContent = async () => {
    try {
      setIsLoading(true);
      const [trending, topMovies, topTV] = await Promise.all([
        tmdbService.getTrending('all', 'day'),
        tmdbService.getTopRatedMovies(),
        tmdbService.getTopRatedTVShows()
      ]);

      // Mix content from different sources for variety
      const allContent = [
        ...trending.results.slice(0, 3),
        ...topMovies.results.slice(0, 2),
        ...topTV.results.slice(0, 2)
      ].filter(item => item.backdrop_path); // Only items with backdrop images

      setHeroItems(allContent);
      if (allContent.length > 0) {
        setCurrentContent(allContent[0]);
      }
    } catch (error) {
      console.error('Error loading hero content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlay = () => {
    if (!currentContent) return;

    const isMovie = 'title' in currentContent;
    if (isMovie) {
      navigate(`/player?type=movie&id=${currentContent.id}`);
    } else {
      navigate(`/player?type=tv&id=${currentContent.id}`);
    }
  };

  const handleInfo = () => {
    if (!currentContent) return;

    const isMovie = 'title' in currentContent;
    navigate(`/info?type=${isMovie ? 'movie' : 'tv'}&id=${currentContent.id}`);
  };

  if (isLoading) {
    return (
      <div className="relative h-[70vh] md:h-[85vh] flex items-center justify-center">
        <div className="shimmer w-full h-full rounded-lg"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground">Loading amazing content...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentContent) {
    return null;
  }

  const isMovie = 'title' in currentContent;
  const title = isMovie ? currentContent.title : currentContent.name;
  const releaseDate = isMovie ? currentContent.release_date : currentContent.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : '';
  const backdropUrl = tmdbService.getBackdropUrl(currentContent.backdrop_path, 'w1280');

  return (
    <div className="relative h-[70vh] md:h-[85vh] overflow-hidden">
      {/* Background Image with Gradient Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-105 transition-transform duration-[8000ms] ease-in-out"
        style={{ 
          backgroundImage: `url(${backdropUrl})`,
        }}
      />
      
      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
      
      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl space-y-6 text-reveal">
            {/* Title */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
              {title}
            </h1>
            
            {/* Meta Info */}
            <div className="flex items-center space-x-4 text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span>{currentContent.vote_average.toFixed(1)}</span>
              </div>
              {year && <span>{year}</span>}
              <span className="px-2 py-1 bg-primary/20 text-primary rounded text-sm font-medium">
                {isMovie ? 'Movie' : 'TV Series'}
              </span>
            </div>
            
            {/* Overview */}
            <p className="text-lg md:text-xl text-foreground/90 leading-relaxed line-clamp-3">
              {currentContent.overview}
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handlePlay}
                className="btn-primary flex items-center justify-center space-x-2 text-lg"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Play Now</span>
              </button>
              
              <button
                onClick={handleInfo}
                className="btn-secondary flex items-center justify-center space-x-2 text-lg"
              >
                <Info className="w-5 h-5" />
                <span>More Info</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Navigation Dots */}
      {heroItems.length > 1 && !content && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {heroItems.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-primary scale-125' 
                  : 'bg-foreground/30 hover:bg-foreground/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};