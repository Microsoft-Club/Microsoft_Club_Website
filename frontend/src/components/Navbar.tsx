import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import clubLogoWhite from '../assets/club_logo_white.png';

const navItems = [
  { to: '/', label: 'Home', end: true },
  {
    to: '/inductions',
    label: 'Inductions',
    matchPaths: ['/inductions', '/waiting-list', '/inductions-waiting-list'],
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
  const isAdminSection = location.pathname.startsWith('/admin');

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const adminLinkClass = (mobile: boolean) =>
    `${mobile ? 'block px-2 py-2 font-heading text-xs' : 'px-3 py-1 font-heading text-[10px]'} border-2 ${
      isAdminSection
        ? 'bg-white text-primary border-black shadow-retro'
        : 'bg-black text-white border-white'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-primaryDark text-white border-b-4 border-black shadow-retro">
      <nav aria-label="Primary navigation" className="max-w-6xl mx-auto px-3 py-3 md:px-6">
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/"
            aria-label="Microsoft Club GIKI home"
            className="flex items-center shrink-0"
          >
            <img
              src={clubLogoWhite}
              alt=""
              className="h-10 sm:h-11 md:h-12 w-auto max-w-[200px] sm:max-w-[240px] md:max-w-[280px] object-contain object-left shrink-0"
            />
          </Link>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="xl:hidden px-2 py-1 border-2 border-white bg-black text-white font-heading text-[10px]"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-primary-navigation"
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

            <Link to="/admin/login" className={adminLinkClass(false)}>
              Admin
            </Link>
          </div>
        </div>

        <div
          id="mobile-primary-navigation"
          hidden={!isMobileMenuOpen}
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
          <Link to="/admin/login" className={adminLinkClass(true)}>
            Admin
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;

