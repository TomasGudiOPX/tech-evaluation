# Design: Admin Route and Sticky Form Panel

## Context

The web app is a Vite React SPA with **no router** — navigation is a `view` state machine (`catalog | detail | cart | checkout | orders | admin`) held in `useCartState`. The admin console is rendered inline as `view === 'admin'` and is guarded client-side by `user?.role === 'admin'` (`main.tsx:122`). The `web` container serves the built SPA with stock nginx (`try_files $uri $uri/ =404`), so arbitrary paths 404 on hard load. See `proposal.md` for the motivation.

## Goals / Non-Goals

**Goals:**
- Make `/admin` a real, refreshable, deep-linkable route that renders only the admin console.
- Header **Admin** button opens `/admin` in a new browser tab without disturbing the storefront tab.
- Keep admin access guarded by the administrator role (client UX guard; API RBAC remains authoritative).
- Make the product form panel sticky on wide screens.
- Minimal, surgical change: no router library, no API/DB/contract changes.

**Non-Goals:**
- Cross-tab state sync (sign-out or product edits in one tab will not appear in the other until refresh).
- Storefront tab auto-refresh when the admin tab edits/retires products.
- A full URL-routing system for the storefront (catalog/cart/orders remain `view`-based).

## Decisions

### 1. Boot-time pathname check instead of a router library

`main.tsx` inspects `window.location.pathname` at boot. If it starts with `/admin`, it mounts an admin-only root; otherwise it mounts the existing storefront app. This is the smallest change that yields a real `/admin` route.

- **Alternative considered:** React Router with a `/admin` route and converting all `view` navigation to URL routes.
- **Why not:** Heavier churn for a single route; would restructure every storefront navigation point. The SPA's state-machine navigation works well today.

### 2. Admin button becomes a real link opening a new tab

The header **Admin** button becomes `<a href="/admin" target="_blank" rel="noopener noreferrer">`. `target="_blank"` opens a new tab and keeps the storefront tab exactly where it was.

### 3. Admin root reuses the existing hook and view

A new `AdminApp` component (mounted only for `/admin`) calls the existing `useCartState()` — it already loads products and the profile on mount and exposes `adminForm`, `saveProduct`, `retireProduct`, `startEditing`, `cancelEditing`. It renders a slim admin top bar plus the existing `<AdminView>` (unchanged). `useCartState`'s internal `view` value is irrelevant to the admin root.

- **Alternative considered:** A dedicated admin data hook.
- **Why not:** `useCartState` already provides everything; a second hook would duplicate product/profile loading.

### 4. Non-admin redirect

The `AdminApp` watches `user` (from `loadProfile`, backed by the JWT in `localStorage`). Once auth settles: if `user` is null or `role !== 'admin'`, it redirects `window.location.assign('/')` to the storefront. The API's `JwtAuthGuard`/`RolesGuard` remain the real security boundary; this redirect is UX.

### 5. SPA fallback in the web container

Add `apps/web/nginx.conf` with `try_files $uri $uri/ /index.html;` and `COPY` it into the nginx stage of `apps/web/Dockerfile` (mirrors how the proxy mounts `nginx/default.conf`). This makes `/admin` hard-loads and refreshes serve `index.html` instead of 404.

### 6. Sticky form panel via CSS

On wide screens, `.admin-form-card` gets `position: sticky` with a `top` offset that clears the sticky `.site-header`. The existing `@media (max-width: 960px)` block (which already collapses `.admin-grid` to one column and resets `.summary-sidebar` to `static`) also resets `.admin-form-card` to `position: static` so the form never overlays the list on narrow screens.

- **Edge case:** when the image preview makes the form taller than the viewport, sticky clamps the card — acceptable for typical forms.

## Risks / Trade-offs

- **Stale state between tabs** → Non-goal; document in README/INFORME_IA. Add a `storage`/`focus` listener later if desired.
- **Client redirect is not security** → API RBAC remains authoritative; redirect only improves UX.
- **Removing `admin` from the storefront `View` union** could break call sites → Keep the change atomic: remove the inline block and Header `setView('admin')` at the same time as adding the link; `tsc --noEmit` catches stragglers.
- **nginx fallback hides missing assets** → `try_files ... /index.html` returns the SPA for any path; that is the intended SPA behavior, but real asset 404s also become 200s. Acceptable for a single-page app.

## Migration Plan

1. Add `apps/web/nginx.conf` and update `apps/web/Dockerfile`.
2. Add `AdminApp` root and the boot-time pathname check in `main.tsx`.
3. Change the header Admin button to a link; remove inline admin rendering and the `'admin'` view value from the storefront.
4. Add sticky CSS.
5. Rebuild the `web` image and verify: `/admin` hard-loads, header button opens a new tab, non-admin redirects, sticky form works, storefront unchanged.
6. Rollback: revert the web changes and rebuild — `/admin` simply 404s again; no data migration involved.

## Open Questions

None — the deferred cross-tab sync and storefront refresh are explicit non-goals, not unanswered decisions.
