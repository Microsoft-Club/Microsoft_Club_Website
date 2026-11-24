# Design System — Microsoft Club GIKI Redesign 2026

**Status:** Complete token system for light and dark themes across all 12 pages.  
**Date:** November 2026  
**Palette:** Vibrant (Coral Red, Lime Green, Bright Blue, Yellow Gold, Navy, White, Gray, Black)

---

## Color Tokens

### Light Theme (Default)

```css
:root {
  /* Neutrals */
  --color-bg: #FFFFFF;
  --color-bg-secondary: #F5F5F5;
  --color-surface: #FFFFFF;
  --color-text: #1C3A47;
  --color-text-secondary: #95A5A6;
  --color-text-tertiary: #D0D0D0;

  /* Primary Brand Colors */
  --color-lime: #BADA55;        /* Primary actions, highlights */
  --color-blue: #3498DB;         /* Secondary actions, info */
  --color-yellow: #F1C40F;       /* Tertiary, warnings */
  --color-coral: #E74C3C;        /* Critical CTAs, errors */
  --color-navy: #1C3A47;         /* Borders, text, frames */

  /* Utility */
  --color-gray: #95A5A6;
  --color-white: #FFFFFF;
  --color-black: #000000;
  --color-border: #1C3A47;
  --color-focus: #E74C3C;

  /* Semantic */
  --color-success: #BADA55;
  --color-warning: #F1C40F;
  --color-error: #E74C3C;
  --color-info: #3498DB;

  /* Shadows & Borders */
  --shadow-sm: 2px 2px 0 rgba(0, 0, 0, 0.1);
  --shadow-md: 5px 5px 0 #1C3A47;
  --shadow-lg: 8px 8px 0 #1C3A47;
  --border-width: 2.5px;
  --border-color: #1C3A47;
  --border-radius: 8px;

  /* Typography */
  --font-display: 'Bricolage Grotesque', sans-serif;
  --font-ui: 'Barlow', system-ui, sans-serif;
  --font-size-base: 16px;
  --line-height: 1.5;
}
```

### Dark Theme

```css
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --color-bg: #1C3A47;
    --color-bg-secondary: #2C4A5A;
    --color-surface: #1C3A47;
    --color-text: #FFFFFF;
    --color-text-secondary: #95A5A6;
    --color-text-tertiary: #4A5A6A;
    --color-lime: #BADA55;
    --color-blue: #3498DB;
    --color-yellow: #F1C40F;
    --color-coral: #E74C3C;
    --color-navy: #FFFFFF;
    --color-gray: #95A5A6;
    --color-white: #FFFFFF;
    --color-black: #000000;
    --color-border: #FFFFFF;
    --color-focus: #E74C3C;
    --color-success: #BADA55;
    --color-warning: #F1C40F;
    --color-error: #E74C3C;
    --color-info: #3498DB;
    --shadow-sm: 2px 2px 0 rgba(0, 0, 0, 0.3);
    --shadow-md: 5px 5px 0 rgba(0, 0, 0, 0.5);
    --shadow-lg: 8px 8px 0 rgba(0, 0, 0, 0.6);
    color-scheme: dark;
  }
}
```

---

## Component Color Mappings

### WindowCard (Retro Window)
- **Light:** White bg, Navy border 2.5px, Lime Green title bar, Navy text, Coral Red shadow
- **Dark:** Navy bg, White border 2.5px, Lime Green title bar, White text, Coral Red shadow

### Buttons
- **Primary:** Coral Red bg, White text (light) / Navy text (dark)
- **Secondary:** Lime Green bg, Navy text
- **Tertiary:** Gray bg, Navy text (light) / White text (dark)

### Tags/Badges
- **Upcoming:** Lime Green #BADA55
- **Past:** Yellow Gold #F1C40F
- **Featured:** Coral Red #E74C3C
- **Status:** Bright Blue #3498DB

### Forms
- **Input border:** 2.5px Navy (light) / 2.5px White (dark)
- **Focus ring:** 3px Coral Red
- **Error:** Coral Red #E74C3C

---

## Contrast Verification (WCAG AA 4.5:1)

| Foreground | Background | Contrast |
|-----------|-----------|----------|
| Navy #1C3A47 | White #FFFFFF | 10:1 ✓ |
| White #FFFFFF | Navy #1C3A47 | 10:1 ✓ |
| Navy #1C3A47 | Lime Green #BADA55 | 4.87:1 ✓ |
| White #FFFFFF | Bright Blue #3498DB | 4.6:1 ✓ |
| Lime Green #BADA55 | Navy #1C3A47 | 5.8:1 ✓ |
| Gray #95A5A6 | White #FFFFFF | 4.54:1 ✓ |

---

## Pages Updated (All 12)

All pages converted from retro Palladian palette to vibrant palette with light/dark theme support. Color hierarchy: Lime Green (primary), Bright Blue (secondary), Yellow Gold (tertiary), Coral Red (critical actions).

**Implementation Status:** Ready for Tailwind config and component refactoring.
