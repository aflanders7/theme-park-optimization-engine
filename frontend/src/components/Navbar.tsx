// frontend/src/components/layout/Navbar.tsx
import { Link, useLocation } from 'react-router-dom';
import { Search, Home, Menu, X, Calendar, Rat, CableCar, BookOpen } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 border-b-2 border-orange-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* TOP ROW: logo/title + burger OR desktop nav */}
        <div className="flex items-center justify-between h-20">

          {/* LOGO + TITLE */}
          <Link
            to="/"
            className="flex items-center gap-3 min-w-0 flex-1"
          >
            <div className="w-12 h-12 bg-[var(--sunset)] rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Rat className="w-7 h-7 text-[var(--charcoal)]" />
            </div>

            <div className="flex flex-col min-w-0">
              <h1 className="font-bold text-[clamp(1rem,4vw,1.5rem)] text-[var(--charcoal)] leading-tight whitespace-nowrap overflow-hidden">
                Mouse Days
              </h1>
              <p className="text-[clamp(0.65rem,3vw,0.8rem)] text-gray-600 whitespace-nowrap overflow-hidden">
                Hotel & Park Recommendations
              </p>
            </div>
          </Link>


          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 ml-3 rounded-lg hover:bg-[var(--snow)] transition-colors flex-shrink-0"
          >
            {mobileMenuOpen
              ? <X className="w-7 h-7 text-gray-700" />
              : <Menu className="w-7 h-7 text-gray-700" />
            }
          </button>


          <div className="hidden md:flex items-center gap-2">
            <NavLink to="/" icon={<Home className="w-5 h-5" />} active={isActive('/')}>Home</NavLink>
            <NavLink to="/crowd-calendar" icon={<Calendar className="w-5 h-5" />} active={isActive('/crowd-calendar')}>Crowd Calendar</NavLink>
            {/* <NavLink to="/hotels" icon={<Search className="w-5 h-5" />} active={isActive('/hotels')}>Hotel Matcher</NavLink> */}
            <NavLink to="/parks" icon={<CableCar className="w-5 h-5" />} active={isActive('/parks')}>Park Planner</NavLink>
            <NavLink to="/blog" icon={<BookOpen className="w-5 h-5" />} active={location.pathname.startsWith('/blog')}>Blog</NavLink>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-300">
            <div className="flex flex-col gap-2">
              <MobileNavLink to="/" icon={<Home className="w-5 h-5" />} active={isActive('/')} onClick={() => setMobileMenuOpen(false)}>Home</MobileNavLink>
              <MobileNavLink to="/crowd-calendar" icon={<Calendar className="w-5 h-5" />} active={isActive('/crowd-calendar')} onClick={() => setMobileMenuOpen(false)}>Crowd Calendar</MobileNavLink>
              {/* <MobileNavLink to="/hotels" icon={<Search className="w-5 h-5" />} active={isActive('/hotels')} onClick={() => setMobileMenuOpen(false)}>Hotel Matcher</MobileNavLink> */}
              <MobileNavLink to="/parks" icon={<CableCar className="w-5 h-5" />} active={isActive('/parks')} onClick={() => setMobileMenuOpen(false)}>Park Planner</MobileNavLink>
              <MobileNavLink to="/blog" icon={<BookOpen className="w-5 h-5" />} active={location.pathname.startsWith('/blog')} onClick={() => setMobileMenuOpen(false)}>Blog</MobileNavLink>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function NavLink({ to, icon, active, children }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all ${
        active ? 'bg-[var(--sunset)] text-white shadow-lg' : 'hover:bg-[var(--snow)]'
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}

function MobileNavLink({ to, icon, active, children, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
        active ? 'bg-[var(--pale)] text-white shadow-lg' : 'hover:bg-[var(--snow)]'
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}
