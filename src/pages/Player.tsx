import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Settings, Volume2, Maximize } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { tmdbService, DetailedMovie, DetailedTVShow } from '../services/tmdb';
import { streamingService, StreamingSource } from '../services/streaming';
import { storageService } from '../services/storage';

export const Player = () => {
  const [searchParams] = useSearchParams();
  const [content, setContent] = useState<DetailedMovie | DetailedTVShow | null>(null);
  const [sources, setSources] = useState<StreamingSource[]>([]);
  const [selectedSource, setSelectedSource] = useState<StreamingSource | null>(null);
  const [downloadLinks, setDownloadLinks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const navigate = useNavigate();

  const type = searchParams.get('type') as 'movie' | 'tv';
  const id = searchParams.get('id');

  useEffect(() => {
    if (type && id) {
      loadPlayerContent();
    }
  }, [type, id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [showControls]);

  const loadPlayerContent = async () => {
    if (!type || !id) return;

    try {
      setIsLoading(true);
      const [contentData, sourcesData, downloads] = await Promise.all([
        type === 'movie' 
          ? tmdbService.getMovieDetails(parseInt(id))
          : tmdbService.getTVShowDetails(parseInt(id)),
        type === 'movie'
          ? streamingService.getMovieSources(parseInt(id), '')
          : streamingService.getTVSources(parseInt(id), 1, 1, ''),
        streamingService.getDownloadLinks(parseInt(id), type)
      ]);

      setContent(contentData);
      setSources(sourcesData);
      setDownloadLinks(downloads);

      if (sourcesData.length > 0) {
        const preferredSource = storageService.getPreferredSources()[`${type}-${id}`];
        const defaultSource = preferredSource 
          ? sourcesData.find(s => s.url === preferredSource) || sourcesData[0]
          : sourcesData[0];
        setSelectedSource(defaultSource);
      }

      const isMovie = 'title' in contentData;
      storageService.addToContinueWatching({
        id: contentData.id,
        type: isMovie ? 'movie' : 'tv',
        title: isMovie ? contentData.title : contentData.name,
        poster_path: contentData.poster_path
      });

    } catch (error) {
      console.error('Error loading player content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSourceChange = (source: StreamingSource) => {
    setSelectedSource(source);
    if (content) {
      storageService.setPreferredSource(`${type}-${content.id}`, source.url);
    }
  };

  const handleTVShowClick = () => {
    if (content && type === 'tv') {
      navigate(`/episodes?id=${content.id}`);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (isLoading || !content) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading player...</p>
        </div>
      </div>
    );
  }

  const isMovie = 'title' in content;
  const title = isMovie ? content.title : content.name;

  return (
    <div className="min-h-screen bg-background">
      <div 
        className="relative h-screen overflow-hidden cursor-pointer"
        onMouseMove={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {selectedSource ? (
          <iframe
            src={selectedSource.url}
            className="w-full h-full border-0"
            allowFullScreen
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-surface">
            <div className="text-center space-y-4">
              <p className="text-xl text-foreground">No streaming sources available</p>
              <button onClick={handleGoBack} className="btn-primary">Go Back</button>
            </div>
          </div>
        )}

        {showControls && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/60 pointer-events-none">
            <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between pointer-events-auto">
              <div className="flex items-center space-x-4">
                <button onClick={handleGoBack} className="p-2 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-all duration-300">
                  <ArrowLeft className="w-6 h-6 text-white" />
                </button>
                <div>
                  <h1 className="text-white text-lg md:text-xl font-semibold">{title}</h1>
                  {type === 'tv' && (
                    <p className="text-white/80 text-sm">Click to select episode • S1E1</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {sources.length > 1 && (
                  <div className="relative group">
                    <button className="p-2 bg-black/50 backdrop-blur-sm rounded-lg hover:bg-black/70 transition-all duration-300">
                      <Settings className="w-5 h-5 text-white" />
                    </button>
                    <div className="absolute top-full right-0 mt-2 w-48 bg-surface border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10">
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
                  </div>
                )}

                {downloadLinks.length > 0 && (
                  <div className="relative group">
                    <button className="p-2 bg-black/50 backdrop-blur-sm rounded-lg hover:bg-black/70 transition-all duration-300">
                      <Download className="w-5 h-5 text-white" />
                    </button>
                    <div className="absolute top-full right-0 mt-2 w-56 bg-surface border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10">
                      <div className="p-2">
                        <h3 className="text-sm font-medium text-foreground mb-2">Download Links</h3>
                        <div className="space-y-1">
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
                                <span className="text-muted-foreground text-xs">{link.size}</span>
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {type === 'tv' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
                <button
                  onClick={handleTVShowClick}
                  className="bg-black/70 backdrop-blur-sm rounded-lg p-6 hover:bg-black/80 transition-all duration-300 text-center"
                >
                  <h2 className="text-white text-xl font-semibold mb-2">Select Episode</h2>
                  <p className="text-white/80">Choose season and episode to watch</p>
                </button>
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-auto">
              <div className="text-center">
                <p className="text-white/60 text-sm">
                  Press ESC to exit fullscreen • Move mouse to show controls
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
