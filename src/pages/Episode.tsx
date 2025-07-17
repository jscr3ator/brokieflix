import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Settings, ChevronRight } from 'lucide-react';
import { tmdbService, DetailedTVShow, Episode as EpisodeType } from '../services/tmdb';
import { streamingService, StreamingSource } from '../services/streaming';
import { storageService } from '../services/storage';

export const Episode = () => {
  const [searchParams] = useSearchParams();
  const [tvShow, setTVShow] = useState<DetailedTVShow | null>(null);
  const [episode, setEpisode] = useState<EpisodeType | null>(null);
  const [sources, setSources] = useState<StreamingSource[]>([]);
  const [selectedSource, setSelectedSource] = useState<StreamingSource | null>(null);
  const [downloadLinks, setDownloadLinks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [allEpisodes, setAllEpisodes] = useState<EpisodeType[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  const id = searchParams.get('id');
  const season = parseInt(searchParams.get('season') || '1');
  const episodeNumber = parseInt(searchParams.get('episode') || '1');

  useEffect(() => {
    if (id && season && episodeNumber) {
      loadEpisodeContent();
    }
  }, [id, season, episodeNumber]);

  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  const loadEpisodeContent = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const [showData, episodeData, seasonData, sourcesData, downloads] = await Promise.all([
        tmdbService.getTVShowDetails(parseInt(id)),
        tmdbService.getTVShowEpisode(parseInt(id), season, episodeNumber),
        tmdbService.getTVShowSeason(parseInt(id), season),
        streamingService.getTVSources(parseInt(id), season, episodeNumber, ''),
        streamingService.getDownloadLinks(parseInt(id), 'tv', season, episodeNumber)
      ]);

      setTVShow(showData);
      setEpisode(episodeData);
      setAllEpisodes(seasonData.episodes || []);
      setSources(sourcesData);
      setDownloadLinks(downloads);

      if (sourcesData.length > 0) {
        const preferredSource = storageService.getPreferredSources()[`tv-${id}-${season}-${episodeNumber}`];
        const defaultSource = preferredSource 
          ? sourcesData.find(s => s.url === preferredSource) || sourcesData[0]
          : sourcesData[0];
        setSelectedSource(defaultSource);
      }

      storageService.addToContinueWatching({
        id: parseInt(id),
        type: 'tv',
        title: showData.name,
        poster_path: showData.poster_path,
        season,
        episode: episodeNumber,
        episodeTitle: episodeData.name
      });

    } catch (error) {
      console.error('Error loading episode content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSourceChange = (source: StreamingSource) => {
    setSelectedSource(source);
    if (id) {
      storageService.setPreferredSource(`tv-${id}-${season}-${episodeNumber}`, source.url);
    }
  };

  const handleNextEpisode = () => {
    const currentIndex = allEpisodes.findIndex(ep => ep.episode_number === episodeNumber);
    if (currentIndex !== -1 && currentIndex + 1 < allEpisodes.length) {
      const nextEp = allEpisodes[currentIndex + 1];
      navigate(`/episode?id=${id}&season=${season}&episode=${nextEp.episode_number}`);
    }
  };

  if (isLoading || !tvShow || !episode) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-screen overflow-hidden group">
        {selectedSource ? (
          <iframe
            src={selectedSource.url}
            className="w-full h-full border-0 pointer-events-auto"
            allowFullScreen
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-surface">
            <div className="text-center space-y-4">
              <p className="text-xl text-foreground">No streaming source available</p>
              <button onClick={() => navigate(-1)} className="btn-primary">Go Back</button>
            </div>
          </div>
        )}

        <div className={`absolute inset-0 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'} pointer-events-none`}>
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between pointer-events-auto bg-black/40 backdrop-blur-sm border-b border-white/10 rounded-b-lg">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate(-1)} className="p-2 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-all duration-300">
                <ArrowLeft className="w-6 h-6 text-white" />
              </button>
              <div>
                <h1 className="text-white text-lg md:text-xl font-semibold">{tvShow.name}</h1>
                <p className="text-white/80 text-sm">S{season}E{episodeNumber} - {episode.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 bg-black/50 backdrop-blur-sm rounded-lg hover:bg-black/70 transition-all duration-300"
              >
                <Settings className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={handleNextEpisode}
                className="p-2 bg-black/50 backdrop-blur-sm rounded-lg hover:bg-black/70 transition-all duration-300"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {showSettings && sources.length > 1 && (
            <div className="absolute top-16 right-4 w-48 bg-black/70 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl z-10 pointer-events-auto">
              <div className="p-2">
                <h3 className="text-sm font-medium text-foreground mb-2">Video Source</h3>
                <div className="space-y-1">
                  {sources.map((source, index) => (
                    <button
                      key={index}
                      onClick={() => handleSourceChange(source)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                        selectedSource?.url === source.url
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground hover:bg-surface-elevated'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{source.name}</span>
                        <span className="text-xs opacity-70">{source.quality}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
