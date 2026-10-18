---
name: sync-with-template
description: "Use this skill when syncing downstream projects with the template repository via script_sync_with_template.sh, resolving merge conflicts, adapting template styles and functionalities to the application, and ensuring a clean build without committing."
---

# Template Synchronization & Conflict Resolution Workflow

This skill guides the process of synchronizing a downstream application with the upstream `angular-firebase-accelerator` template repository.

The template accelerator provides foundational architecture, security practices, legal compliance modules, design system updates, and dependency upgrades. Downstream applications maintain custom domain models, business logic, specific styling overrides, and individual Firebase environments.

---

## 1. Core Principles & Safety Rules

- **NEVER Commit Automatically**: The sync must be executed **without commit** (`--no-commit`). Changes must remain in the working tree for developer review.
- **Preserve Application Identity**: Keep application-specific Firebase configuration, branding colors, domain models, and custom routes.
- **Adopt Template Architecture**: Integrate upstream security fixes, new design tokens, compliance pages (Privacy Policy, Terms of Service, Cookies), UI enhancements, and dependency updates.
- **Strict UI Guidelines Adherence**: All merged or adjusted components must strictly follow [`ui-guidelines`](../ui-guidelines/SKILL.md) (Bento card layout, CSS variables bound to SCSS, `Inter` font, `OnPush` change detection, no hardcoded texts, no card bouncing on hover, skeleton loading states).

---

## 2. Sync Execution (`script_sync_with_template.sh`)

When triggered, run the synchronization sequence:

```bash
git fetch template main
git checkout main
git merge template/main --no-edit --no-commit
```

### Remote Verification Check
If `fatal: 'template' does not appear to be a git repository` occurs:
1. Verify configured remotes with `git remote -v`.
2. If the `template` remote is missing, configure it as established in `script_connect_with_template.sh`:
   ```bash
   git remote add template https://github.com/szymciogrosik/angular-firebase-accelerator.git
   ```
3. Re-run `git fetch template main` and `git merge template/main --no-edit --no-commit`.

---

## 3. Systematic Conflict Resolution Strategy

Inspect conflicted and modified files using `git status`. Resolve conflicts by file category using the following rules:

### A. Environment Files (`src/environments/environment*.ts`, `firebase.json`)
- **Keep Application Values**:
  - `firebase`: `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`, `measurementId`.
  - App-specific feature flags or API URLs.
- **Adopt Template Values**:
  - New schema properties, version placeholders (`BUILD_VERSION_TEMPLATE`), or infrastructure settings.

### B. Internationalization (`src/assets/i18n/pl.json`, `en.json`)
- **Keep Application Values**:
  - All existing domain and feature translation keys unique to the application.
- **Adopt Template Values**:
  - New base feature keys (e.g. `privacy.*`, `terms.*`, `cookies.*`, `legal.*`, `footer.*`, `home.*`, `theme.*`).
- **Placeholder Substitution**:
  - If the application has designated owner/company details, replace `PAGE_OWNER_NAME`, `PAGE_OWNER_EMAIL`, and `PAGE_OWNER_USERNAME` accordingly.
  - If not yet specified, retain the uppercase placeholders for future global search & replace.
- **Rule 10 Compliance**: Ensure no text is left hardcoded in templates; all displayed text must pass through `TranslatePipe`.

### C. Routing & Navigation (`src/app/app-routing.module.ts`, `src/utils/redirection.enum.ts`)
- **Redirection Enum**:
  - Combine application routes with new template route definitions (`PRIVACY_POLICY`, `TERMS`, `COOKIES`, etc.).
- **App Routing**:
  - Keep application domain routes and route guards (`authenticatedGuard`, `adminPageGuard`).
  - Add newly merged template routes using standard direct component imports (`component: PrivacyPolicyComponent`) to match codebase conventions.

### D. Styles & Theming (`src/styles.scss`, component SCSS)
- **Token Integration**:
  - Merge new design tokens (e.g., `--google-btn-*`, mesh gradients, footer margins, MDC dark theme overrides).
  - Preserve the application's core brand palette if customized.
- **Enforce UI Guidelines**:
  - All colors in component SCSS must consume `var(--name)` CSS variables defined in `styles.scss`.
  - In `styles.scss`, CSS variables must bind to SCSS variables using interpolation (`--color: #{$color};`).
  - No raw HEX or RGBA values in component SCSS files.
  - Bento cards: Use standard card containers (`app-page-container`, `app-card-wide`, `app-card-medium`, `app-card-narrow`).
  - Interactive states: Never apply `translateY` or position-shifting animations to cards on hover.

### E. Dependencies (`package.json`, `package-lock.json`)
- Merge new packages or updated dependency versions from the template.
- If dependencies were added or upgraded, execute `npm install` to keep node modules and lockfile synchronized.

---

## 4. Adjusting New Styles and Functionalities

For every newly merged or updated template component:
1. **Design System Harmony**: Ensure component templates use Material Bento card wrappers and appropriate classes (`legal-card`, `login-split-card`, etc.).
2. **Reactivity & Change Detection**: Verify components use `ChangeDetectionStrategy.OnPush` and Angular Signals where applicable.
3. **SPA Navigation**: Ensure all internal links use `[routerLink]="rp.SEP + rp.TARGET"` using `RedirectionEnum`.

---

## 5. Build Verification & Issue Resolution

Always verify that the entire application compiles cleanly after resolving conflicts:

```bash
npx ng build --configuration=local
```

1. Fix all TypeScript compilation errors, missing imports, or type mismatches.
2. Resolve any SCSS compile or variable reference errors.
3. Re-run `npx ng build --configuration=local` until the exit code is `0`.
4. Stage resolved files with `git add <file>`.

---

## 6. Completion & Developer Handoff

Once all conflicts are resolved and the build succeeds:
1. Run `git status` to confirm a clean, conflict-free state with staged/unstaged changes.
2. Provide a clear summary to the developer:
   - Summary of resolved conflicts and adopted template features.
   - Confirmation of successful build (`npx ng build --configuration=local`).
   - Remind the developer to review diffs and commit manually when ready:
     ```bash
     git commit -m "Merged latest changes from template repository"
     # git push origin main
     ```
