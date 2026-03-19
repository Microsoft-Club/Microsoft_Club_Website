import { defineConfig } from 'vite';

export default defineConfig({
  // Enables correct asset URLs and React Router basename on GitHub Pages
  // for both:
  // - https://username.github.io/ (base="/")
  // - https://username.github.io/<repo>/ (base="/<repo>/")
  base: process.env.VITE_BASE_URL ?? '/',
});

