# Microsoft Club GIKI website

The student tech community site for Microsoft Club GIKI (Ghulam Ishaq Khan Institute). It covers events, members, projects, the Logikal podcast, blogs and inductions.

## Layout

- `frontend/`: React 18 + Vite + Tailwind 3 + TypeScript. It deploys to GitHub Pages (`CNAME`, `.github/workflows/deploy-frontend-github-pages.yml`).
- `backend/`: Express + Prisma (Postgres), hosted on Render. Uploads go to S3 and mail goes out through nodemailer.
- `PRODUCT.md` and `.impeccable/`: design context for the impeccable skill.

## Commands

The frontend runs from `frontend/`:
- `npm run dev`: the Vite dev server.
- `npm run typecheck`: `tsc --noEmit`. Run it after every TS/TSX change.
- `npm run build`: the production build plus the SPA fallback.

The backend runs from `backend/`:
- `npm run dev`: nodemon.
- `npm run db:push`: applies the Prisma schema.

## Design rules (fixed by the club)

- **Look:** a Y2K desktop-OS style. Pages are windows with a coloured title bar, a black 2.5px outline and hard offset shadows.
- **Palette:** use only these: coral `#E74C3C`, lime `#BADA55`, blue `#3498DB`, yellow `#F1C40F`, navy `#1C3A47`, white, gray `#95A5A6` and black. No pink, no gradients.
- **Dark theme:** `html[data-theme='dark']` in `frontend/src/styles/theme.css` swaps the desk to blue and lime accents to sky blue. Window title bars stay lime (`--lime-bar`).
- **Fonts:** Bricolage Grotesque (display) and Barlow (UI).
- **Icons:** Simple Line Icons (`icon-*` classes).
- **Colour tokens:** use the CSS variables in `theme.css`. Don't hardcode hex values in components.
- **Phone:** `useIsPhone` (≤640px) wraps the app in `.phone-ui` with a bottom dock. Phone overrides live in `frontend/src/styles/phone.css`.
- **Stylesheet order:** component CSS loads before `theme.css`, so an override needs a more specific selector, not a later position.

## Conventions

- Commits follow Conventional Commits (`feat:`, `fix:` …) with no `Co-Authored-By` trailer. Commit only when asked.
- Pull requests go into `dev`; `main` only accepts `dev` (`require-dev-into-main.yml`).
- Never commit secrets. Env files are git-ignored; only `.env.example` is tracked.
- The admin pages (`/admin/login`, `/admin/dashboard`) are intentionally unlinked from the UI for now. Keep the routes but add no entry points.
- Ask before implementing when a request is ambiguous.
