# Warehouse App (Mój magazyn)

Web application for organizing and cataloging inventory across a hierarchy of **Warehouses → Rooms → Boxes → Items**, built with Angular and Firebase (Authentication, Cloud Firestore, Storage, Hosting) and deployed via GitHub Actions.

**Live:**
- Custom Domain: https://warehouse.codefromheaven.dev/
- Firebase Hosting: https://warehouse-app-3333.web.app/
- GitHub Pages: https://szymciogrosik.github.io/warehouse-app/

---

## Features

- **Hierarchical Inventory Management:** Organize items into Warehouses, Rooms, and Boxes with creation and modification timestamps.
- **Move & Reorganize:** Move boxes between rooms/warehouses and move items between boxes directly from the edit dialog.
- **Global Search & Filtering:** Quickly search items by name, description, or location path, with multi-room filtering and one-click jump to the item's box.
- **Authentication & User Profiles:** Email/Password and Google Sign-In, profile photo upload with image cropper, and password management.
- **Admin Panel:** Role-based user management (`ADMIN_PAGE_ACCESS`, `ADMIN_CORE_SETTINGS`), user archiving/restoring, and public settings configuration (open registration, dark mode, profile picture changes).
- **Internationalization & Themes:** Full Polish (`pl`) and English (`en`) translations (`@ngx-translate/core`) and configurable Light/Dark mode.
- **Legal & GDPR Compliance:** Built-in Privacy Policy, Terms of Service, Cookie Policy, and Cookie Consent banner tailored to the application.

---

## Stack

- Angular 21 (Standalone components, Signals, Zoneless change detection, Angular Material)
- Firebase Authentication & Cloud Firestore
- Cloudinary (free image hosting & CDN optimization for profile pictures)
- Luxon for date/time formatting
- Karma & Jasmine unit tests
- GitHub Actions (CI unit tests + CD to GitHub Pages, Firebase Hosting, and FTP)

---

## Quick start

```bash
# install deps
npm install

# run locally
npm start
# open http://localhost:4200

# run tests (interactive watch mode)
npm test

# run tests once headlessly with coverage
npm run test:ci
```

---

## Sync with template (`angular-firebase-accelerator`)

This project is connected to the upstream template repository (`szymciogrosik/angular-firebase-accelerator`).

To pull the latest template updates:

1. Fetch and merge the latest template changes without committing:
   ```bash
   ./script_sync_with_template.sh
   ```
2. Resolve any merge conflicts, keeping warehouse-specific features, routes, colors (`#039345`), and translations.
3. Verify the build and tests:
   ```bash
   npm run build
   npm run test:ci
   ```
4. Commit and push:
   ```bash
   git commit -m "Merged latest changes from template repository"
   git push origin main
   ```

---

## Firebase setup & Security Rules

Link to [Firebase Console](https://console.firebase.google.com/).

### Firestore collections
- `public_settings/{docId}` – global public flags (`allowForRegistering`, `allowForProfilePictureChange`, `allowDarkMode`).
- `users/{uid}` – user profiles and roles (`ADMIN_PAGE_ACCESS`, `ADMIN_CORE_SETTINGS`), keyed by Firebase Auth `uid`.
- `warehouses/{uid}` – user's warehouses, rooms, boxes, and items tree, keyed by Firebase Auth `uid`.

### Firestore Security Rules
```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Default deny
    match /{document=**} {
      allow read, write: if false;
    }

    // Helper function to check if the caller is an admin
    function isAdmin() {
      return request.auth != null &&
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        ('ADMIN_CORE_SETTINGS' in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roles ||
         'ADMIN_PAGE_ACCESS' in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roles);
    }

    // Public settings (allowForRegistering, themes, etc.)
    match /public_settings/{docId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null && (
        userId == request.auth.uid ||
        isAdmin()
      );

      allow create: if request.auth != null && (
        (userId == request.auth.uid && request.resource.data.roles.size() == 0) ||
        isAdmin()
      );

      allow update: if request.auth != null && (
        (
          userId == request.auth.uid &&
          request.resource.data.roles == resource.data.roles &&
          request.resource.data.isDeleted == resource.data.isDeleted
        ) ||
        isAdmin()
      );

      allow delete: if isAdmin();
    }

    // Warehouses collection
    match /warehouses/{userId} {
      allow read, write: if request.auth != null && (
        userId == request.auth.uid ||
        isAdmin()
      );
    }
  }
}
```

### Environments
Firebase and Cloudinary web configuration is stored in:
- `src/environments/environment-example.ts`
- `src/environments/firebase/environment.ts`
- `src/environments/ftp/environment.ts`
- `src/environments/gh-pages/environment.ts`

For local development, copy `src/environments/environment-example.ts` to `src/environments/environment.ts` and provide your `FIREBASE_API_KEY`, `CLOUDINARY_CLOUD_NAME`, and `CLOUDINARY_UPLOAD_PRESET`.

---

## Cloudinary setup (Profile Pictures Hosting)

The application uses **Cloudinary** (free tier) with an **Unsigned Upload Preset** to host and optimize user profile pictures directly from the browser without requiring a backend server.

### 1. Create an account and get your `Cloud Name`
1. Register a free account at [cloudinary.com](https://cloudinary.com/).
2. In the main dashboard (**Dashboard** / **Programmable Media**), copy your **Cloud Name** (e.g. `dxyz123abc`).

### 2. Create a secure Unsigned Upload Preset
1. Go to **Settings** (gear icon in the bottom-left corner) → **Upload** → **Upload presets** section.
2. Click **Add upload preset** and configure the tabs as follows:

#### Tab 1: `General`
- **Upload preset name:** enter a name, e.g. `angular_accelerator_avatars` (copy it for later).
- **Signing mode:** change from *Signed* to **`Unsigned`**.
- **Asset folder:** enter `avatars` (or leave empty — the application dynamically sends the `users/{uid}` path, which groups images per user).
- **Disallow public ID:** **CHECK (Enable)**
  - *Why:* Prevents external callers from forcing a custom `public_id`, ensuring no one can intentionally overwrite another user's photo.
- **Generated public ID:** select **`Auto-generate an unguessable public ID value`** (first option)
  - *Why:* Every upload receives a random, unguessable identifier (e.g. `x8k9p2m...`), protecting against URL guessing and eliminating browser cache issues when updating avatars.
- **Generated display name:** select **`Use the last segment of the public ID as the display Name`**.

#### Tab 2: `Transform`
- **Incoming transformation:** paste this exact string:
  ```text
  c_limit,w_512,h_512/f_webp,q_auto
  ```
  - *Why:* Server-side safety net. Even if someone bypasses the frontend cropper and sends a 15 MB 8K image via Postman/cURL, Cloudinary scales it down to max `512x512`, converts it to lightweight `webp`, and compresses it (`q_auto`) before saving to disk—protecting your free storage quota.
- **Eager transformations:** leave **empty** (the Angular `StorageService` injects `f_auto,q_auto` on the fly in the delivery URL, saving your free transformation credits).

#### Tab 3: `Manage and Analyze`
- Leave everything **unchecked / empty** (*Tags, Context, Moderation, Media Analysis* consume extra free-tier credits and are unnecessary for avatars).

#### Tab 4: `Optimize and Deliver`
- **Delivery type:** `Upload` (default)
- **Access control:** leave empty / default (*Public*)
- **Format:** leave empty (already handled in *Incoming transformation*)
- **Allowed formats:** enter comma-separated formats (press Enter after each):
  ```text
  webp, jpg, jpeg, png
  ```
  - *Why:* Blocks uploading video files, PDFs, or potentially malicious SVG files at the API level.
- **Discard original file name when delivering assets as attachments:** **check (enable)**.

#### Tab 5: `Advanced` & `Addons`
- Leave everything **unchecked / default** (especially keep `Return delete token` disabled).

3. Click **Save** in the top-right corner.

### 3. (Recommended for production) Restrict settings in Security
1. In the Cloudinary console, go to **Settings** (gear icon) → **Security**.
2. Under **Allowed fetch domains**, enter your production domains (comma-separated, without `https://`):
   ```text
   warehouse.codefromheaven.dev, warehouse-app-3333.web.app
   ```
   - *Why:* Leaving this empty allows anyone on the internet to use your Cloudinary account as an open proxy CDN (`/image/fetch/https://external-site.com/...`) and drain your free quota. Specifying your domain locks this down while keeping `http://localhost:4200` uploads and `<img>` delivery working normally.
3. Click **Save** at the bottom of the Security page.

### 4. Configure local `environment.ts`
Update your local `src/environments/environment.ts` file with your Cloudinary credentials:
```typescript
  cloudinary: {
    cloudName: "YOUR_CLOUD_NAME",
    uploadPreset: "YOUR_UPLOAD_PRESET"
  }
```
*(In `environment-example.ts`, `firebase/environment.ts`, `ftp/environment.ts`, and `gh-pages/environment.ts`, leave the placeholders `"CLOUDINARY_CLOUD_NAME"` and `"CLOUDINARY_UPLOAD_PRESET"` untouched — they are automatically replaced by GitHub Actions during deployment).*

---

## CI / CD & GitHub configuration

1) **Actions permissions**  
   Settings → Actions → General → Workflow permissions:

- Read and write permissions
- Allow GitHub Actions to create and approve pull requests

2) **GH pages environment**  
   Settings → Pages:

- Build and deployment: GitHub Actions
- Environments → `github-pages`
  - Deployment branches and tags: add `release/gh-pages`
  - Secrets (add all 3 required by `.github/workflows/CD - gh-pages - Step 2 - Build and deploy to gh-pages.yaml`):
    - `FIREBASE_API_KEY` (from the Firebase web app)
    - `CLOUDINARY_CLOUD_NAME` (your Cloud Name from Cloudinary Dashboard)
    - `CLOUDINARY_UPLOAD_PRESET` (your Unsigned Upload Preset name, e.g. `angular_accelerator_avatars`)

3) **Firebase environment**  
   Settings → Environments → `firebase`

- Secrets (add all 3 required by `.github/workflows/CD - firebase - Step 2 - Build and deploy to firebase-release.yaml`):
  - `FIREBASE_API_KEY` (same key)
  - `CLOUDINARY_CLOUD_NAME` (your Cloud Name from Cloudinary Dashboard)
  - `CLOUDINARY_UPLOAD_PRESET` (your Unsigned Upload Preset name, e.g. `angular_accelerator_avatars`)

4) **Service account secret**  
   During `firebase init` with GitHub, a repo secret like  
   `FIREBASE_SERVICE_ACCOUNT_<PROJECT_NAME>` is created. Verify if it is and keep it.

5) **Branch protection & PR Quality Gate (Block Merge on Test Failure)**  
   The project includes a GitHub Actions workflow (`.github/workflows/ci-pr-tests.yaml`) that runs all unit tests and reports coverage upon opening or updating any Pull Request targeting `main`, `release/firebase`, or `release/gh-pages`.
   
   To enforce that a PR **cannot be merged** if tests fail:
   - Go to repository **Settings** → **Branches** (or **Rules** → **Rulesets**).
   - Click **Add branch protection rule** (for `main`, and optionally for `release/*` branches).
   - Check **Require a pull request before merging**.
   - Check **Require status checks to pass before merging**.
   - Check **Require branches to be up to date before merging**.
   - Search for and select the status check: **`🧪 Unit Tests & Code Coverage`**.
   - Save changes.
   Now, any pull request with failing tests will have the merge button disabled by GitHub.

### Workflows Summary
- **Pull Request Quality Gate:** `.github/workflows/ci-pr-tests.yaml` runs unit tests and coverage on PRs targeting `main`, `release/firebase`, or `release/gh-pages`.
- **Firebase Release:** Pushing to `release/firebase` triggers `.github/workflows/CD - firebase - Step 2 - Build and deploy to firebase-release.yaml`.
- **GitHub Pages Release:** Pushing to `release/gh-pages` triggers `.github/workflows/CD - gh-pages - Step 2 - Build and deploy to gh-pages.yaml`.
- **FTP Release:** Pushing to `release/ftp` triggers `.github/workflows/CD - ftp - Step 2 - Build and deploy to ftp-release.yaml`.

---

## Troubleshooting
- 403 when deploying to Firebase **IAM Service Account Credentials API** access missing. Verify the domain app name from firebase, provided in the configuration, probably is wrong.
- Auth popup blocked on GH Pages: add your GH Pages domain in **Authorized domains**.
- GH Action cannot push to `gh-pages`: verify **Read and write permissions** and the `github-pages` environment configuration.
- Change Angular CLI version when needed
```bash
npm uninstall -g @angular/cli
npm cache clean --force
npm cache verify
npm install -g @angular/cli@<version>
ng version
```

---

## Links
- Angular CLI: https://github.com/angular/angular-cli
- Firebase CLI: https://firebase.google.com/docs/cli
