---
version: 1
slug: "frontend-src-pages-home-tsx"
primary_target: "frontend/src/pages/Home.tsx"
related_targets: ["frontend/src/pages","frontend/src/components"]
---

## Scope
Public site (Home first, then Events, Members, Projects, Podcasts, Blogs, Inductions, details) — Persuade on Home, Read on detail pages. Admin dashboard and login are Operate: they take type, palette and the window frame only.

Audience: GIKI students, mostly on phones. Action: join the club (inductions, waiting list, WhatsApp). Proof: real events, projects, episodes from the API. Constraint: palette and retro-desktop world pinned by the user; no pink, no other hues.

## Direction contract
THESIS: The site is a desktop the student boots into; every page is an app window and joining is an installer you run. It refuses the hero-over-three-cards template the old site used.

OWN-WORLD (Vibrant redesign Nov 2026): White #FFFFFF desktop (light theme) or Navy #1C3A47 (dark theme), with large flat Bright Blue #3498DB and Coral Red #E74C3C accent fields behind the windows. Windows are White #FFFFFF (light) or Navy #1C3A47 (dark) with 2.5px Black #000000 outlines, 8px corners, two outlined circle buttons and a filename in the title bar, hard 5px Black offset shadow. Bright Blue is the one action colour; Coral Red marks status (closed, past, live); Lime Green #BADA55 marks success/open. Yellow Gold #F1C40F is secondary accent. Gray #95A5A6 for muted content. Display: Bricolage Grotesque; UI and body: Barlow. Icons: Simple Line Icons only. Both light (White bg) and dark (Navy bg) themes, with 4.5:1 contrast maintained in each.

STORY: A student sees what the club is in one sentence, sees whether inductions are open, and either applies, joins the waiting list, or joins WhatsApp; then browses real events and work.

FIRST VIEWPORT: Menu bar on top (logo left, page links, Admin right). Desktop: on wide screens a column of labelled desktop-icon shortcuts at left. A large "welcome.app" window holds the h1 "Microsoft Club GIKI", one sentence, and the primary "Join the club" button. Overlapping it at right, an "Installing: Microsoft Club GIKI" dialog shows inductions state with a progress bar and the join action. Below the fold starts the events window in a job-board list.

FORM: Pinned by the user (retro desktop OS + job-board list), position 1. seed: none (unavailable)

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Signature interaction: the inductions installer — its progress bar and buttons change with the inductions state (open: "Run installer" to apply; closed: paused bar, "Join the waiting list").
