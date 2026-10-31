import axios from 'axios';

const configuredApiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').trim();
const API_BASE_URL = configuredApiUrl
  .replace(/\/+$/, '')
  .replace(/\/api$/i, '');

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mcg_admin_token');
  if (token) {
    if (config.headers && typeof config.headers.set === 'function') {
      config.headers.set('Authorization', `Bearer ${token}`);
    } else {
      config.headers = config.headers || {};
      (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const hadToken = !!localStorage.getItem('mcg_admin_token');
      if (hadToken) {
        localStorage.removeItem('mcg_admin_token');
        localStorage.removeItem('mcg_admin_email');
        const appBasePath = import.meta.env.BASE_URL.replace(/\/+$/, '');
        const adminPath = `${appBasePath}/admin`;
        if (
          window.location.pathname.startsWith(adminPath) &&
          !window.location.pathname.startsWith(`${adminPath}/login`)
        ) {
          window.location.href = `${import.meta.env.BASE_URL}admin/login?sessionExpired=1`;
        }
      }
    }
    return Promise.reject(error);
  }
);

export type Event = {
  id: number;
  title: string;
  description: string;
  date: string;
  type: 'upcoming' | 'past';
  images?: string[];
  speakers?: string[];
  registrationLink?: string;
  featured?: boolean;
  slug?: string | null;
  location?: string | null;
};

export type Member = {
  id: number;
  name: string;
  role: string;
  tenure: string;
  image?: string;
  linkedin?: string;
  isCurrent: boolean;
  displayOrder?: number | null;
};

export type Project = {
  id: number;
  title: string;
  description: string;
  techStack: string[];
  githubLink?: string;
  demoLink?: string;
  contributors: string[];
  images?: string[];
};

export type Podcast = {
  id: number;
  title: string;
  description: string;
  youtubeLink: string;
  guest: string;
  date: string;
};

export type Blog = {
  id: number;
  title: string;
  content: string;
  author: string;
  tags: string[];
  createdAt: string;
};

export type WaitingListEntry = {
  id: number;
  name: string;
  email: string;
  phone: string;
  batch: 'Batch 35' | 'Batch 36' | string;
  faculty: string;
  createdAt: string;
  updatedAt?: string;
};
