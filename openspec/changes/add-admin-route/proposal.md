# Add Admin Route

## Why

The admin panel is currently rendered inline inside the single-page storefront as just another `view` state (`view === 'admin'`). Opening it navigates the same tab away from the catalog, there is no stable URL for the panel, and refreshing or deep-linking to it is impossible because the web container serves the SPA without a fallback to `index.html`. Administrators also lose sight of the product form once the list grows, because the form scrolls away with the page.

## What Changes

- The header **Admin** button opens the admin console in a **separate browser tab** at the URL `/admin`, leaving the storefront tab untouched.
- `/admin` becomes a real, deep-linkable, refreshable route in the SPA that renders **only** the admin console with its own minimal chrome (no storefront catalog/cart/orders navigation).
- Access to `/admin` remains guarded by the existing administrator role (`user.role === 'admin'`); non-admins are sent back to the storefront.
- The web container gains an SPA fallback so `/admin` hard-loads and refreshes work instead of returning 404.
- On wide screens, the create/edit product form panel (left column of the admin console) becomes sticky so it stays in view while scrolling the product list.

## Capabilities

### New Capabilities
- `admin-panel`: Behavior of the administrator product-management console in the web app — how it is reached (`/admin` route, separate tab), how access is guarded, its isolated chrome, and the sticky product form layout.

### Modified Capabilities
- None.

## Impact

- `apps/web/src/main.tsx` — boot-time pathname check; mount an admin-only root for `/admin`.
- `apps/web/src/components/Header.tsx` — Admin button becomes a link that opens `/admin` in a new tab.
- `apps/web/src/components/AdminView.tsx` — reused by the admin root; possibly receives its own minimal header.
- `apps/web/src/hooks/useCartState.ts` — initial view derived from the route; logout/guard behavior for the admin route.
- `apps/web/src/styles.css` — sticky form panel styling (+ responsive reset under 960px).
- `apps/web/Dockerfile` / web nginx config — SPA fallback (`try_files ... /index.html`) for the web container.
- No API, database, or contract changes.
