// Helpers for admin login info (role + token) and tab permissions.

export type AdminRole = 'Logikal' | 'Marketing' | 'Inductions' | 'Dev' | 'General';
export type DashboardTab =
  | 'waitingList'
  | 'events'
  | 'podcasts'
  | 'members'
  | 'projects'
  | 'blogs';

export const TOKEN_KEY = 'mcg_admin_token';

// Which tabs each role can open. "General" (overall admin) gets everything.
export const ROLE_TABS: Record<AdminRole, DashboardTab[]> = {
  Logikal: ['podcasts'],
  Marketing: ['events', 'members', 'blogs'],
  Inductions: ['waitingList'],
  Dev: ['projects'],
  General: ['waitingList', 'events', 'podcasts', 'members', 'projects', 'blogs'],
};

export const TAB_LABELS: Record<DashboardTab, string> = {
  waitingList: 'Waiting List',
  events: 'Events',
  podcasts: 'Podcasts',
  members: 'Members',
  projects: 'Projects',
  blogs: 'Blogs',
};

type TokenPayload = { role?: string; exp?: number };

const decodeToken = (token: string): TokenPayload | null => {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};

// Returns the admin's role from the token, or null if not logged in / expired.
// (This only controls what the UI shows. The backend checks the role again.)
export const getAdminRole = (): AdminRole | null => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;

  const payload = decodeToken(token);
  if (!payload || !payload.role || !(payload.role in ROLE_TABS)) return null;
  if (payload.exp && payload.exp * 1000 < Date.now()) return null;

  return payload.role as AdminRole;
};

export const getAllowedTabs = (role: AdminRole | null): DashboardTab[] =>
  role ? ROLE_TABS[role] : [];
