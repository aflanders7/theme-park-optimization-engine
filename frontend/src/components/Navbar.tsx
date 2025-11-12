// frontend/src/components/layout/Navbar.tsx
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Search, Home, Menu, X, Calendar } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 border-b-2 border-orange-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group"
          >
            <div className="w-12 h-12 bg-[var(--blue)] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--charcoal)]">
                Disney Suggestions
              </h1>
              <p className="text-xs text-gray-600">Hotels & Parks</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <NavLink
              to="/"
              icon={<Home className="w-5 h-5" />}
              active={isActive('/')}
            >
              Home
            </NavLink>
            <NavLink
              to="/search"
              icon={<Search className="w-5 h-5" />}
              active={isActive('/search')}
            >
              Hotels
            </NavLink>
            <NavLink
              to="/parks"
              icon={<Calendar className="w-5 h-5" />}
              active={isActive('/parks')}
            >
              Parks
            </NavLink>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-[var(--snow)] transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t-2 border-[var(--charcoal)]">
            <div className="flex flex-col gap-2">
              <MobileNavLink
                to="/"
                icon={<Home className="w-5 h-5" />}
                active={isActive('/')}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </MobileNavLink>
              <MobileNavLink
                to="/search"
                icon={<Search className="w-5 h-5" />}
                active={isActive('/search')}
                onClick={() => setMobileMenuOpen(false)}
              >
                Hotels
              </MobileNavLink>
              <MobileNavLink
                to="/parks"
                icon={<Calendar className="w-5 h-5" />}
                active={isActive('/parks')}
                onClick={() => setMobileMenuOpen(false)}
              >
                Parks
              </MobileNavLink>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  active: boolean;
  children: React.ReactNode;
}

function NavLink({ to, icon, active, children }: NavLinkProps) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all ${
        active
          ? 'bg-[var(--pink)] text-white shadow-lg'
          : 'hover:bg-[var(--snow)]'
        }`}
    >
      {icon}
      {children}
    </Link>
  );
}

interface MobileNavLinkProps extends NavLinkProps {
  onClick: () => void;
}

function MobileNavLink({ to, icon, active, children, onClick }: MobileNavLinkProps) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
        active
          ? 'bg-[var(--pink)] text-white shadow-lg'
          : 'hover:bg-[var(--snow)]'
        }`}
    >
      {icon}
      {children}
    </Link>
  );
}