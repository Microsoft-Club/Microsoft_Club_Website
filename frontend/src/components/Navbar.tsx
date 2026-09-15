import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import clubLogo from '../assets/club-logo.png';

const navItems = [
  { to: '/', label: 'Home', end: true },
  {
    to: '/waiting-list',
    label: 'Inductions',
    matchPaths: ['/waiting-list', '/inductions', '/inductions-waiting-list'],
  },
  { to: '/events', label: 'Events' },
  { to: '/members', label: 'Members' },
  { to: '/projects', label: 'Projects' },
  { to: '/podcasts', label: 'Podcasts' },
  { to: '/blogs', label: 'Blogs' },
];

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-50 bg-primaryDark text-white border-b-4 border-black shadow-retro">
      <nav aria-label="Primary navigation" className="max-w-6xl mx-auto px-3 py-3 md:px-6">
        <div className="flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img
              src={clubLogo}
              alt="Microsoft Club GIKI logo"
              className="w-9 h-9 md:w-10 md:h-10 object-contain bg-white border-2 border-black shadow-retro shrink-0"
            />
            <span className="font-heading text-[10px] sm:text-xs md:text-sm leading-tight tracking-tight whitespace-nowrap hidden sm:inline">
              Microsoft Club GIKI
            </span>
            <span className="font-heading text-xs leading-tight tracking-tight whitespace-nowrap sm:hidden">
              MCG
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="xl:hidden px-2 py-1 border-2 border-white bg-black text-white font-heading text-[10px]"
            aria-expanded={isMobileMenuOpen}
            aria-controls="primary-navigation"
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            Menu
          </button>

          <div className="hidden xl:flex items-center gap-2 2xl:gap-4 text-[10px] xl:text-xs font-heading shrink-0">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }: { isActive: boolean }) =>
                  `px-2 py-1 border-2 border-black whitespace-nowrap ${
                    isActive || item.matchPaths?.includes(location.pathname)
                      ? 'bg-white text-primary shadow-retro'
                      : 'bg-primaryDark/0 text-white hover:bg-white/10'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}

            <Link
              to="/admin/login"
              className="px-3 py-1 bg-black text-white border-2 border-white font-heading text-[10px]"
            >
              Admin
            </Link>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div
            id="primary-navigation"
            aria-label="Primary navigation"
            className="xl:hidden mt-3 border-2 border-black bg-primary/90 p-2 space-y-2"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }: { isActive: boolean }) =>
                  `block px-2 py-2 border-2 border-black text-xs ${
                    isActive || item.matchPaths?.includes(location.pathname)
                      ? 'bg-white text-primary shadow-retro'
                      : 'bg-primaryDark/20 text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <Link
              to="/admin/login"
              className="block px-2 py-2 bg-black text-white border-2 border-white font-heading text-xs"
            >
              Admin
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;

