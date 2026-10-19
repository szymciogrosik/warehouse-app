---
name: guest-demo-showcase
description: "Use this skill ONLY when the user explicitly asks to create, update, or generate a demo/showcase page for non-logged-in (guest) users. Never invoke this skill automatically during general feature development unless explicitly requested."
---

# Guest Demo & Standard User Business Showcase Skill

This skill guides the generation and customization of an interactive demo/showcase page (like `StarterShowcaseComponent` inside `HomeComponent`) for **non-logged-in (guest) users**.

Its core goal is to explain **what the service/application is**, clearly compare **what users can do without logging in vs. after logging in**, and provide an interactive preview of the **real business functionality available to standard logged-in users** — strictly excluding internal Admin/Settings tabs.

---

## 1. Activation & Invocation Rule (CRITICAL)

- **Explicit Invocation Only**: This skill MUST ONLY be invoked when the user **explicitly asks** to create, generate, or update the guest demo / showcase page.
- Do **NOT** trigger this skill automatically when adding regular features, services, or components unless the user explicitly asks to showcase them on the demo page.

---

## 2. Content & Business Focus Rules

1. **Focus on Standard User Business Cases (NO Admin/Settings Tabs)**:
   - The showcase must highlight the **actual post-login business workflows and features meant for standard users** (e.g., creating/managing domain items, calculators, dashboards, trackers, personal profile & workflows, interactive tools).
   - **NEVER** showcase or expose Admin Panel tabs, global system settings (`global-settings`, `public-settings`), user management tables, or internal administrative configuration.
   - Do not include "Live Theme & Locale Studio" or feature-flag admin toggles as business features—focus purely on what value the product delivers to a regular end-user.
2. **Clear Service Overview & "Without Login vs. With Login" Comparison**:
   - Explicitly explain **what the service is**, who it is for, and what problem it solves.
   - Present a dedicated, visually scannable comparison (aligned with [`ui-guidelines`](../ui-guidelines/SKILL.md) Bento cards) showing:
     - **Without Login (Guest Mode)**: What users can explore, calculate, preview, or test right now in the interactive demo without an account.
     - **With Login (Standard User Account)**: What unlocks after signing in (e.g., saving data to the cloud, full business workflows, personal history/dashboard, profile customization, real-time synchronization across devices).
3. **Interactive Business Examples**:
   - Let non-logged-in users actively click through realistic business scenarios with pre-populated sample data (e.g., interactive steppers, sample domain calculations, simulated item creation/filtering, or before/after results) so they immediately understand how the app works after login.

---

## 3. Strict Architectural Boundaries (Zero Service Pollution)

The demo page exists to demonstrate standard user capabilities without polluting core business services or databases:

1. **Services May Be Consumed, NEVER Polluted**:
   - The demo component **CAN** inject and use existing application services, domain calculation helpers, pipes, and utilities (e.g., `AuthService`, `CustomTranslateService`, `SnackbarService`, `DialogService`, or pure calculation/formatting methods from domain services).
   - **NEVER** put demo-only state, mock datasets, simulation steps, or showcase-specific logic inside any shared service (`src/app/_services/**` or `src/app/_database/**`).
2. **Component-Local Simulation State**:
   - All mock business examples, sample domain records, interactive sandbox states, and preview toggles MUST reside strictly inside the demo component folder (e.g., `src/app/home/starter-showcase/`) using local Angular `signal()` and `computed()` properties.
3. **Safe Guest Execution**:
   - Interactive examples on the demo page must work seamlessly for unauthenticated (`!isLoggedIn()`) visitors without triggering unauthorized Firestore reads/writes or permission-denied errors.

---

## 4. Visual Structure (Aligned with `ui-guidelines`)

Structure the page using the Bento Box design system from [`ui-guidelines`](../ui-guidelines/SKILL.md) and reference [`StarterShowcaseComponent`](../../../src/app/home/starter-showcase/starter-showcase.component.ts):

### A. Monumental Hero Card (`.hero-bento-card`)
- **Session Status Pill & Guest Chip**: Indicates `Preview mode (Guest)` when logged out, or greets the logged-in user.
- **Service Identity & Value Proposition**: Bold headline (`Inter`, weight 800), accent highlight, and clear description of what the application does for its users.
- **Contextual Call-to-Action (CTA) Row**:
  - When `!isLoggedIn()`: Primary CTA button to `rp.SEP + rp.LOGIN` ("Sign in or create account") + secondary button scrolling to `#bento-playground` ("See how it works").
  - When `isLoggedIn()`: Primary CTA button to the main user workspace / `rp.SEP + rp.PROFILE`.
- **3 Business Value Highlights (`.hero-metrics-strip`)**: Three concise pillars summarizing the main benefits for standard users.

### B. Interactive Bento Playground (`#bento-playground` / `.bento-grid`)
Organize the business showcase into clean, responsive Bento cards (`mat-card.bento-card`). Ensure `.bento-grid` (or `#bento-playground`) includes `scroll-margin-top: 24px;` (or `32px`) so scrolling via `scrollIntoView({behavior: 'smooth', block: 'start'})` leaves comfortable visual padding at the top of the viewport:

1. **Guest vs. Logged-In Access Comparison Card (`.bento-span-2` or side-by-side cards)**:
   - Two distinct visual columns or interactive cards contrasting:
     - **Available Without Login (Guest)**: Interactive demo preview, sample calculations, browsing public info.
     - **Unlocked After Login (Member)**: Full business functionality, persistent cloud storage, personal workspace, custom profile, and history—with a direct CTA to sign in.
2. **Interactive Core Business Workflow Preview (`.bento-span-2`)**:
   - A clickable step-by-step workflow or interactive simulator (`signal<StepId>`) walking the user through the primary business use case (e.g., Step 1: Input/Configure -> Step 2: Process/Track -> Step 3: Results/Insights) with realistic sample data.
3. **Live Business Case Sandbox (Interactive Example Card)**:
   - Allows the guest to interact with a real miniature version of the app's business logic (e.g., toggling sample parameters, testing a calculation, filtering mock items, or triggering confirmation dialogs/snackbars via `DialogService` and `SnackbarService` to see how actions behave after login).
4. **Post-Login Workspace & Profile Preview Card**:
   - Shows a preview of the standard user's personal area (saved items, statuses, profile card) so guests see the exact interface waiting for them after authentication.
5. **Legal & Trust Footer Bar (`.bento-span-3.compliance-bar`)**:
   - Clean links to Privacy Policy (`rp.PRIVACY_POLICY`), Terms of Service (`rp.TERMS`), and Cookie Policy (`rp.COOKIES`).

---

## 5. Implementation Checklist & Standards

1. **Strict [`ui-guidelines`](../ui-guidelines/SKILL.md) Compliance**:
   - **Bento Cards & Whitespace**: Generous padding (`28px`), soft rounded corners (`24px`–`28px`), soft shadows, and subtle `1px solid var(--separator-line)` borders on desktop that transition to `var(--app-accent-color)` on hover—and are **permanently set to `var(--app-accent-color)` on mobile/touch viewports** (`@media (max-width: 768px), (hover: none)`).
   - **CSS Variables Only**: Consume `var(--app-surface-color)`, `var(--app-background-color)`, `var(--app-text-primary)`, `var(--app-text-secondary)`, `var(--app-primary-color)`, `var(--app-accent-color)`, `var(--separator-line)`. **Never hardcode HEX/RGB colors** in component SCSS.
   - **Calm Motion**: **NEVER** use `translateY` or position-shifting transforms on card hover—only transition `border-color` or `box-shadow`.
   - **Mobile-First Overflow Protection**: Always set `margin: 0 !important;` on `mat-card` inside grids/wrappers, and apply `word-break: break-word; white-space: normal;` on text elements inside flex/grid containers.
   - **No Hardcoded Template Texts**: Provide full Polish (`pl`) and English (`en`) translations via `src/assets/i18n/` (`TranslatePipe`) or a reactive dictionary bound to `CustomTranslateService.selectedLanguage()`.
2. **Angular 21+ Zoneless Clean Code**:
   - Separate `.ts`, `.html`, and `.scss` files with `standalone: true` and `ChangeDetectionStrategy.OnPush`.
   - Inject services exclusively via `inject()`.
   - Use modern control flow (`@if`, `@for` with `track`).
3. **Verification**:
   - Update/write unit tests (`*.spec.ts`) and run `npm run test:ci` and `npx ng build --configuration=local` to ensure 0 errors.
