import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import clubLogo from '../assets/club-logo.png';

const navItems = [
  { to: '/', label: 'Home' },
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
    <header className="sticky top-0 z-30 bg-primaryDark text-white border-b-4 border-black shadow-retro">
      <nav className="max-w-6xl mx-auto px-3 py-3 md:px-6">
        <div className="flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-1 min-w-0">
            <img
              src={clubLogo}
              alt="Microsoft Club GIKI logo"
              className="w-9 h-9 md:w-10 md:h-10 object-contain bg-white border-2 border-black shadow-retro shrink-0"
            />
            <span className="font-heading text-[10px] sm:text-xs md:text-sm leading-tight tracking-tight min-w-0 whitespace-nowrap">
              Microsoft Club GIKI
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="md:hidden px-2 py-1 border-2 border-white bg-black text-white font-heading text-[10px]"
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            Menu
          </button>

          <div className="hidden md:flex items-center gap-4 lg:gap-6 text-[10px] md:text-xs font-heading">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }: { isActive: boolean }) =>
                  `px-2 py-1 border-2 border-black ${
                    isActive
                      ? 'bg-white text-primary shadow-retro'
                      : 'bg-primaryDark/0 text-white'
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
          <div className="md:hidden mt-3 border-2 border-black bg-primary/90 p-2 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }: { isActive: boolean }) =>
                  `block px-2 py-2 border-2 border-black text-xs ${
                    isActive
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

