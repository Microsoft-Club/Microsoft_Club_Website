import { adminApp, desktopApps, type DesktopApp } from '../desktop/desktopApps';

export type PhoneTone = 'blue' | 'lime' | 'coral' | 'yellow' | 'navy';

export type PhoneApp = DesktopApp & { tone: PhoneTone };

const byPath = (to: string): DesktopApp => {
  const app = [...desktopApps, adminApp].find((a) => a.to === to);
  if (!app) throw new Error(`Unknown app route: ${to}`);
  return app;
};

export const mailApp: PhoneApp = {
  to: '/contact',
  label: 'Mail',
  file: 'mail.app',
  art: 'envelope',
  icon: 'icon-envelope',
  tone: 'coral',
};

const TONES: Record<string, PhoneTone> = {
  '/': 'blue',
  '/inductions': 'coral',
  '/events': 'lime',
  '/members': 'yellow',
  '/projects': 'blue',
  '/podcasts': 'coral',
  '/blogs': 'navy',
};

const withTone = (app: DesktopApp): PhoneApp => ({ ...app, tone: TONES[app.to] ?? 'blue' });

const DOCK_PATHS = ['/', '/events', '/members', '/projects'];

/** The four apps pinned to the bottom dock (plus the More button). */
export const dockApps: PhoneApp[] = DOCK_PATHS.map((to) => withTone(byPath(to)));

/** Apps listed in the dock's More sheet. */
export const moreApps: PhoneApp[] = [
  ...['/inductions', '/podcasts', '/blogs'].map((to) => withTone(byPath(to))),
  mailApp,
];

const allPhoneApps: PhoneApp[] = [...dockApps, ...moreApps];

export const isPhoneAppActive = (app: DesktopApp, pathname: string): boolean => {
  if (app.to === '/') return pathname === '/';
  const paths = app.matchPaths ?? [app.to];
  return paths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
};

export const currentPhoneApp = (pathname: string): PhoneApp =>
  allPhoneApps.find((app) => isPhoneAppActive(app, pathname)) ?? dockApps[0];

/** Where the app bar's back button goes: detail pages return to their list, everything else to Home. */
export const backPathFor = (pathname: string): string => {
  const detailParent = ['/events', '/blogs'].find((p) => pathname.startsWith(`${p}/`));
  return detailParent ?? '/';
};
