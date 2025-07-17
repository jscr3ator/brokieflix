import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Star, Clock, Calendar } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { tmdbService, DetailedTVShow, Season, Episode } from '../services/tmdb';

export const Episodes = () => {
  const [searchParams] = useSearchParams();
  const [tvShow, setTVShow] = useState<DetailedTVShow | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const navigate = useNavigate();

  const id = searchParams.get('id');

  useEffect(() => {
    if (id) {
      loadTVShow();
    }
  }, [id]);

  useEffect(() => {
    if (selectedSeason && tvShow) {
      loadEpisodes(selectedSeason.season_number);
    }
  }, [selectedSeason, tvShow]);

  const loadTVShow = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const showData = await tmdbService.getTVShowDetails(parseInt(id));
      setTVShow(showData);
      
      // Set default to first season
      if (showData.seasons && showData.seasons.length > 0) {
        const firstRealSeason = showData.seasons.find(s => s.season_number > 0) || showData.seasons[0];
        setSelectedSeason(firstRealSeason);
      }
    } catch (error) {
      console.error('Error loading TV show:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEpisodes = async (seasonNumber: number) => {
    if (!tvShow) return;

    try {
      setEpisodesLoading(true);
      const seasonData = await tmdbService.getTVShowSeason(tvShow.id, seasonNumber);
      setEpisodes(seasonData.episodes || []);
    } catch (error) {
      console.error('Error loading episodes:', error);
    } finally {
      setEpisodesLoading(false);
    }
  };

  const handleEpisodePlay = (episode: Episode) => {
    if (!tvShow || !selectedSeason) return;
    
    navigate(`/episode?id=${tvShow.id}&season=${selectedSeason.season_number}&episode=${episode.episode_number}`);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'TBA';
    return new Date(dateString).toLocaleDateString();
  };

  const formatRuntime = (runtime: number) => {
    if (!runtime) return '';
    const hours = Math.floor(runtime / 60);
    const minutes = runtime % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  if (isLoading || !tvShow) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 container mx-auto px-4">
          <div className="animate-pulse space-y-6">
            <div className="shimmer h-8 w-64 rounded"></div>
            <div className="shimmer h-48 w-full rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="shimmer h-32 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-20 container mx-auto px-4 pb-12">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={handleGoBack}
            className="p-2 bg-surface border border-border rounded-lg hover:bg-surface-elevated transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{tvShow.name}</h1>
            <p className="text-muted-foreground">Select season and episode</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Season Selector */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold text-foreground mb-4">Seasons</h2>
            <div className="space-y-2">
              {tvShow.seasons
                .filter(season => season.season_number >= 0)
                .map((season) => (
                <button
                  key={season.id}
                  onClick={() => setSelectedSeason(season)}
                  className={`w-full text-left p-4 rounded-lg border transition-all duration-300 ${
                    selectedSeason?.id === season.id
                      ? 'bg-primary/20 border-primary text-primary'
                      : 'bg-surface border-border hover:bg-surface-elevated'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={tmdbService.getImageUrl(season.poster_path, 'w92')}
                      alt={season.name}
                      className="w-12 h-18 object-cover rounded"
                      loading="lazy"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{season.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {season.episode_count} episodes
                      </p>
                      {season.air_date && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(season.air_date).getFullYear()}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Episodes List */}
          <div className="lg:col-span-3">
            {selectedSeason && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground">
                    {selectedSeason.name}
                  </h2>
                  <span className="text-muted-foreground">
                    {episodes.length} episodes
                  </span>
                </div>

                {episodesLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="shimmer h-32 rounded-lg"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {episodes.map((episode) => (
                      <div
                        key={episode.id}
                        className="bg-surface border border-border rounded-lg overflow-hidden hover:bg-surface-elevated transition-all duration-300 group cursor-pointer"
                        onClick={() => handleEpisodePlay(episode)}
                      >
                        <div className="flex">
                          {/* Episode Thumbnail */}
                          <div className="relative w-40 md:w-56 flex-shrink-0">
                            <img
                              src={tmdbService.getImageUrl(episode.still_path, 'w300')}
                              alt={episode.name}
                              className="w-full h-24 md:h-32 object-cover"
                              loading="lazy"
                            />
                            
                            {/* Play Overlay */}
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <button className="p-3 bg-primary/80 backdrop-blur-sm rounded-full hover:bg-primary hover:scale-110 transition-all duration-300">
                                <Play className="w-6 h-6 fill-current text-white" />
                              </button>
                            </div>

                            {/* Episode Number Badge */}
                            <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-white text-sm font-medium">
                              E{episode.episode_number}
                            </div>
                          </div>

                          {/* Episode Info */}
                          <div className="flex-1 p-4 space-y-2">
                            <div className="flex items-start justify-between">
                              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
                                {episode.name}
                              </h3>
                              <div className="flex items-center space-x-1 ml-4">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <span className="text-sm text-muted-foreground">
                                  {episode.vote_average.toFixed(1)}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              {episode.air_date && (
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>{formatDate(episode.air_date)}</span>
                                </div>
                              )}
                              {episode.runtime && (
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{formatRuntime(episode.runtime)}</span>
                                </div>
                              )}
                            </div>

                            <p className="text-sm text-foreground/80 line-clamp-2 md:line-clamp-3">
                              {episode.overview || 'No description available.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};