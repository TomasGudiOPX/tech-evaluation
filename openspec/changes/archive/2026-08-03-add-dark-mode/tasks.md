# Tasks: Add Dark Mode

## 1. Dark palette in CSS

- [x] 1.1 Add a `[data-theme='dark']` block in `apps/web/src/styles.css` that redefines the `:root` palette variables (backgrounds, text, borders, badges, accent-light) for a low-light palette
- [x] 1.2 Convert the hardcoded surface/backdrop colors to variables and add dark overrides: `.site-header` backdrop `rgba(248,246,240,0.9)` → `--header-bg`, accent focus ring `rgba(27,77,62,0.12)` → `--focus-ring`, subtle surface `#f0e9dd` and any remaining hardcoded borders → existing surface/border variables
- [x] 1.3 Add dark-mode overrides for shadows (`--shadow-*`), modal backdrop, and the toast stack so overlays sit correctly on the dark palette
- [x] 1.4 Audit `apps/web/src/styles.css` with a grep for remaining hex/rgb tokens outside `:root` and `[data-theme='dark']`; convert or confirm each is intentionally theme-neutral (e.g. functional green/red/amber)

## 2. Theme hook and no-flash boot

- [x] 2.1 Create `apps/web/src/hooks/useTheme.ts`: initial value from `localStorage['theme']` else `prefers-color-scheme: dark`; applies `data-theme` on `<html>`; exposes `{ theme, toggle }`; persists on toggle
- [x] 2.2 Add a tiny inline script to `apps/web/index.html` `<head>` that sets `data-theme` from `localStorage['theme']` (falling back to `prefers-color-scheme`) before the bundle loads, to avoid a light-flash in dark mode

## 3. Toggle controls

- [x] 3.1 Add a sun/moon theme toggle button to the storefront `apps/web/src/components/Header.tsx` using `useTheme`
- [x] 3.2 Add a theme toggle button to the admin top bar in `apps/web/src/components/AdminApp.tsx` using `useTheme`
- [x] 3.3 Style the toggle button (icon, active state, hover) in `apps/web/src/styles.css`

## 4. Verification

- [x] 4.1 Run `yarn workspace @vps-template/web lint` (tsc --noEmit) and fix any type errors
- [x] 4.2 Rebuild the web image with `docker compose up -d --build web` and confirm the app still serves 200 at `/` and `/admin`
- [x] 4.3 Manually verify the specs: toggle switches light/dark instantly in both the storefront header and admin top bar; the selection survives a reload; a first visit without a saved preference follows the OS scheme; all views remain readable in dark mode and light mode is unchanged
