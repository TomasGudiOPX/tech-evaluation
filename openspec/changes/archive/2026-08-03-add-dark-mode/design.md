# Design: Dark Mode

## Context

The web app's palette is fully driven by CSS custom properties in `:root` (`styles.css:1-41`). Components reference variables for backgrounds, text, borders, badges, and shadows, which makes dark mode a variable-override problem rather than a component-by-component restyle. A small set of hardcoded colors exists outside `:root` (~17 unique tokens) that must be variable-ized or overridden. The admin console is a separate React root (`AdminApp`) that shares `localStorage` with the storefront. See `proposal.md` for the motivation.

## Goals / Non-Goals

**Goals:**
- Dark palette across all views with sufficient contrast.
- A runtime Light/Dark toggle in the storefront header and the admin top bar.
- Persist the selection so reloads (including hard navigation) keep it.
- Default to the OS color scheme on first visit.
- Keep light theme visually identical to today.

**Non-Goals:**
- Cross-tab live sync of the theme (the admin tab reads the persisted value on load; changing it in one tab does not repaint the other).
- Per-user server-side theming or API-driven themes.
- Redesigning the light palette.

## Decisions

### 1. `data-theme` attribute on `<html>` + CSS variable overrides

Set `document.documentElement.dataset.theme = 'dark' | 'light'`. Add a `[data-theme='dark']` block that redefines the `:root` palette variables (backgrounds, text, borders, badges, shadows, accent-light). Because every component already consumes variables, the entire UI restyles with one attribute — no per-component class changes.

- **Alternative considered:** A `@media (prefers-color-scheme: dark)` block with no toggle.
- **Why not:** Gives no manual override, and the user explicitly asked for a toggle. The media query is still used to pick the initial value.

### 2. `useTheme` hook for state, persistence, and default

A small `hooks/useTheme.ts` hook:
- Initial value: `localStorage['theme']` if set, else `prefers-color-scheme: dark ? 'dark' : 'light'`.
- On mount and on change, writes the value to `document.documentElement.dataset.theme` and (on user toggle) to `localStorage['theme']`.
- Exposes `{ theme, toggle }`.

Both `Header` and `AdminApp` use the hook, so the toggle works in both roots. The persisted `localStorage` key is shared, satisfying the persistence requirement across reloads and the admin tab.

- **Alternative considered:** Hoisting theme state into `useCartState`.
- **Why not:** The admin tab and storefront are separate React roots with their own hook instances; a shared module-level approach (localStorage + document attribute) is simpler than cross-root state.

### 3. No-flash initial paint

`index.html` gets a tiny inline script in `<head>` that reads `localStorage['theme']` (falling back to `prefers-color-scheme`) and sets `data-theme` on `<html>` before the app bundle loads, preventing a light-flash for dark users. The `useTheme` hook then owns the value from that point.

### 4. Variable-ize the hardcoded colors

The audit found ~17 hardcoded tokens outside `:root`. Functional colors (amber cart badge `#d97706`, green/red/amber state colors) stay as-is since they read acceptably on both palettes. Surface/backdrop tokens are converted to variables and overridden in dark mode:
- `.site-header` translucent backdrop `rgba(248,246,240,0.9)` → `--header-bg` (override to a dark translucent value).
- Accent focus ring `rgba(27,77,62,0.12)` → `--focus-ring`.
- Subtle surface `#f0e9dd` and any remaining hex borders → existing `--bg-surface-subtle` / `--border-subtle` variables.
- Badge text/background hexes → the existing `--badge-*-bg` / `--badge-*-text` variables where they are not already using them.

### 5. Toggle control

A compact, accessible sun/moon icon button with an `aria-label`/`title`. Storefront: placed in the header account area. Admin: placed in the `AdminApp` top bar.

## Risks / Trade-offs

- **Missed hardcoded color** → [Risk] → Mitigation: task list includes a `grep` audit of every hex/rgb outside `:root`; shadows and overlays get explicit dark overrides.
- **Light-flash on load** → [Risk] → Mitigation: inline `index.html` script sets the attribute before first paint.
- **Low contrast in dark mode** → [Risk] → Mitigation: dark palette uses a near-black base and off-white text (≥ ~9:1 contrast); badge colors are darkened for dark backgrounds.
- **Backdrop-filter/overlays** → [Risk] → Mitigation: header and modal backdrops get dark translucent overrides via variables.

## Migration Plan

1. Add `[data-theme='dark']` variable overrides and convert hardcoded surface/backdrop colors to variables.
2. Add `hooks/useTheme.ts`; wire the inline no-flash script in `index.html`.
3. Add toggle buttons to `Header` and `AdminApp` with styles.
4. Rebuild the web image and verify light (unchanged) and dark rendering, persistence, and system default.
5. Rollback: revert the web changes and rebuild — theme always resolves to light; no data migration.

## Open Questions

None — cross-tab live theme sync is an explicit non-goal; everything else is decided above.
