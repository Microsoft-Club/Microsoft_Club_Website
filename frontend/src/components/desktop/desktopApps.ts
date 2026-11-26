import type { ArtName } from './DesktopArt';

export type DesktopApp = {
  to: string;
  label: string;
  file: string;
  art: ArtName;
  icon: string;
  matchPaths?: string[];
};

export const desktopApps: DesktopApp[] = [
  { to: '/', label: 'Home', file: 'club.exe', art: 'globe', icon: 'icon-home' },
  {
    to: '/inductions',
    label: 'Inductions',
    file: 'join.exe',
    art: 'exe',
    icon: 'icon-login',
    matchPaths: ['/inductions', '/waiting-list', '/inductions-waiting-list'],
  },
  { to: '/events', label: 'Events', file: 'events.cal', art: 'calendar', icon: 'icon-calendar' },
  { to: '/members', label: 'Members', file: 'members', art: 'idcard', icon: 'icon-users' },
  { to: '/projects', label: 'Projects', file: 'projects', art: 'folder', icon: 'icon-rocket' },
  { to: '/podcasts', label: 'Podcasts', file: 'logikal.mp3', art: 'music', icon: 'icon-microphone' },
  { to: '/blogs', label: 'Blogs', file: 'blogs.txt', art: 'docs', icon: 'icon-note' },
];

export const adminApp: DesktopApp = {
  to: '/admin/login',
  label: 'Admin',
  file: 'admin',
  art: 'lock',
  icon: 'icon-lock',
  matchPaths: ['/admin/login', '/admin/dashboard'],
};

export const socialLinks = [
  { label: 'Instagram', href: 'https://www.instagram.com/microsoftclubgiki/?hl=en', icon: 'icon-social-instagram' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/microsoft-club-giki/', icon: 'icon-social-linkedin' },
  { label: 'YouTube', href: 'https://www.youtube.com/@LOGIKALGIKI', icon: 'icon-social-youtube' },
  { label: 'WhatsApp community', href: 'https://chat.whatsapp.com/IGUY9fBM2SRC5baqV5DvoH', icon: 'icon-bubbles' },
  { label: 'All links', href: 'https://linktr.ee/MS_clubgiki', icon: 'icon-link' },
];

export const isAppActive = (app: DesktopApp, pathname: string): boolean => {
  if (app.matchPaths?.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return true;
  if (app.to === '/') return pathname === '/';
  return pathname === app.to || pathname.startsWith(`${app.to}/`);
};

export const currentApp = (pathname: string): DesktopApp =>
  [...desktopApps, adminApp].find((app) => isAppActive(app, pathname)) ?? desktopApps[0];
