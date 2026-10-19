---
name: ui-guidelines
description: "Use this skill ALWAYS when creating or modifying ANY visual element, component, or layout on the page."
---

# UI Design System Guidelines

This document serves as the single source of truth for the frontend styling of this application. The application follows a premium aesthetic inspired by Apple's clean minimalism vibrant, professional color palettes.

## 1. Core Principles
- **Extreme Cleanliness:** Whitespace is your best friend. Do not clutter interfaces. Use generous padding (e.g., `24px` or `32px` inside cards).
- **Soft Geometry:** Hard edges are forbidden. Everything uses a generous `border-radius`.
- **Soft Shadows & Unified Primary Color Borders:** **All main containers (cards, Bento tiles, highlight tab content) AND their structured sub-elements** (e.g. pills, chips, spec boxes, selector nodes, inspector panels, list rows, metric containers, switch wrappers) MUST have their border permanently applied in a single, unified color matching the project's primary brand theme color (`border: 1px solid var(--app-primary-color) !important;` / `border-color: var(--app-primary-color) !important;`) across all screen sizes (desktop and mobile alike), not only when hover. Keep borders clean and thin (`1px`). Popups and floating modals (such as the cookie banner) must NOT have card borders. Special status banners (such as non-production admin warning alerts) must maintain their dedicated semantic styling (e.g. amber alert border and accent bar) rather than being overridden by standard card borders.
- **Vibrant Call-to-Actions (CTAs):** Primary actions should pop against the clean white/dark background.
- **Calm Motion:** We avoid jerky layout shifts or jumping elements (e.g., no `translateY` on hover for cards). We prefer subtle shadow highlights instead.

## 2. Typography
- **Primary Font:** `Inter` (Google Fonts). Never use Roboto.
- **Hierarchy:** 
  - Main titles (h1, h2) should be bold (weight 700 or 800) and large.
  - Body text should be readable, often with a slightly muted color (use CSS variables for secondary text) rather than pure black or pure white.

## 3. The "Bento" Card System
All content must live inside premium cards. When creating new components, structure them as "Bento boxes".
- **Border Radius:** Use global CSS variables for standard cards.
- **Shadow (Light Mode):** Use global CSS elevation variables/classes.
- **Backgrounds:** Use global CSS variables for surface and nested backgrounds.
- **Unified Primary Color Borders:** Every main container (`mat-card`, `.bento-card`, `.hero-bento-card`, `.bento-role-card`, `.highlight-tab-content`, custom tiles) as well as structured sub-elements inside them must have a unified 1px border matching the primary brand color (`var(--app-primary-color)`) permanently applied at all times across all viewports (desktop, tablet, mobile). Floating banners/popups like cookie consent should not have container borders.
- **Alert & Status Card Exceptions:** Special semantic alert cards (`.app-alert-warning`, error banners) retain their dedicated alert border colors (`border: 2px solid $alert-warning-border !important; border-left: 6px solid $alert-warning-accent !important;`) and must not receive the generic card border.

*Use the global SCSS classes and variables defined in `styles.scss` rather than hardcoding these values.*

## 4. Color Palette
The exact colors are defined and can be changed by the developer in `styles.scss` (when rebranding or adjusting application colors across Light and Dark modes, follow the [`adjust-project-colors`](../adjust-project-colors/SKILL.md) skill). Always use CSS variables (`var(--name)`) instead of raw HEX values.
- **Light Mode (Default):**
  - Background & Surface: Use `var(--app-background-color)` and `var(--app-surface-color)`
  - Text: Use `var(--app-text-primary)` and `var(--app-text-secondary)`
  - Accents & Primary: Use `var(--app-primary-color)` (used for unified element borders, navbar/footer, highlights), `var(--app-accent-color)`, `var(--app-warn-color)`
- **Dark Mode:**
  - Background & Surface: Use `var(--app-background-color)` and `var(--app-surface-color)`
  - Nested Cards: Use `var(--app-nested-surface-color)`
  - Text: Use `var(--app-text-primary)` and `var(--app-text-secondary)`

## 5. Micro-interactions
- **Hover States:** Buttons and interactive cards must have a transition.
  - Cards & Sub-elements: The unified border (`var(--app-primary-color)`) is already applied permanently at all times. On hover (on desktop), intensify the `box-shadow` (`0 15px 35px -5px rgba(0,0,0,0.12)`). **ABSOLUTELY NO BOUNCING**: do NOT use `translateY` or any position-shifting transforms on hover for cards.
- **Active States:** Buttons scale down subtly (`transform: scale(0.98)`).
- **Toggle Controls & Selected State Bolding Standard:**
  - **All toggles, segmented switches, and interactive selectable items** (theme toggle: Jasny / Ciemny, language switcher: 🇵🇱 Polski / 🇬🇧 English, pipeline step nodes, stage tabs, `mat-button-toggle`, tab buttons) **MUST be styled identically when selected** to maintain visual consistency across the entire application:
    1. **Bold Label Text:** `font-weight: 800 !important;` (standard bolding for the active label).
    2. **Distinct Background Fill / Tint:** `background-color: var(--app-accent-selected-bg) !important;` (subtle brand tint in light/dark mode).
    3. **Accent Highlight Border:** `border: 2px solid var(--app-accent-color) !important;`.
    4. **Halo Drop Shadow:** `box-shadow: 0 0 0 1px var(--app-accent-color), 0 8px 20px -6px rgba(79, 70, 229, 0.25) !important;` (or dark mode accent equivalent).
    5. **Accent-Themed Nested Icons & Text:** Colorize active icons and key labels (`color: var(--app-accent-color) !important;`).

## 6. Loading States (Skeletons)
- **No Disappearing Content:** When loading data (e.g. fetching user details or waiting for a server response), do not use spinning loaders (`mat-spinner`) or completely hide/re-render the container.
- **Always Use Skeletons:** Use a blurred layout skeleton (`<app-skeleton>`) that mirrors the shape of the incoming content. Reference the animation on the `login` page for the expected behavior. This prevents layout shifts and gives a premium, seamless feel.

## 7. Theming and Colors (CSS Variables)
- **No Hardcoded Colors in Components:** Never hardcode colors (HEX, RGB, etc.) in component SCSS files (e.g. `login.component.scss`).
- **Use Global Variables:** All colors must be defined as CSS custom properties (`var(--name)`) in `styles.scss` (inside `:root` and `.dark-theme`). Components should only consume these variables.
- **Bind CSS Variables to SCSS Variables:** Do not hardcode HEX values directly into CSS variables (e.g. `--color: #ffffff;`). Instead, define them as SCSS variables at the top of the file (e.g. `$app-surface-color: #ffffff;`) and bind them using interpolation: `--app-surface-color: #{$app-surface-color};`. This ensures a single source of truth for the entire application palette.

## 8. Responsiveness and Overflow (Mobile First)
- **Unified Permanent Borders on Main & Sub-Elements:** All cards/Bento tiles, tables, and structured sub-elements must display their unified primary theme border (`1px solid var(--app-primary-color) !important;`) permanently across all viewports (desktop, tablet, mobile).
- **Selected vs. Unselected Clarity:** In layouts where sub-elements or toggles are selectable (theme switch, language toggle, tabs, step selectors), ensure the active item is distinguished by bold font (`font-weight: 800 !important;`), background tint (`var(--app-accent-selected-bg)`), accent border, and colored icons.
- **Prevent Text Overflow:** ALWAYS assume that text (especially warning notes, banners, or long user-generated content) might be too long for mobile screens.
- **Flexbox & Wraps:** When placing text inside a `display: flex;` container, always ensure it can wrap. Apply `word-break: break-word;` and `white-space: normal;` to `<span>` or text elements inside flex containers to prevent horizontal scrolling or cut-off text on phones.
- **Card Width Overflow (100% vs Margins):** `mat-card` components have a global responsive margin (`margin: clamp(...)` in `styles.scss`). If you set `width: 100%` on a `mat-card`, it will exceed the viewport and get cut off on mobile devices. To fix this, always add `margin: 0 !important;` to the `mat-card` when forcing `width: 100%`, and use `padding` on the parent container instead.

## 9. Angular Material Integration
When using Angular Material components:
- **Buttons (`mat-mdc-button`):** Must be rounded. The global `styles.scss` forces a `border-radius: 12px`. Do not override this to make them sharp.
- **Form Actions:** Primary action buttons in forms (e.g. "Save", "Cancel", "Send reset link") must be identically sized. Use the `.app-action-button` class to enforce `width: 100%` and a consistent `48px` height.
- **Inputs (`mat-form-field`):** Use the `appearance="outline"` style exclusively. The outlines should be subtle, with soft focus rings.
- **Elevation:** Do not use `mat-elevation-z*` classes. They look outdated. Use our custom soft shadow classes.

## 10. Internationalization (i18n)
- **No Hardcoded Texts:** Never hardcode user-facing texts (like "Continue with Google" or "Premium Accelerator") directly into HTML templates.
- **Always Use Translation Pipes:** Always define keys in `src/assets/i18n/pl.json` and `en.json`, and use the `translate` pipe (e.g., `{{ 'login.promo.title' | translate }}`).

## 11. Security and Admin Panel
- **Role Security:** EVERY single page, tab, or section within the "Admin Panel" MUST be secured by a specific access role (e.g. `ADMIN_PAGE_ACCESS`, `ADMIN_CORE_SETTINGS`). Do not create globally accessible sections in the admin panel. Use the `AccessRoleService` and `@if` blocks or route guards to protect all features.

## 12. Dialogs and Popups
- **Always Use the Generic Popup:** Whenever a new confirmation, warning, error, or informational popup is required, do NOT create a new component. You MUST use the existing `DialogComponent` via the `DialogService` (`openConfirmDialogWithData`).
- **Customization:** The generic popup supports title, message, cancel/confirm button texts, built-in types (CONFIRMATION, WARNING, ERROR), as well as custom Material icons (`icon`, `iconColor`, `iconSize`) that automatically scale responsively.

## 13. Scrolling to Elements
- **Always Include Visual Padding (Offset):** When programmatically or declaratively scrolling to a specific element (e.g., via `scrollIntoView()`, `window.scrollTo()`, or anchor navigation), never scroll so the element sits flush against the very top edge of the viewport or sticky header.
- **Keep Breathing Room:** Always maintain comfortable visual padding (e.g., `24px`–`32px` of extra space, or `80px`–`100px` when accounting for a sticky top bar). Prefer setting `scroll-margin-top` in CSS on target elements or calculating a top offset with `behavior: 'smooth'` so the scrolled-to element looks balanced and well-framed.

