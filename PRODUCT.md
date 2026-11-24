# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Primary: GIKI students — mostly undergraduates — checking what the Microsoft Club does, which events are coming up, and whether (and when) they can join. They arrive from Instagram, LinkedIn, WhatsApp and the club's Linktree, often on a phone.

Secondary (confirmed by existing features, not the design priority): club admins with roles (including a Dev role limited to projects) who manage events, members, projects, podcasts, blogs and the inductions waiting list from the admin dashboard.

## Product Purpose
The public home of Microsoft Club GIKI, the Microsoft Learn Student Ambassadors chapter at Ghulam Ishaq Khan Institute. It shows the club's events, members, projects, podcast and blogs. Success: a student leaves knowing how to join — applying in inductions when open, joining the waiting list or WhatsApp community when closed.

## Positioning
The only Microsoft Learn Student Ambassadors chapter at GIKI, founded in 2022 by Team Omega after winning the Imagine Cup 2022 national finals. It runs the MICATHON hackathon, the Logikal podcast and Learning & Development sessions, and ships real campus software (GIKI Wallet, ORIC).

## Operating Context
- Content comes from the club's API (`backend/`, Express + Prisma) and is edited through the admin dashboard; the frontend never hardcodes events, members, projects, podcasts or blogs.
- Inductions open and close by season (2026 inductions for Batch 35 and 36 are closed); the inductions page switches between applying and a waiting list.
- Events link out to Instagram posts or registration forms.
- Frontend is deployed on GitHub Pages; pull requests into `main` must come from `dev`.

## Capabilities and Constraints
- Stack: React 18, Vite, TypeScript, Tailwind 3, framer-motion, react-router, react-quill (admin blog editor).
- Routes: Home, Inductions (+ waiting list), Events, Event detail, Members, Projects, Podcasts, Blogs, Blog detail, Admin login, Admin dashboard (role-based tabs).
- SEO component and SPA 404 fallback must keep working.

## Brand Commitments
- Name: Microsoft Club GIKI (also Microsoft Learn Student Chapter GIKI). Logo assets in `frontend/src/assets/`.
- Voice: friendly student community; light, clean humour is welcome (confirmed), but labels and actions stay clear. Nothing crude.
- Colour palette is binding (user-supplied, redesign Nov 2026): Coral Red #E74C3C, Lime Green #BADA55, Bright Blue #3498DB, Yellow Gold #F1C40F, Navy #1C3A47, White #FFFFFF, Gray #95A5A6, Black #000000. Both light and dark themes required, with proper 4.5:1 contrast in each.
- Visual reference is binding (user-supplied): retro desktop-OS windows with thick outlines and hard offset shadows, combined with a clean job-board style list layout.

## Evidence on Hand
- 36 events (2022–2026), 19 members (9 current EC, 10 alumni), 2 projects, 14 podcast episodes, 1 blog — all served by the API.
- Partners named in events: DataCamp Donates, Cursor Pakistan, CarbonTeq.
- No testimonials, member counts or attendance figures exist; do not invent them.

## Product Principles
1. Joining comes first: every page should make the next step to join obvious, whether inductions are open or closed.
2. Real club work over claims: show actual events, projects and episodes; never pad with invented numbers.
3. Students on phones are the main visitors; every page must work well at phone width.
4. Admins must manage content without friction; the dashboard values clarity over personality.
