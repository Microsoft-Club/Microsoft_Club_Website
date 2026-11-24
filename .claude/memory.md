# Project memory

These are decisions and context that aren't obvious from the code. Add a dated line when something changes.
How-to and rules live in `CLAUDE.md`; this file records *why*.

## Design decisions

- 2026-11: The site was redesigned as a Y2K desktop OS: windows, a taskbar and a Start menu on laptop,
  and a home screen with a bottom dock on phone. The club chose this over a plain landing page.
- **Palette:** fixed by the club. Pink and gradients are explicitly rejected.
- 2026-11-19: Dark theme moved from navy to a blue desk (`#2A73B5`) with a deep-blue taskbar
  (`#163E66`). Lime accents became sky blue (`#85C1E9`) in dark mode, except window title bars,
  which the club wanted kept green (`--lime-bar`).
- 2026-11-19: The home hero shows the whole-society group photo (`frontend/src/assets/society-group.webp`)
  instead of the globe/calendar illustration. This is "for now", so a newer photo can replace it.
- 2026-11-19: Admin was removed from the desktop icons, the Start menu and the phone More sheet.
  The `/admin/*` routes are kept on purpose so it can be brought back.
- **Logo:** tried in the taskbar, the Start menu and the phone home screen, then removed everywhere at
  the club's request. Don't re-add it unasked.

## Testing

- `node --test tests/` runs the helper tests (Node 22.18+ needed for `.ts` imports).
  They aren't in CI yet, because the PR workflows use Node 20.
- The frontend type-check (`npm run typecheck` in `frontend/`) runs in `pr-check-frontend.yml`.

## Known follow-ups

- The backend uses `app.use(cors())` with no origin allow-list. Restrict it to the site's domain.
