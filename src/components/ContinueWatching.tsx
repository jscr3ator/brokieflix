import { useState, useEffect } from 'react';
import { X, Play, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { storageService, WatchHistory } from '../services/storage';
import { tmdbService } from '../services/tmdb';
import { useNavigate } from 'react-router-dom';

export const ContinueWatching = () => {
  const [continueWatching, setContinueWatching] = useState<WatchHistory[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  
  const itemsPerPage = 4;

  useEffect(() => {
    loadContinueWatching();
  }, []);

  const loadContinueWatching = () => {
    const items = storageService.getContinueWatching();
    setContinueWatching(items);
  };

  const handleRemove = (id: number, type: 'movie' | 'tv') => {
    storageService.removeFromContinueWatching(id, type);
    loadContinueWatching();
  };

  const handlePlay = (item: WatchHistory) => {
    if (item.type === 'movie') {
      navigate(`/player?type=movie&id=${item.id}`);
    } else {
      if (item.season && item.episode) {
        navigate(`/episode?id=${item.id}&season=${item.season}&episode=${item.episode}`);
      } else {
        navigate(`/player?type=tv&id=${item.id}`);
      }
    }
  };

  const formatLastWatched = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return 'Recently watched';
    }
  };

  const getProgressPercentage = (progress?: number) => {
    return progress ? Math.min(Math.max(progress, 0), 100) : 0;
  };

  const canGoNext = currentIndex + itemsPerPage < continueWatching.length;
  const canGoPrev = currentIndex > 0;

  const nextSlide = () => {
    if (canGoNext) {
      setCurrentIndex(prev => prev + itemsPerPage);
    }
  };

  const prevSlide = () => {
    if (canGoPrev) {
      setCurrentIndex(prev => Math.max(0, prev - itemsPerPage));
    }
  };

  const visibleItems = continueWatching.slice(currentIndex, currentIndex + itemsPerPage);

  if (continueWatching.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-4">
        <h2 className="text-2xl font-bold text-foreground">Continue Watching</h2>
        <div className="flex items-center space-x-4">
          {continueWatching.length > itemsPerPage && (
            <div className="flex items-center space-x-2">
              <button
                onClick={prevSlide}
                disabled={!canGoPrev}
                className="p-2 rounded-full bg-surface hover:bg-surface-elevated disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                <ChevronLeft size={20} className="text-foreground" />
              </button>
              <button
                onClick={nextSlide}
                disabled={!canGoNext}
                className="p-2 rounded-full bg-surface hover:bg-surface-elevated disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                <ChevronRight size={20} className="text-foreground" />
              </button>
            </div>
          )}
          <button
            onClick={() => {
              storageService.clearContinueWatching();
              loadContinueWatching();
              setCurrentIndex(0);
            }}
            className="text-muted-foreground hover:text-primary transition-colors duration-300 text-sm"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {visibleItems.map((item) => {
            const posterUrl = tmdbService.getImageUrl(item.poster_path, 'w300');
            const progressPercentage = getProgressPercentage(item.progress);

            return (
              <div
                key={`${item.id}-${item.type}-${item.timestamp}`}
                className="relative group bg-surface rounded-lg overflow-hidden hover:bg-surface-elevated transition-colors duration-300 glow-border"
              >
                {/* Remove Button */}
                <button
                  onClick={() => handleRemove(item.id, item.type)}
                  className="absolute top-2 right-2 z-10 w-8 h-8 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-all duration-300 opacity-0 group-hover:opacity-100"
                >
                  <X size={16} />
                </button>

                <div className="flex">
                  {/* Poster */}
                  <div className="relative w-24 h-36 flex-shrink-0">
                    <img
                      src={posterUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    
                    {/* Play Overlay */}
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => handlePlay(item)}
                        className="p-2 bg-primary/80 backdrop-blur-sm rounded-full hover:bg-primary hover:scale-110 transition-all duration-300"
                      >
                        <Play className="w-4 h-4 fill-current text-white" />
                      </button>
                    </div>

                    {/* Progress Bar */}
                    {progressPercentage > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Content Info */}
                  <div className="flex-1 p-3 space-y-2">
                    <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-300">
                      {item.title}
                    </h3>

                    {/* Episode Info for TV Shows */}
                    {item.type === 'tv' && item.season && item.episode && (
                      <p className="text-sm text-muted-foreground">
                        S{item.season}E{item.episode}
                        {item.episodeTitle && ` • ${item.episodeTitle}`}
                      </p>
                    )}

                    {/* Last Watched */}
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <Clock size={12} />
                      <span>{formatLastWatched(item.timestamp)}</span>
                    </div>

                    {/* Progress Text */}
                    {progressPercentage > 0 && (
                      <div className="text-xs text-accent">
                        {progressPercentage.toFixed(0)}% watched
                      </div>
                    )}

                    {/* Media Type Badge */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded">
                        {item.type === 'movie' ? 'Movie' : 'TV Show'}
                      </span>
                      
                      <button
                        onClick={() => handlePlay(item)}
                        className="text-xs text-primary hover:text-primary-glow transition-colors duration-300 font-medium"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};