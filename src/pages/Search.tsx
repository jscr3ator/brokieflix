import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Filter } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { ContentRow } from '../components/ContentRow';
import { tmdbService, Movie, TVShow, Person } from '../services/tmdb';

export const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [searchResults, setSearchResults] = useState<{
    movies: Movie[];
    tvShows: TVShow[];
    people: Person[];
  }>({
    movies: [],
    tvShows: [],
    people: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'movies' | 'tv' | 'people'>('all');
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [searchParams]);

  const performSearch = async (query: string) => {
    if (!query.trim()) return;

    try {
      setIsLoading(true);
      
      const [multiResults, movieResults, tvResults, peopleResults] = await Promise.all([
        tmdbService.searchMulti(query),
        tmdbService.searchMovies(query),
        tmdbService.searchTVShows(query),
        tmdbService.searchPeople(query)
      ]);

      // Separate results by type from multi search
      const movies = movieResults.results.sort((a: Movie, b: Movie) => b.popularity - a.popularity);
      const tvShows = tvResults.results.sort((a: TVShow, b: TVShow) => b.popularity - a.popularity);
      const people = peopleResults.results.sort((a: Person, b: Person) => b.popularity - a.popularity);

      setSearchResults({
        movies,
        tvShows,
        people
      });

      setTotalResults(movies.length + tvShows.length + people.length);
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
    }
  };

  const getFilteredResults = () => {
    switch (activeFilter) {
      case 'movies':
        return searchResults.movies;
      case 'tv':
        return searchResults.tvShows;
      case 'people':
        return searchResults.people;
      default:
        return [
          ...searchResults.movies,
          ...searchResults.tvShows
        ];
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onSearch={(query) => {
        setSearchQuery(query);
        setSearchParams({ q: query });
      }} />
      
      <div className="pt-20 container mx-auto px-4">
        {/* Search Header */}
        <div className="space-y-6 mb-8">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for movies, TV shows, people..."
                className="w-full bg-surface border border-border rounded-lg px-6 py-4 pr-14 text-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
              />
              <button
                type="submit"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors duration-300"
              >
                <SearchIcon size={24} />
              </button>
            </div>
          </form>

          {/* Results Info */}
          {searchQuery && (
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-foreground">
                Search Results for "{searchQuery}"
              </h1>
              {totalResults > 0 && (
                <p className="text-muted-foreground">
                  Found {totalResults} results
                </p>
              )}
            </div>
          )}

          {/* Filter Tabs */}
          {totalResults > 0 && (
            <div className="flex items-center justify-center">
              <div className="flex bg-surface rounded-lg p-1 border border-border">
                {[
                  { key: 'all', label: 'All', count: searchResults.movies.length + searchResults.tvShows.length },
                  { key: 'movies', label: 'Movies', count: searchResults.movies.length },
                  { key: 'tv', label: 'TV Shows', count: searchResults.tvShows.length },
                  { key: 'people', label: 'People', count: searchResults.people.length }
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setActiveFilter(filter.key as any)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                      activeFilter === filter.key
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-surface-elevated'
                    }`}
                  >
                    {filter.label} ({filter.count})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Search Results */}
        {isLoading ? (
          <div className="space-y-8">
            <ContentRow title="Searching..." items={[]} isLoading={true} />
          </div>
        ) : searchQuery && totalResults === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto space-y-4">
              <SearchIcon size={64} className="mx-auto text-muted-foreground" />
              <h2 className="text-2xl font-bold text-foreground">No results found</h2>
              <p className="text-muted-foreground">
                Try different keywords or check your spelling
              </p>
            </div>
          </div>
        ) : searchQuery && totalResults > 0 ? (
          <div className="space-y-8 pb-12">
            {/* All Results or Filtered Results */}
            {activeFilter === 'all' && (
              <>
                {searchResults.movies.length > 0 && (
                  <ContentRow
                    title="Movies"
                    items={searchResults.movies}
                  />
                )}
                {searchResults.tvShows.length > 0 && (
                  <ContentRow
                    title="TV Shows"
                    items={searchResults.tvShows}
                  />
                )}
                {searchResults.people.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-foreground px-4">People</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 px-4">
                      {searchResults.people.slice(0, 12).map((person) => (
                        <div
                          key={person.id}
                          className="text-center space-y-2 cursor-pointer group"
                          onClick={() => window.open(`/person?id=${person.id}`, '_self')}
                        >
                          <div className="relative overflow-hidden rounded-lg">
                            <img
                              src={tmdbService.getImageUrl(person.profile_path, 'w185')}
                              alt={person.name}
                              className="w-full aspect-[2/3] object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          </div>
                          <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
                            {person.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {person.known_for_department}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            
            {/* Filtered Results */}
            {activeFilter === 'movies' && searchResults.movies.length > 0 && (
              <ContentRow
                title="Movies"
                items={searchResults.movies}
              />
            )}
            
            {activeFilter === 'tv' && searchResults.tvShows.length > 0 && (
              <ContentRow
                title="TV Shows"
                items={searchResults.tvShows}
              />
            )}
            
            {activeFilter === 'people' && searchResults.people.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground px-4">People</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 px-4">
                  {searchResults.people.map((person) => (
                    <div
                      key={person.id}
                      className="text-center space-y-2 cursor-pointer group"
                      onClick={() => window.open(`/person?id=${person.id}`, '_self')}
                    >
                      <div className="relative overflow-hidden rounded-lg">
                        <img
                          src={tmdbService.getImageUrl(person.profile_path, 'w185')}
                          alt={person.name}
                          className="w-full aspect-[2/3] object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                      <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
                        {person.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {person.known_for_department}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto space-y-4">
              <SearchIcon size={64} className="mx-auto text-muted-foreground" />
              <h2 className="text-2xl font-bold text-foreground">Discover Amazing Content</h2>
              <p className="text-muted-foreground">
                Search for movies, TV shows, and people to start exploring
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};