## Scope
Public site (Home, Events, EventDetail, Members, Projects, Podcasts, Blogs, BlogDetail, Inductions, InductionsWaitingList) — Persuade on Home/Inductions, Read on detail pages, Browse on list pages. Admin dashboard and login are Operate: they take type, palette and the window frame only.

Audience: GIKI students (mostly undergraduates), mostly on phones. Primary action: join the club (inductions, waiting list, WhatsApp). Secondary: browse events, members, projects, podcast episodes, blogs.

## Direction Contract

**THESIS:** The site is a vibrant, energetic community hub with modern color energy combined with retro desktop OS aesthetics. Every page is an app window. Joining is an installer.

**PALETTE (Light Theme):**
- Background: White #FFFFFF
- Surfaces (cards): Lime Green #BADA55 (primary), Bright Blue #3498DB (secondary), Yellow Gold #F1C40F (tertiary)
- Text: Navy #1C3A47 (primary), Gray #95A5A6 (secondary)
- Accents: Coral Red #E74C3C (CTAs, actions), Navy #1C3A47 (borders/frames)
- Overlays: Black #000000 with opacity

**PALETTE (Dark Theme):**
- Background: Navy #1C3A47
- Surfaces (cards): Lime Green #BADA55 (primary), Bright Blue #3498DB (secondary), Yellow Gold #F1C40F (tertiary) — saturated, not desaturated
- Text: White #FFFFFF (primary), Gray #95A5A6 (secondary)
- Accents: Coral Red #E74C3C (CTAs, actions), White #FFFFFF (borders/frames)
- Overlays: Black #000000 with higher opacity

**OWN-WORLD:** Retro desktop-OS windows with thick 2.5px Navy outlines, 8px rounded corners, two outlined circle dots in title bar, 5px hard Coral Red offset shadows. Bright, saturated colors used strategically on cards and UI elements. Lime Green for primary actions/highlights, Bright Blue for information/secondary actions, Yellow Gold for tertiary/warnings, Coral Red for critical CTAs. Simple Line Icons. Barlow (UI) + Bricolage Grotesque (display) typography. Hard pixel-art aesthetic meets vibrant color energy.

**STORY:** A student sees what the club is, sees inductions status immediately, and either applies, joins the waiting list, or explores events, members, and projects. The site is energetic, modern, and clearly action-oriented.

**FIRST VIEWPORT (Light):**
- Menu bar: Navy background with White text/logo
- Desktop icons column (hidden <900px): using Lime Green and Bright Blue highlights
- "microsoft-club.app" window: White background with Lime Green header, Navy text
- "Installing: Microsoft Club GIKI" installer: Bright Blue window with progress bar
- Below fold: Events job-board window with Lime Green header, Yellow Gold tags for status

**FIRST VIEWPORT (Dark):**
- Menu bar: Navy background with White text/logo
- Desktop icons column (hidden <900px): Lime Green and Bright Blue icons
- "microsoft-club.app" window: Navy background with Lime Green header, White text
- "Installing: Microsoft Club GIKI" installer: Bright Blue window, progress bar visible
- Below fold: Events window with Lime Green header on Navy background

**FORM:** Pinned by the user (retro desktop OS + vibrant color + job-board list). Light and dark themes required, with no theme overrides by page.

**FINISH:** Design system tokens, DESIGN.md, and theme-aware component library. All 12 pages restyled and verified for 4.5:1 contrast in both themes.

**Signature interaction:** The inductions installer — color-coded progress, action buttons in Coral Red.

## Component Updates Required

- **WindowCard:** Title bar with Navy outline and Lime Green or Bright Blue header
- **PixelButton:** Coral Red for primary, Lime Green for secondary, Gray for tertiary; both themes
- **Navbar:** Navy background, White text, Lime Green active link indicator
- **Footer:** Navy background, White text, Lime Green social icons on hover
- **Tags/Badges:** Lime Green (upcoming), Yellow Gold (past/closed), Coral Red (featured)
- **Carousel:** Bright Blue navigation controls, Coral Red active dot
- **Forms:** Navy input borders, Coral Red focus ring, Lime Green submit button
- **AdminLogin:** Bright Blue form container, Coral Red submit
- **Dashboard tabs:** Lime Green active tab, Gray inactive

## Responsive Breakpoints
Mobile-first: 375px (base) → 768px (tablet) → 1024px (desktop) → 1440px (wide desktop)

## Accessibility
- Light theme: all text >= 4.5:1 contrast against white/lime/blue/yellow backgrounds
- Dark theme: all text >= 4.5:1 contrast against navy backgrounds
- Focus states: 3px Coral Red outline with Navy interior
- Disabled states: 50% opacity, no interaction
- Color is never the only indicator; add icons/text labels
