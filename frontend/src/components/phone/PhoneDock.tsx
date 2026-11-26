import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DesktopArt } from '../desktop/DesktopArt';
import { socialLinks } from '../desktop/desktopApps';
import { useTheme } from '../../hooks/useTheme';
import { dockApps, isPhoneAppActive, moreApps } from './phoneApps';

/** Fixed bottom dock with the main apps and a More sheet for the rest. */
const PhoneDock = () => {
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const isMoreActive = moreApps.some((app) => isPhoneAppActive(app, pathname));

  useEffect(() => {
    setIsMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMoreOpen) return;
    sheetRef.current?.querySelector<HTMLAnchorElement>('a')?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMoreOpen(false);
        moreRef.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!sheetRef.current?.contains(target) && !moreRef.current?.contains(target)) setIsMoreOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [isMoreOpen]);

  const nextTheme = theme === 'dark' ? 'light' : 'dark';

  return (
    <>
      {isMoreOpen && (
        <div ref={sheetRef} id="phone-more" className="win phone-sheet">
          <div className="win-bar win-bar--navy">
            <p className="win-title">More apps</p>
          </div>
          <nav aria-label="More pages" className="phone-sheet-apps">
            {moreApps.map((app) => (
              <Link
                key={app.to}
                to={app.to}
                className="dicon"
                aria-current={isPhoneAppActive(app, pathname) ? 'page' : undefined}
              >
                <DesktopArt name={app.art} />
                <span className="dicon-label">{app.label}</span>
              </Link>
            ))}
          </nav>
          <ul className="phone-sheet-links" aria-label="Club links">
            {socialLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.label} title={link.label}>
                  <i className={link.icon} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
          <button type="button" className="btn btn--white btn--sm phone-sheet-theme" onClick={toggleTheme}>
            <i className={theme === 'dark' ? 'icon-sun' : 'icon-moon'} aria-hidden="true" />
            {`Switch to ${nextTheme} desk`}
          </button>
        </div>
      )}

      <nav className="phone-dock" aria-label="Main pages">
        {dockApps.map((app) => (
          <Link
            key={app.to}
            to={app.to}
            className="phone-dock-item"
            aria-current={isPhoneAppActive(app, pathname) ? 'page' : undefined}
          >
            <DesktopArt name={app.art} className="phone-dock-art" />
            <span>{app.label}</span>
          </Link>
        ))}
        <button
          ref={moreRef}
          type="button"
          className="phone-dock-item"
          aria-expanded={isMoreOpen}
          aria-controls="phone-more"
          data-active={isMoreActive || undefined}
          onClick={() => setIsMoreOpen((open) => !open)}
        >
          <span className="phone-dock-more" aria-hidden="true">
            <i className="icon-grid" />
          </span>
          <span>More</span>
        </button>
      </nav>
    </>
  );
};

export default PhoneDock;
