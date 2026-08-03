# Add Dark Mode

## Why

The storefront and admin console are hardcoded to a light palette via CSS custom properties in `:root`. Nighttime or low-light users get a bright screen with no alternative, and the app does not respond to the operating system's dark-mode preference.

## What Changes

- Add a **dark theme** that redefines the existing CSS palette variables for low-light conditions, including overrides for the handful of hardcoded colors (site-header backdrop, focus rings, subtle surfaces).
- Add a **theme toggle** in the storefront header and the admin top bar so users can switch between Light and Dark at runtime.
- **Persist** the chosen theme in `localStorage` so it survives reloads and new tabs (admin tab reads the same key).
- **Default** the first visit to the operating system's color scheme (`prefers-color-scheme`), falling back to light.
- No API, database, or contract changes; light theme remains the visual default when the user has no preference.

## Capabilities

### New Capabilities
- `theme-mode`: Behavior of theme selection and rendering in the web app — the dark palette, the toggle control, persistence across reloads, and the default-to-system-preference behavior.

### Modified Capabilities
- None.

## Impact

- `apps/web/src/styles.css` — dark palette variable overrides (e.g. `[data-theme="dark"]`), replacement of hardcoded colors with variables, and dark-mode adjustments for shadows/badges/overlays.
- `apps/web/src/components/Header.tsx` — theme toggle button in the storefront header.
- `apps/web/src/components/AdminApp.tsx` — theme toggle in the admin top bar.
- `apps/web/src/hooks/useCartState.ts` or a small theme helper — theme state, persistence, and initial-value logic.
- No API, database, or contract changes.
