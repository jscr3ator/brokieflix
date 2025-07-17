import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Star, Calendar, Users } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { ContentRow } from '../components/ContentRow';
import { tmdbService, Movie, TVShow } from '../services/tmdb';

interface PersonDetails {
  id: number;
  name: string;
  biography: string;
  birthday: string;
  deathday: string | null;
  place_of_birth: string;
  profile_path: string;
  known_for_department: string;
  popularity: number;
  movie_credits: {
    cast: Movie[];
    crew: any[];
  };
  tv_credits: {
    cast: TVShow[];
    crew: any[];
  };
}

export const Person = () => {
  const [searchParams] = useSearchParams();
  const [person, setPerson] = useState<PersonDetails | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [tvShows, setTVShows] = useState<TVShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFullBio, setShowFullBio] = useState(false);

  const id = searchParams.get('id');

  useEffect(() => {
    if (id) {
      loadPersonDetails();
    }
  }, [id]);

  const loadPersonDetails = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const personData = await tmdbService.getPersonDetails(parseInt(id));
      setPerson(personData);

      // Process movie and TV credits
      const movieCredits = personData.movie_credits?.cast || [];
      const tvCredits = personData.tv_credits?.cast || [];

      // Sort by popularity and release date
      const sortedMovies = movieCredits
        .filter((movie: Movie) => movie.poster_path)
        .sort((a: Movie, b: Movie) => {
          const aDate = new Date(a.release_date || '1900-01-01');
          const bDate = new Date(b.release_date || '1900-01-01');
          return bDate.getTime() - aDate.getTime();
        });

      const sortedTVShows = tvCredits
        .filter((show: TVShow) => show.poster_path)
        .sort((a: TVShow, b: TVShow) => {
          const aDate = new Date(a.first_air_date || '1900-01-01');
          const bDate = new Date(b.first_air_date || '1900-01-01');
          return bDate.getTime() - aDate.getTime();
        });

      setMovies(sortedMovies);
      setTVShows(sortedTVShows);

    } catch (error) {
      console.error('Error loading person details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAge = (birthday: string, deathday?: string | null) => {
    const birth = new Date(birthday);
    const end = deathday ? new Date(deathday) : new Date();
    const age = end.getFullYear() - birth.getFullYear();
    const monthDiff = end.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading || !person) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 container mx-auto px-4">
          <div className="animate-pulse space-y-6">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="shimmer w-64 h-96 rounded-lg"></div>
              <div className="flex-1 space-y-4">
                <div className="shimmer h-12 w-3/4 rounded"></div>
                <div className="shimmer h-6 w-1/2 rounded"></div>
                <div className="shimmer h-32 w-full rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const profileUrl = tmdbService.getImageUrl(person.profile_path, 'w500');
  const age = person.birthday ? calculateAge(person.birthday, person.deathday) : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-20 container mx-auto px-4 pb-12">
        {/* Person Details */}
        <div className="flex flex-col lg:flex-row gap-8 mb-12">
          {/* Profile Image */}
          <div className="flex-shrink-0">
            <img
              src={profileUrl}
              alt={person.name}
              className="w-64 md:w-80 aspect-[2/3] object-cover rounded-lg shadow-xl mx-auto lg:mx-0"
            />
          </div>
          
          {/* Person Info */}
          <div className="flex-1 space-y-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                {person.name}
              </h1>
              
              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{person.known_for_department}</span>
                </div>
                {person.birthday && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {formatDate(person.birthday)}
                      {age && ` (${person.deathday ? 'died at' : 'age'} ${age})`}
                    </span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span>Popularity: {person.popularity.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Biography */}
            {person.biography && (
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Biography</h2>
                <p className={`text-foreground/90 leading-relaxed ${!showFullBio ? 'line-clamp-6' : ''}`}>
                  {person.biography}
                </p>
                {person.biography.length > 500 && (
                  <button
                    onClick={() => setShowFullBio(!showFullBio)}
                    className="mt-2 text-primary hover:text-primary-glow transition-colors duration-300"
                  >
                    {showFullBio ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>
            )}

            {/* Personal Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {person.place_of_birth && (
                <div className="bg-surface rounded-lg p-6 border border-border">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Place of Birth</h3>
                  <p className="text-foreground/80">{person.place_of_birth}</p>
                </div>
              )}
              
              {person.deathday && (
                <div className="bg-surface rounded-lg p-6 border border-border">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Date of Death</h3>
                  <p className="text-foreground/80">{formatDate(person.deathday)}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filmography */}
        <div className="space-y-8">
          {/* Movies */}
          {movies.length > 0 && (
            <ContentRow
              title={`Movies (${movies.length})`}
              items={movies}
            />
          )}

          {/* TV Shows */}
          {tvShows.length > 0 && (
            <ContentRow
              title={`TV Shows (${tvShows.length})`}
              items={tvShows}
            />
          )}

          {/* No Credits */}
          {movies.length === 0 && tvShows.length === 0 && (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto space-y-4">
                <Users size={64} className="mx-auto text-muted-foreground" />
                <h2 className="text-2xl font-bold text-foreground">No filmography available</h2>
                <p className="text-muted-foreground">
                  No movie or TV show credits found for this person.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};