# Tasks: Add Admin Route

## 1. SPA fallback for the web container

- [x] 1.1 Add `apps/web/nginx.conf` with `try_files $uri $uri/ /index.html;` so `/admin` hard-loads and refreshes serve the SPA
- [x] 1.2 Update `apps/web/Dockerfile` to COPY `apps/web/nginx.conf` into `/etc/nginx/conf.d/default.conf` in the nginx stage

## 2. Admin route boot check

- [x] 2.1 In `apps/web/src/main.tsx`, add a boot-time check of `window.location.pathname` that mounts an admin-only root for `/admin` and the existing storefront app otherwise
- [x] 2.2 Create `apps/web/src/components/AdminApp.tsx` that reuses `useCartState()`, renders a slim admin top bar (brand, link back to storefront, user email, sign out) plus the existing `<AdminView>`
- [x] 2.3 In `AdminApp`, redirect `window.location.assign('/')` to the storefront when auth settles and `user` is null or `role !== 'admin'`

## 3. Header admin link

- [x] 3.1 Change the header **Admin** button in `apps/web/src/components/Header.tsx` to an `<a href="/admin" target="_blank" rel="noopener noreferrer">` link
- [x] 3.2 Remove the inline `view === 'admin'` rendering block from the storefront `apps/web/src/main.tsx`
- [x] 3.3 Remove `'admin'` from the `View` union in `apps/web/src/types/index.ts` and clean up any now-unused references (e.g. Header `setView('admin')`)

## 4. Sticky product form panel

- [x] 4.1 Add `position: sticky` with a `top` offset clearing the sticky site header to `.admin-form-card` in `apps/web/src/styles.css`
- [x] 4.2 Reset `.admin-form-card` to `position: static` inside the existing `@media (max-width: 960px)` block so the form scrolls normally on narrow screens

## 5. Verification

- [x] 5.1 Run `yarn workspace @vps-template/web lint` (tsc --noEmit) and fix any type errors
- [x] 5.2 Rebuild the web image with `docker compose up -d --build web` and confirm `http://127.0.0.1:8080/admin` hard-loads the admin console without 404
- [x] 5.3 Manually verify the specs: header Admin button opens a new tab at `/admin`; signed-out and customer users at `/admin` are redirected to the catalog; the product form stays sticky on wide screens and scrolls normally on narrow screens; the storefront catalog/cart/orders flows are unaffected
