import { Link, NavLink } from 'react-router-dom';
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
  return (
    <header className="sticky top-0 z-30 bg-primaryDark text-white border-b-4 border-black shadow-retro">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-3 py-3 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <img
            src={clubLogo}
            alt="Microsoft Club GIKI logo"
            className="w-10 h-10 object-contain bg-white border-2 border-black shadow-retro"
          />
          <span className="font-heading text-xs md:text-sm leading-tight tracking-tight">
            Microsoft Club GIKI
          </span>
        </Link>
        <div className="flex items-center gap-4 md:gap-6 text-[10px] md:text-xs font-heading">
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
      </nav>
    </header>
  );
};

export default Navbar;

