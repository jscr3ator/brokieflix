import { useState } from 'react';
import { Search, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  onSearch?: (query: string) => void;
}

export const Navbar = ({ onSearch }: NavbarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      if (onSearch) {
        onSearch(searchQuery.trim());
      }
    }
  };

  const handleLogoClick = () => {
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={handleLogoClick}
            className="text-2xl font-bold text-primary hover:text-primary-glow transition-colors duration-300 group"
          >
            <span className="group-hover:animate-glow-pulse">BrokieFlix</span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => navigate('/')}
              className="text-foreground hover:text-primary transition-colors duration-300"
            >
              Home
            </button>
            <button
              onClick={() => navigate('/movies')}
              className="text-foreground hover:text-primary transition-colors duration-300"
            >
              Movies
            </button>
            <button
              onClick={() => navigate('/tv')}
              className="text-foreground hover:text-primary transition-colors duration-300"
            >
              TV Shows
            </button>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies, TV shows..."
                className="w-64 bg-surface border border-border rounded-lg px-4 py-2 pr-10 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors duration-300"
              >
                <Search size={18} />
              </button>
            </div>
          </form>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-foreground hover:text-primary transition-colors duration-300"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border/30 bg-surface/95 backdrop-blur-lg">
            <div className="py-4 space-y-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="px-4">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search movies, TV shows..."
                    className="w-full bg-surface-elevated border border-border rounded-lg px-4 py-2 pr-10 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors duration-300"
                  >
                    <Search size={18} />
                  </button>
                </div>
              </form>

              {/* Mobile Navigation Links */}
              <div className="space-y-2 px-4">
                <button
                  onClick={() => {
                    navigate('/');
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 text-foreground hover:text-primary transition-colors duration-300"
                >
                  Home
                </button>
                <button
                  onClick={() => {
                    navigate('/movies');
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 text-foreground hover:text-primary transition-colors duration-300"
                >
                  Movies
                </button>
                <button
                  onClick={() => {
                    navigate('/tv');
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 text-foreground hover:text-primary transition-colors duration-300"
                >
                  TV Shows
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};