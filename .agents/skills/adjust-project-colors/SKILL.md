---
name: adjust-project-colors
description: "Use this skill when adjusting, rebranding, or synchronizing colors across the entire application in both Standard (Light) and Dark mode to match the project's brand/theme colors."
---

# Project Color Adjustment & Dual-Mode Theme Synchronization Skill

This skill provides a comprehensive, step-by-step runbook for adjusting and synchronizing colors across the entire Angular application in both **Standard (Light) Mode** and **Dark Mode** so that every surface, palette, Material component, CSS variable, gradient, and component stylesheet coherently reflects the project's brand colors.

Always use this skill together with [`ui-guidelines`](../ui-guidelines/SKILL.md).

---

## 1. Core Architecture: Single Source of Truth (`src/styles.scss`)

All colors in the application flow from `src/styles.scss` through three synchronized layers:

1. **Layer 1 – SCSS Brand & Theme Variables** (top of `src/styles.scss`):
   - Primary, Accent, Warn, and status (`$app-green-color`, `$app-red-color`) colors.
   - Light Mode surfaces, backgrounds, text, and borders.
   - Dark Mode surfaces, backgrounds, text, borders, tabs, and inputs (harmonized with the brand hue).
   - Skeleton shimmer colors and alert banner tokens for both modes.
2. **Layer 2 – Angular Material M2 Palettes (`$main-palette`, `$accent-palette`, `$warn-palette`)**:
   - Full `50`–`900` + `A100`–`A700` shade ramps derived mathematically from `$app-primary-color`, `$app-accent-color`, and `$app-warn-color`.
3. **Layer 3 – CSS Custom Properties (`:root` and `.dark-theme`)**:
   - Bound to SCSS variables via interpolation (`--variable-name: #{$scss-variable};`).
   - Consumed by all component `.scss` files (`var(--variable-name)`).

---

## 2. Step-by-Step Procedure to Adjust Project Colors

### Step 1: Define or Extract the Core Brand Colors
Identify the project's primary brand colors (either provided by the user, extracted from a logo/design, or existing in `$app-primary-color` / `$app-accent-color`):
- **Primary Brand Color (`$app-primary-color`)**: Main brand identity color (used for navbar, footer, primary buttons, headings, active highlights).
- **Accent Brand Color (`$app-accent-color`)**: Interactive highlight color (used for CTAs, active tabs, badges, links, focus rings, card hover borders, and permanent mobile card borders).
- **Warn / Error Color (`$app-warn-color` & `$app-red-color`)**: Destructive actions and validation errors.
- **Success Color (`$app-green-color`)**: Positive states and confirmations.

---

### Step 2: Harmonize Standard (Light) Mode Tokens in `src/styles.scss`
Update the Light Mode SCSS variables in `src/styles.scss` so they complement the brand colors while maintaining extreme cleanliness and WCAG AA contrast:

```scss
// Brand Core
$app-primary-color: #<PRIMARY_HEX>;
$app-on-primary-color: #ffffff; // or dark text if primary is very light
$app-accent-color: #<ACCENT_HEX>;
$app-on-accent-color: #ffffff;
$app-warn-color: #<WARN_HEX>;
$app-on-warn-color: #ffffff;

// Light Theme Surfaces & Text
$app-background-color: #f8fafc; // Subtle cool/warm off-white tinted toward brand hue
$app-surface-color: #ffffff;
$app-on-background-color: #0f172a; // High-contrast primary text
$app-text-secondary: #64748b; // Muted secondary text
$app-border-color: rgba(15, 23, 42, 0.05); // Subtle desktop card border
$app-mobile-border-color: rgba(<ACCENT_R>, <ACCENT_G>, <ACCENT_B>, 0.35); // Tinted mobile border token
```

---

### Step 3: Derive Cohesive Dark Mode Tokens from Brand Hue in `src/styles.scss`
Dark mode must **NOT** use generic pure black (`#000000`) or unrelated grays if the project has a distinct primary hue. Tint the dark surfaces subtly with the hue of `$app-primary-color` (around 8%–18% saturation, 8%–16% lightness):

```scss
// --- DARK THEME VARIABLES (Harmonized with $app-primary-color hue) ---
$dark-background: #<DEEP_BRAND_TINTED_BG>;       // e.g. #141e1e for deep teal, #0f172a for indigo/slate
$dark-surface: #<ELEVATED_BRAND_TINTED_SURFACE>; // e.g. #1a2727 (3-5% lighter than $dark-background)
$dark-text-primary: #f8fafc;
$dark-text-secondary: #94a3b8;
$dark-border-primary: rgba(255, 255, 255, 0.08);
$dark-border-secondary: rgba(255, 255, 255, 0.12);
$dark-border-hover: rgba(255, 255, 255, 0.2);
$dark-mobile-border: rgba(<LIGHT_ACCENT_R>, <LIGHT_ACCENT_G>, <LIGHT_ACCENT_B>, 0.45);
$dark-error: #fb7185;
$dark-tab-background: #<ELEVATED_TAB_SURFACE>;   // e.g. #233535 (slightly lighter than $dark-surface)
$dark-input-bg: #<ELEVATED_INPUT_SURFACE>;       // Matches $dark-tab-background for autofill/inputs

// Skeletons (Tinted to match Light & Dark surfaces)
$skeleton-light-1: #e2e8f0;
$skeleton-light-2: #f1f5f9;
$skeleton-light-3: #e2e8f0;

$dark-skeleton-1: #<DARK_SKELETON_BASE>;         // Matches $dark-tab-background
$dark-skeleton-2: #<DARK_SKELETON_HIGHLIGHT>;    // Slightly lighter than $dark-skeleton-1
```

---

### Step 4: Regenerate Full Angular Material Palettes (`50`–`900`, `A100`–`A700`)
Update `$main-palette`, `$accent-palette`, and `$warn-palette` in `src/styles.scss` so every shade matches the new `$app-primary-color`, `$app-accent-color`, and `$app-warn-color`:
- **`500`** MUST reference `$app-primary-color` / `$app-accent-color` / `$app-warn-color`.
- **`50`–`400`** must progress smoothly from very light tints (`50` ~92% lightness) to medium-light (`400`).
- **`600`–`900`** must progress smoothly from slightly darker (`600`) to deep shade (`900` ~8-15% lightness).
- **`A100`, `A200`, `A400`, `A700`** must provide vibrant accent shades (note: `$dark-theme` uses `A200, A100, A400` from `$accent-palette`, so ensure `A200` is legible and vibrant on dark surfaces).
- **`contrast: (500: $app-on-primary-color)`** must ensure readable text on buttons and badges.

---

### Step 5: Update Mesh Gradients & Decorative Blobs (`:root` & `.dark-theme`)
In `src/styles.scss`, update `--mesh-blob-1`, `--mesh-blob-2`, and `--mesh-blob-3` (used in `LoginComponent` visual panel and `StarterShowcaseComponent` hero backdrop) so they blend the new Primary and Accent colors:
- `--mesh-blob-1`: Lighter/brighter complement of `$app-primary-color` (`rgba(..., 0.4)`).
- `--mesh-blob-2`: Rich mid-tone of `$app-primary-color` (`rgba(..., 0.6)`).
- `--mesh-blob-3`: Soft glow of `$app-accent-color` (`rgba(..., 0.3)`).

---

### Step 6: Bind All CSS Custom Properties in `:root` and `.dark-theme`
Verify that `:root` and `.dark-theme` in `src/styles.scss` expose and override all required CSS variables via SCSS interpolation (`#{$var}`):

- `--app-primary-color`
- `--app-accent-color`
- `--app-warn-color` (if used by components)
- `--app-surface-color`
- `--app-background-color`
- `--app-text-primary`
- `--app-text-secondary`
- `--separator-color`
- `--separator-line`
- `--mobile-card-border`
- `--google-btn-bg`, `--google-btn-text`, `--google-btn-hover`, `--google-btn-border`
- `--mesh-blob-1`, `--mesh-blob-2`, `--mesh-blob-3`

> **Dark Mode Legibility Note**: If `$app-primary-color` is very dark (e.g., `#123836`), elements in `.dark-theme` that use `color: var(--app-primary-color)` for text or icons will have poor contrast against `$dark-surface`. In `.dark-theme`, either override `--app-primary-color` to a lighter tint of the primary palette (e.g., `300`/`400` shade or `$app-accent-color`) or ensure dark-theme headings/icons use `#ffffff` / `$dark-text-primary` / `var(--app-accent-color)`.

---

### Step 7: Audit All Component SCSS Files for Hardcoded Colors
Scan every `.scss` file in `src/app/` to eliminate hardcoded HEX/RGB/named colors and replace them with CSS variables or SCSS tokens from `src/styles.scss`:

```powershell
Select-String -Path "src\app\**\*.scss" -Pattern "#[0-9a-fA-F]{3,8}|rgba?\("
```

Check these specific component areas during the audit:
1. **Cards, Bento Tiles & Nested Sub-elements (`styles.scss`, `starter-showcase.component.scss`, `profile.component.scss`, `login.component.scss`, `legal/*.scss`)**:
   - Desktop default border: `1px solid var(--separator-line)`
   - Desktop `:hover` border: `border-color: var(--app-accent-color) !important;`
   - Mobile & Touch (`@media (max-width: 768px), (hover: none)`): Permanent `border-color: var(--app-accent-color) !important;` in both Light and Dark mode on **both main containers (cards, Bento boxes) AND all nested sub-elements** (metric items, status pills, session chips, pipeline nodes/inspectors, spec pills, segmented switch borders, live user/guest boxes, flag rows, stage displays, compliance icon wraps).
2. **Navbar & Footer (`navbar.component.scss`, `footer.component.scss`)**:
   - Light mode background uses `$app-primary-color` and text `$navbar-element-color` / `$footer-element-color`.
   - Dark mode (`.dark-theme .mat-toolbar.mat-primary, .dark-theme .footer`) transitions to `$dark-surface` with `1px solid $dark-border-primary` separator.
   - Avatar fallbacks and borders use theme variables instead of hardcoded `#e0e0e0`, `#757575`, or `black`.
3. **Profile & Dialogs (`profile.component.scss`, `dialog.component.scss`, `user-details.component.scss`)**:
   - Error/warning/success states use `$app-red-color`, `$app-accent-color`, `$app-green-color` or CSS variables.
   - Avatar borders and empty states adapt cleanly in `:host-context(.dark-theme)`.
4. **Tables, Inputs, Tabs, and Snackbars (`.dark-theme` in `styles.scss`)**:
   - Outlined form fields (`mat-form-field`), active tab underlines, checkboxes/radios (`mat-pseudo-checkbox-checked`), and snackbar surfaces must all reflect the updated dark theme tokens.

---

## 3. Verification Checklist

Before finishing any color adjustment task:
1. **Zero Hardcoded Component Colors**: Confirm no raw HEX codes remain in `src/app/**/*.scss` outside of `src/styles.scss`.
2. **Light & Dark Mode Parity**: Verify every new or modified variable exists in both `:root` (Standard Mode) and `.dark-theme` (Dark Mode).
3. **Mobile Permanent Card & Sub-Element Borders**: Confirm `@media (max-width: 768px), (hover: none)` keeps `border-color: var(--app-accent-color) !important;` on all main cards/tiles **and their nested sub-elements** in both Light and Dark mode.
4. **Build & Test Verification**:
   - Run `npx ng build --configuration=local` and confirm exit code `0` with no SCSS or budget errors.
   - Run `npm run test:ci` if any TypeScript or template logic was touched.
