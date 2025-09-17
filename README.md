# Angular Firebase Accelerator

Fast Angular app with Firebase Auth + Firestore, deployed to both GitHub Pages and Firebase Hosting.

**Live:**

- GitHub Pages: https://szymciogrosik.github.io/angular-firebase-accelerator/
- Firebase Hosting: https://angular-firebase-accelerator.web.app/

---

## Stack

- Angular (latest CLI)
- Firebase Authentication + Firestore
- GitHub Actions (deploy to GH Pages and Firebase)

---

## Quick start

```bash
# install deps
npm ci

# run locally
ng serve
# open http://localhost:4200
```

---

## Change Angular CLI version

```bash
npm uninstall -g @angular/cli
npm cache clean --force
npm cache verify
npm install -g @angular/cli@<version>
ng version
```

---

## Use the template

Create a fresh repo from the template. **Do not** copy branches.

Create and push two release branches:

```bash
git checkout -b release/gh-pages
git push -u origin release/gh-pages
```

```bash
git checkout -b release/firebase
git push -u origin release/firebase
```

---

## Environments

Add your Firebase web config (without the API key) to:

- `src/environments/environment-example.ts`
- `src/environments/firebase/environment.ts`
- `src/environments/ftp/environment.ts`
- `src/environments/gh-pages/environment.ts`

Copy `environment-example.ts` → `environment.ts` and fill in API key.

---

## Firebase setup

1) **Create a project**
  - Location: Warsaw.
  - Mode: Firestore in **production** mode.

2) **Authentication**

- Enable **Email/Password** and **Google** providers.
- Add your Gmail as auth user: `your-email@gmail.com`, any password. 
- Copy the generated **uid** and store somewhere. Will be needed soon.
- Authentication → Settings → **Authorized domains**: add your GitHub Pages domain, e.g. `szymciogrosik.github.io`.

3) **Firestore**

- Create a `users` document for a first user:
  - `email` (string): `your-email@gmail.com`
  - `firstName` (string): `Adam`
  - `lastName` (string): `Abacki`
  - `roles` (array of string): `ADMIN_PAGE_ACCESS`
  - `uid` (string): `<copied from Authentication>`
- **Rules** → replace with:
  ```js
  rules_version = '2';

  service cloud.firestore {
    match /databases/{database}/documents {
      // Default deny
      match /{document=**} {
        allow read: if false;
        allow write: if false;
      }

      // Public settings
      match /public_settings/{document=**} {
        allow read: if true;
        allow write: if request.auth != null;
      }

      // Users
      match /users/{document=**} {
        allow read: if request.auth != null;
        allow write: if request.auth != null;
      }
    }
  }
  ```

4) **Web app config**

- Project Settings → General → Your apps → Web → register and copy the config.
- Add the config to the "Environments" files listed above.

5) **Firebase CLI**

```bash
npm i -g firebase-tools
firebase login
```

6) **Enable IAM Service Account Credentials API**

- [Google Cloud Console](https://console.cloud.google.com/welcome) → APIs & Services → **Enable APIs & Services** → search “IAM Service Account Credentials API” → **Enable**.

7) **Initialize Hosting (GitHub integration)**
   Run it. If you configure both sites separately, do it twice.

   ```bash
   firebase init
   # Choose: Hosting
   # Public directory: Enter (keep default)
   # Single-page app rewrite to /index.html: Yes
   # Set up automatic builds and deploys with GitHub: Yes
   # Provide user/repository (i.e. szymciogrosik/angular-firebase-accelerator)
   # Run a build script before deploy? No
   # Automatic deployment when a PR is merged? No
   ```

8) **Revert unwanted changes in `firebase.json`** if init overwrote custom settings.

---

## GitHub configuration

1) **Actions permissions**  
   Settings → Actions → General → Workflow permissions:

- Read and write permissions
- Allow GitHub Actions to create and approve pull requests

2) **GH pages environment**  
   Settings → Pages:

- Build and deployment: GitHub Actions
- Environments → `github-pages`
  - Deployment branches and tags: add `release/gh-pages`
  - Secrets: add `FIREBASE_API_KEY` (from the Firebase web app)

3) **Firebase environment**  
   Settings → Environments → `firebase`

- Secrets: add `FIREBASE_API_KEY` (same key)

4) **Service account secret**  
   During `firebase init` with GitHub, a repo secret like  
   `FIREBASE_SERVICE_ACCOUNT_<PROJECT_NAME>` is created. Verify if it is and keep it.

---

## Repo strings to update

Replace every `angular-firebase-accelerator` with your local app name. 

In those files, provide a Firebase app ID:
- `.firebaserc`
- `CI - firebase - Step 2 - Build and deploy to firebase-release.yaml` → two places
- `README.md` link to Firebase Hosting

Rename the secret env var:
- `FIREBASE_SERVICE_ACCOUNT_ANGULAR_FIREBASE_ACCELERATOR` → use your generated secret name from GitHub.

---

## Troubleshooting
- 403 when deploying to Firebase: enable **IAM Service Account Credentials API**.
- Auth popup blocked on GH Pages: add your GH Pages domain in **Authorized domains**.
- GH Action cannot push to `gh-pages`: verify **Read and write permissions** and the `github-pages` environment configuration.

---

## Links

- Angular CLI: https://github.com/angular/angular-cli
- Firebase CLI: https://firebase.google.com/docs/cli
