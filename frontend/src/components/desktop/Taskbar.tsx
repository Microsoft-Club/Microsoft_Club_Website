import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MsFlag } from './DesktopArt';
import { currentApp, desktopApps, isAppActive, socialLinks } from './desktopApps';
import { useTheme } from '../../hooks/useTheme';
import { formatClock, useClock } from '../../hooks/useClock';

const Clock = () => {
  const now = useClock();

  return (
    <time className="bevel clock" dateTime={now.toISOString()} aria-label={`Time ${formatClock(now)}`}>
      <i className="icon-calendar" aria-hidden="true" />
      {formatClock(now)}
    </time>
  );
};

const Taskbar = () => {
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const startRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const active = currentApp(pathname);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMenuOpen) return;
    menuRef.current?.querySelector<HTMLAnchorElement>('a')?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        startRef.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!menuRef.current?.contains(target) && !startRef.current?.contains(target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [isMenuOpen]);

  const nextTheme = theme === 'dark' ? 'light' : 'dark';

  return (
    <>
      {isMenuOpen && (
        <div ref={menuRef} id="start-menu" className="win start-menu">
          <div className="win-bar win-bar--navy">
            <p className="win-title">Microsoft Club GIKI</p>
          </div>
          <nav aria-label="All pages">
            <ul>
              {desktopApps.map((app) => (
                <li key={app.to}>
                  <Link
                    to={app.to}
                    className="start-link"
                    aria-current={isAppActive(app, pathname) ? 'page' : undefined}
                  >
                    <i className={app.icon} aria-hidden="true" />
                    {app.label}
                  </Link>
                </li>
              ))}
              <li className="start-sep" role="presentation" />
              {socialLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} target="_blank" rel="noopener noreferrer" className="start-link">
                    <i className={link.icon} aria-hidden="true" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <p className="start-foot">© {new Date().getFullYear()} Microsoft Club GIKI</p>
        </div>
      )}

      <footer className="taskbar">
        <button
          ref={startRef}
          type="button"
          className="bevel"
          aria-expanded={isMenuOpen}
          aria-controls="start-menu"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <MsFlag />
          Start
        </button>        <Link to={active.to} className="bevel task-btn" aria-label={`Current window: ${active.label}`}>
          <i className={active.icon} aria-hidden="true" />
          <span>{active.label}</span>
        </Link>
        <div className="tray">
          <button
            type="button"
            className="bevel"
            onClick={toggleTheme}
            aria-label={`Switch to ${nextTheme} theme`}
            title={`Switch to ${nextTheme} theme`}
          >
            <i className={theme === 'dark' ? 'icon-sun' : 'icon-moon'} aria-hidden="true" />
          </button>
          <Clock />
        </div>
      </footer>
    </>
  );
};

export default Taskbar;
