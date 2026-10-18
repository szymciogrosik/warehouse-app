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
- Firebase Authentication, Cloud Firestore & Cloud Storage
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
Firebase web configuration is stored in:
- `src/environments/environment-example.ts`
- `src/environments/firebase/environment.ts`
- `src/environments/ftp/environment.ts`
- `src/environments/gh-pages/environment.ts`

For local development, copy `src/environments/environment-example.ts` to `src/environments/environment.ts` and provide your `FIREBASE_API_KEY`.

---

## CI / CD & Deployment

- **Pull Request Quality Gate:** `.github/workflows/ci-pr-tests.yaml` runs unit tests and coverage on PRs targeting `main`, `release/firebase`, or `release/gh-pages`.
- **Firebase Release:** Pushing to `release/firebase` triggers `.github/workflows/CD - firebase - Step 2 - Build and deploy to firebase-release.yaml`.
- **GitHub Pages Release:** Pushing to `release/gh-pages` triggers `.github/workflows/CD - gh-pages - Step 2 - Build and deploy to gh-pages.yaml`.
- **FTP Release:** Pushing to `release/ftp` triggers `.github/workflows/CD - ftp - Step 2 - Build and deploy to ftp-release.yaml`.
