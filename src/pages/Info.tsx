import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Play, Info as InfoIcon, Star, Calendar, Clock, Users, Download } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { ContentRow } from '../components/ContentRow';
import { tmdbService, DetailedMovie, DetailedTVShow, Cast } from '../services/tmdb';
import { streamingService } from '../services/streaming';
import { storageService } from '../services/storage';
import { useNavigate } from 'react-router-dom';

export const Info = () => {
  const [searchParams] = useSearchParams();
  const [content, setContent] = useState<DetailedMovie | DetailedTVShow | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [downloadLinks, setDownloadLinks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFullOverview, setShowFullOverview] = useState(false);
  const navigate = useNavigate();

  const type = searchParams.get('type') as 'movie' | 'tv';
  const id = searchParams.get('id');

  useEffect(() => {
    if (type && id) {
      loadContent();
    }
  }, [type, id]);

  const loadContent = async () => {
    if (!type || !id) return;

    try {
      setIsLoading(true);
      
      const [contentData, recommendationsData, downloads] = await Promise.all([
        type === 'movie' 
          ? tmdbService.getMovieDetails(parseInt(id))
          : tmdbService.getTVShowDetails(parseInt(id)),
        type === 'movie'
          ? tmdbService.getMovieRecommendations(parseInt(id))
          : tmdbService.getTVShowRecommendations(parseInt(id)),
        streamingService.getDownloadLinks(parseInt(id), type)
      ]);

      setContent(contentData);
      setRecommendations(recommendationsData.results || []);
      setDownloadLinks(downloads);
    } catch (error) {
      console.error('Error loading content details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlay = () => {
    if (!content) return;

    // Add to continue watching
    const isMovie = 'title' in content;
    storageService.addToContinueWatching({
      id: content.id,
      type: isMovie ? 'movie' : 'tv',
      title: isMovie ? content.title : content.name,
      poster_path: content.poster_path
    });

    // Navigate to player
    navigate(`/player?type=${type}&id=${content.id}`);
  };

  const handleCastClick = (person: Cast) => {
    navigate(`/person?id=${person.id}`);
  };

  const handleGenreClick = (genreId: number) => {
    // Could implement genre-based search
    navigate(`/search?genre=${genreId}`);
  };

  if (isLoading || !content) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20">
          <div className="shimmer h-96 w-full"></div>
          <div className="container mx-auto px-4 py-8 space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="shimmer h-8 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const isMovie = 'title' in content;
  const title = isMovie ? content.title : content.name;
  const releaseDate = isMovie ? content.release_date : content.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : '';
  const runtime = isMovie ? content.runtime : content.episode_run_time?.[0];
  const backdropUrl = tmdbService.getBackdropUrl(content.backdrop_path, 'w1280');
  const posterUrl = tmdbService.getImageUrl(content.poster_path, 'w500');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        
        <div className="relative h-full flex items-end pb-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-8 items-end">
              {/* Poster */}
              <div className="flex-shrink-0">
                <img
                  src={posterUrl}
                  alt={title}
                  className="w-48 md:w-64 aspect-[2/3] object-cover rounded-lg shadow-xl glow-border"
                />
              </div>
              
              {/* Content Info */}
              <div className="space-y-4 flex-1">
                <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
                  {title}
                </h1>
                
                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <span className="text-lg font-semibold">
                      {content.vote_average.toFixed(1)}
                    </span>
                  </div>
                  {year && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{year}</span>
                    </div>
                  )}
                  {runtime && (
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{runtime} min</span>
                    </div>
                  )}
                  <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium">
                    {isMovie ? 'Movie' : 'TV Series'}
                  </span>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handlePlay}
                    className="btn-primary flex items-center justify-center space-x-2 text-lg"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    <span>Play Now</span>
                  </button>
                  
                  {downloadLinks.length > 0 && (
                    <div className="relative group">
                      <button className="btn-secondary flex items-center justify-center space-x-2 text-lg">
                        <Download className="w-5 h-5" />
                        <span>Download</span>
                      </button>
                      
                      {/* Download Dropdown */}
                      <div className="absolute top-full left-0 mt-2 w-64 bg-surface border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10">
                        <div className="p-2 space-y-1">
                          {downloadLinks.map((link, index) => (
                            <a
                              key={index}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block px-3 py-2 text-sm text-foreground hover:bg-surface-elevated rounded-md transition-colors duration-200"
                            >
                              <div className="flex justify-between items-center">
                                <span>{link.quality}</span>
                                <span className="text-muted-foreground">{link.size}</span>
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Details */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Overview and Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Overview */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Overview</h2>
              <p className={`text-foreground/90 leading-relaxed ${!showFullOverview ? 'line-clamp-3' : ''}`}>
                {content.overview}
              </p>
              {content.overview.length > 200 && (
                <button
                  onClick={() => setShowFullOverview(!showFullOverview)}
                  className="mt-2 text-primary hover:text-primary-glow transition-colors duration-300"
                >
                  {showFullOverview ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>

            {/* Genres */}
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Genres</h3>
              <div className="flex flex-wrap gap-2">
                {content.genres.map((genre) => (
                  <button
                    key={genre.id}
                    onClick={() => handleGenreClick(genre.id)}
                    className="px-3 py-1 bg-surface border border-border rounded-full text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
                  >
                    {genre.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Additional Info */}
          <div className="space-y-6">
            <div className="bg-surface rounded-lg p-6 border border-border">
              <h3 className="text-xl font-semibold text-foreground mb-4">Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Release Date</span>
                  <span className="text-foreground">{releaseDate}</span>
                </div>
                {runtime && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Runtime</span>
                    <span className="text-foreground">{runtime} minutes</span>
                  </div>
                )}
                {!isMovie && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Seasons</span>
                      <span className="text-foreground">{content.number_of_seasons}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Episodes</span>
                      <span className="text-foreground">{content.number_of_episodes}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rating</span>
                  <span className="text-foreground">{content.vote_average.toFixed(1)}/10</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cast */}
        {content.credits?.cast && content.credits.cast.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Cast</h2>
            <div className="flex space-x-4 overflow-x-auto custom-scrollbar pb-4">
              {content.credits.cast.slice(0, 20).map((person) => (
                <div
                  key={person.id}
                  className="flex-shrink-0 w-32 cursor-pointer group"
                  onClick={() => handleCastClick(person)}
                >
                  <div className="relative overflow-hidden rounded-lg mb-2">
                    <img
                      src={tmdbService.getImageUrl(person.profile_path, 'w185')}
                      alt={person.name}
                      className="w-full aspect-[2/3] object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                  <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
                    {person.name}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {person.character}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <ContentRow
            title="More Like This"
            items={recommendations}
          />
        )}
      </div>
    </div>
  );
};