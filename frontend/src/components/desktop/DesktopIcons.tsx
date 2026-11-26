import { Link, useLocation } from 'react-router-dom';
import { DesktopArt } from './DesktopArt';
import { desktopApps, isAppActive } from './desktopApps';

type DesktopIconsProps = {
  layout?: 'column' | 'grid';
  label?: string;
};

const DesktopIcons = ({ layout = 'column', label = 'Desktop shortcuts' }: DesktopIconsProps) => {
  const { pathname } = useLocation();

  return (
    <nav aria-label={label} className={layout === 'column' ? 'desk-icons' : 'desk-grid'}>
      {desktopApps.map((app) => (
        <Link
          key={app.to}
          to={app.to}
          className="dicon"
          aria-current={isAppActive(app, pathname) ? 'page' : undefined}
        >
          <DesktopArt name={app.art} />
          <span className="dicon-label">{app.label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default DesktopIcons;
