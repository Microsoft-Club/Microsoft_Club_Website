import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mcg_admin_token');
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

export type Event = {
  id: number;
  title: string;
  description: string;
  date: string;
  type: 'upcoming' | 'past';
  images?: string[];
  speakers?: string[];
  registrationLink?: string;
};

export type Member = {
  id: number;
  name: string;
  role: string;
  tenure: string;
  image?: string;
  linkedin?: string;
  isCurrent: boolean;
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

