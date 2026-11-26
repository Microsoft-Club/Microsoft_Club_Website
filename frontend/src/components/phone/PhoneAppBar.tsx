import { Link, useLocation } from 'react-router-dom';
import { DesktopArt } from '../desktop/DesktopArt';
import { backPathFor, currentPhoneApp } from './phoneApps';

/** Title bar shown at the top of every phone "app" (every page except Home). */
const PhoneAppBar = () => {
  const { pathname } = useLocation();
  const app = currentPhoneApp(pathname);
  const backTo = backPathFor(pathname);
  const backLabel = backTo === '/' ? 'Home' : currentPhoneApp(backTo).label;

  return (
    <header className={`phone-appbar win-bar--${app.tone}`}>
      <Link to={backTo} className="phone-back" aria-label={`Back to ${backLabel}`}>
        <i className="icon-arrow-left" aria-hidden="true" />
      </Link>
      <DesktopArt name={app.art} className="phone-appbar-art" />
      <p className="phone-appbar-title">{app.label}</p>
      <Link to="/" className="phone-close" aria-label="Close app and go to Home">
        <i className="icon-close" aria-hidden="true" />
      </Link>
    </header>
  );
};

export default PhoneAppBar;
