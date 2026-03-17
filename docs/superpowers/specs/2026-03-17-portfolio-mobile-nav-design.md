# Portfolio Mobile Navigation Design

## Goal

Fix the portfolio navigation so the `About` page remains reachable on mobile devices. The current shared navigation hides desktop links below `768px` and does not provide a mobile replacement, which removes access to `Home / About / Projects / Contact`.

## Root Cause

- `styles.css` hides `.nav-links` on small screens.
- `script.js` does not provide any mobile navigation behavior.
- Shared pages using the `glass-nav` pattern therefore lose their navigation links on mobile.

## Recommended Approach

Add a shared hamburger menu pattern for the portfolio's common navigation.

### Scope

- Update shared pages that use `glass-nav`:
  - `index.html`
  - `about/index.html`
  - `projects/index.html`
- Extend shared styles in `styles.css`
- Extend shared behavior in `script.js`

### Interaction Model

- Desktop keeps the current inline navigation.
- Mobile shows a menu toggle button inside the top navigation bar.
- Tapping the toggle opens a dropdown panel with:
  - `Home`
  - `About`
  - `Projects`
  - `Contact`
- Selecting a link closes the menu.
- Tapping outside the menu or pressing `Escape` closes the menu.

## Accessibility Requirements

- Toggle button uses `aria-expanded`
- Toggle button references the mobile panel with `aria-controls`
- Mobile panel uses semantic navigation markup
- Active page link remains visually identifiable

## Visual Direction

- Preserve the existing glassmorphism style
- Keep the mobile menu aligned with the current rounded navigation shell
- Avoid introducing a separate bottom nav or page-specific shortcut pattern

## Testing Strategy

- Add a small smoke check that verifies:
  - mobile toggle markup exists
  - mobile panel contains the `About` link
  - accessibility markers for the toggle and panel are present
- Manually verify on a narrow viewport that:
  - the menu opens
  - `About` is visible and tappable
  - the menu closes correctly after selection
