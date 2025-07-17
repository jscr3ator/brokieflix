import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Star, Play, Info } from 'lucide-react';
import { Movie, TVShow, tmdbService } from '../services/tmdb';
import { useNavigate } from 'react-router-dom';

interface ContentRowProps {
  title: string;
  items: (Movie | TVShow)[];
  isLoading?: boolean;
}

export const ContentRow = ({ title, items, isLoading }: ContentRowProps) => {
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  const handleItemClick = (item: Movie | TVShow) => {
    const isMovie = 'title' in item;
    navigate(`/info?type=${isMovie ? 'movie' : 'tv'}&id=${item.id}`);
  };

  const handlePlay = (e: React.MouseEvent, item: Movie | TVShow) => {
    e.stopPropagation();
    const isMovie = 'title' in item;
    navigate(`/player?type=${isMovie ? 'movie' : 'tv'}&id=${item.id}`);
  };

  const handleInfo = (e: React.MouseEvent, item: Movie | TVShow) => {
    e.stopPropagation();
    handleItemClick(item);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground px-4">{title}</h2>
        <div className="relative px-4">
          <div className="flex space-x-4 overflow-hidden">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex-shrink-0 w-48 md:w-64">
                <div className="shimmer aspect-[2/3] rounded-lg"></div>
                <div className="mt-2 space-y-2">
                  <div className="shimmer h-4 rounded"></div>
                  <div className="shimmer h-3 w-3/4 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground px-4">{title}</h2>
      
      <div className="relative group">
        {/* Left Scroll Button */}
        <button
          onClick={scrollLeft}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-surface/80 backdrop-blur-sm border border-border rounded-full flex items-center justify-center text-foreground hover:bg-surface hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Right Scroll Button */}
        <button
          onClick={scrollRight}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-surface/80 backdrop-blur-sm border border-border rounded-full flex items-center justify-center text-foreground hover:bg-surface hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100"
        >
          <ChevronRight size={20} />
        </button>

        {/* Content Scroll Container */}
        <div
          ref={scrollContainerRef}
          className="flex space-x-4 overflow-x-auto custom-scrollbar px-4 pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item) => {
            const isMovie = 'title' in item;
            const title = isMovie ? item.title : item.name;
            const releaseDate = isMovie ? item.release_date : item.first_air_date;
            const year = releaseDate ? new Date(releaseDate).getFullYear() : '';
            const posterUrl = tmdbService.getImageUrl(item.poster_path, 'w300');

            return (
              <div
                key={item.id}
                className="flex-shrink-0 w-48 md:w-64 cursor-pointer group/item"
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={() => handleItemClick(item)}
              >
                <div className="relative overflow-hidden rounded-lg hover-scale">
                  <img
                    src={posterUrl}
                    alt={title}
                    className="w-full aspect-[2/3] object-cover"
                    loading="lazy"
                  />
                  
                  {/* Hover Overlay */}
                  {hoveredItem === item.id && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center space-x-2 animate-fade-in">
                      <button
                        onClick={(e) => handlePlay(e, item)}
                        className="p-3 bg-primary/80 backdrop-blur-sm rounded-full hover:bg-primary hover:scale-110 transition-all duration-300"
                      >
                        <Play className="w-5 h-5 fill-current text-white" />
                      </button>
                      <button
                        onClick={(e) => handleInfo(e, item)}
                        className="p-3 bg-surface/80 backdrop-blur-sm rounded-full hover:bg-surface hover:scale-110 transition-all duration-300"
                      >
                        <Info className="w-5 h-5 text-foreground" />
                      </button>
                    </div>
                  )}

                  {/* Rating Badge */}
                  <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-md flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <span className="text-xs text-white font-medium">
                      {item.vote_average.toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Content Info */}
                <div className="mt-3 space-y-1">
                  <h3 className="text-foreground font-semibold line-clamp-2 group-hover/item:text-primary transition-colors duration-300">
                    {title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">{year}</span>
                    <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded">
                      {isMovie ? 'Movie' : 'TV'}
                    </span>
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