# Theme Mode

## Purpose

Lets users view the storefront and admin console in a light or dark palette, with a runtime toggle that persists across reloads and defaults to the operating system's color scheme on first visit.

## ADDED Requirements

### Requirement: Dark theme rendering

The web app SHALL render with a dark palette when the dark theme is active and with the existing light palette otherwise. All views (catalog, detail, cart, checkout, orders, auth modal, and the admin console) SHALL remain readable in both palettes.

#### Scenario: Dark theme is active

- **WHEN** the dark theme is active
- **THEN** the app renders with the dark palette across all views
- **AND** text remains legible against the dark surfaces

#### Scenario: Light theme is active

- **WHEN** the light theme is active
- **THEN** the app renders with the existing light palette

### Requirement: Theme toggle

The user SHALL be able to switch between light and dark themes at runtime from a control in the storefront header and from the admin console top bar. Switching SHALL apply immediately to the current page without a reload.

#### Scenario: Switch from light to dark

- **WHEN** the user activates the theme toggle while in light theme
- **THEN** the app switches to the dark palette immediately
- **AND** the toggle reflects the dark state

#### Scenario: Switch from dark to light

- **WHEN** the user activates the theme toggle while in dark theme
- **THEN** the app switches back to the light palette immediately

### Requirement: Theme persistence

The selected theme SHALL be persisted and restored on subsequent page loads, including hard navigation or refresh.

#### Scenario: Reload keeps the theme

- **WHEN** the user selects the dark theme and reloads the page
- **THEN** the app loads with the dark theme active

### Requirement: Default theme follows the system

On first visit, before the user has made a selection, the app SHALL adopt the operating system's color-scheme preference.

#### Scenario: System prefers dark on first visit

- **WHEN** a visitor with the operating system set to dark mode opens the app for the first time
- **THEN** the app renders with the dark palette

#### Scenario: System prefers light on first visit

- **WHEN** a visitor with the operating system set to light mode opens the app for the first time
- **THEN** the app renders with the light palette
