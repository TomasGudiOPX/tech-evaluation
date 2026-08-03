# Admin Panel

## Purpose

Defines how administrators reach and use the product-management console: a dedicated `/admin` route opened in its own browser tab, isolated from the storefront chrome, with a product form that stays visible while browsing the product list.

## Requirements

### Requirement: Admin console has a dedicated route

The system SHALL expose the administrator product-management console at the URL `/admin`. The route MUST be deep-linkable and refreshable: a hard navigation or reload at `/admin` MUST load the admin console instead of returning an error.

#### Scenario: Hard load at the admin URL

- **WHEN** a browser navigates directly to `/admin`
- **THEN** the admin console loads successfully without a 404 response

#### Scenario: Refresh on the admin URL

- **WHEN** an administrator refreshes the page while on `/admin`
- **THEN** the admin console reloads at the same URL without error

### Requirement: Admin button opens a separate tab

The header **Admin** button SHALL open the admin console in a new browser tab at `/admin`, and SHALL NOT navigate the current storefront tab away from its current view.

#### Scenario: Admin opens the console

- **WHEN** an administrator clicks the **Admin** button in the header
- **THEN** a new browser tab opens at `/admin`
- **AND** the current tab remains on its previous storefront view

### Requirement: Admin console is access-controlled

The `/admin` route SHALL only be accessible to users with the administrator role. A signed-out user or a signed-in customer navigating to `/admin` SHALL be redirected to the storefront instead of seeing the admin console.

#### Scenario: Signed-in administrator

- **WHEN** a signed-in user with role `admin` navigates to `/admin`
- **THEN** the admin console is displayed

#### Scenario: Signed-out visitor

- **WHEN** a visitor who is not signed in navigates to `/admin`
- **THEN** the visitor is redirected to the storefront catalog

#### Scenario: Signed-in customer

- **WHEN** a signed-in user with role `customer` navigates to `/admin`
- **THEN** the user is redirected to the storefront catalog

### Requirement: Admin console is isolated from storefront chrome

The `/admin` route SHALL render only the admin console with its own minimal header, and SHALL NOT render the storefront navigation (Catalog, Cart, Orders) or storefront views.

#### Scenario: Admin console has isolated chrome

- **WHEN** the admin console is displayed at `/admin`
- **THEN** the page shows only admin console content and a minimal admin header
- **AND** no storefront navigation or storefront views are shown

### Requirement: Product form panel is sticky

On wide screens where the admin console renders the product form and the product list side by side, the product form panel SHALL remain visible while the administrator scrolls through the product list. On narrow screens the panel SHALL scroll normally with the page.

#### Scenario: Scrolling the product list on a wide screen

- **WHEN** an administrator scrolls down the product list on a wide screen
- **THEN** the product form panel stays in view instead of scrolling away

#### Scenario: Narrow screen layout

- **WHEN** the admin console is displayed on a narrow screen (single-column layout)
- **THEN** the product form panel scrolls normally with the page and does not overlay the product list
