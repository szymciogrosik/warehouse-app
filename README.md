# Angular Firebase Accelerator

Fast Angular app with Firebase Auth + Firestore, deployed to both GitHub Pages and Firebase Hosting.

**Live:**
- GitHub Pages: https://szymciogrosik.github.io/angular-firebase-accelerator/
- Firebase Hosting: https://angular-firebase-accelerator.web.app/

Everytime when in the following README file occur 
- APPLICATION_NAME it means "angular-firebase-accelerator"
- REPO_NAME it means "angular-firebase-accelerator"

---

## Stack

- Angular (latest CLI)
- Firebase Authentication + Firestore
- GitHub Actions (deploy to GH Pages and Firebase)

---

## Quick start

```bash
# install deps
npm install

# run locally
ng serve
# open http://localhost:4200

# run tests (interactive watch mode)
npm test

# run tests once headlessly with coverage
npm run test:ci
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

## Connect with template (ONLY FIRST TIME)

1. Add the template repo as a remote source named "template", execute the script:
```bash
./script_connect_with_template.sh
```
 
2. Resolve the Conflicts in IntelliJ At this exact point, Git will pause the merge and say CONFLICT. 
- Open IntelliJ IDEA. 
- IntelliJ will detect the conflicting files. You can right-click them -> Git -> Resolve Conflicts. 
- Use IntelliJ's side-by-side three-way merge tool to pick which changes you want from the template vs. what you want to keep in your original app.

3. Commit and Push: 
Once all conflicts are marked as resolved in IntelliJ, finalize the merge process: 
```bash 
git commit -m "Permanently link template history"
```
```bash 
git push origin main
```

---

## Sync with template (Do this every time you want updates from template repo)

1. Fetch the latest template data, execute the script:
```bash
./script_sync_with_template.sh
```
 
2. Resolve the Conflicts in IntelliJ At this exact point, Git will pause the merge and say CONFLICT. 
- Open IntelliJ IDEA. 
- IntelliJ will detect the conflicting files. You can right-click them -> Git -> Resolve Conflicts. 
- Use IntelliJ's side-by-side three-way merge tool to pick which changes you want from the template vs. what you want to keep in your original app.

3. Commit and Push: 
Once all conflicts are marked as resolved in IntelliJ, finalize the merge process: 
```bash 
git commit -m "Merged latest changes from template repository" 
```
```bash 
git push origin main
```

---

## Firebase setup

Link to [Firebase](https://console.firebase.google.com/).

1) **Create a project**

2) **Authentication**

- Enable **Email/Password** and **Google** providers.
- Add your Gmail as auth user: `your-email@gmail.com`, any password. 
- Copy the generated **uid** and store somewhere. Will be needed soon.
- Authentication → Settings → **Authorized domains**: add your GitHub Pages domain, e.g. `szymciogrosik.github.io`.

3) **Firestore**
Setup firestore:
- Location: Warsaw (or closest region).
- Mode: Firestore in **production** mode.

- **Create first user:**
  - In Firestore, create collection `users`:
    - Document ID: `<copied from Authentication>` (use your Auth UID as the document ID)
      - `email` (string): `your-email@gmail.com`
      - `firstName` (string): `Adam`
      - `lastName` (string): `Abacki`
      - `roles` (array of string): `ADMIN_PAGE_ACCESS`, `ADMIN_CORE_SETTINGS`

- **Rules** → replace with secure production rules:
  ```js
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
          'ADMIN_CORE_SETTINGS' in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roles;
      }

      // Public settings (allowForRegistering, themes, etc.)
      match /public_settings/{docId} {
        // Anyone can read public settings (needed before login to check if registration is open)
        allow read: if true;
        // Only admins can alter application-wide settings
        allow write: if isAdmin();
      }

      // Users collection
      match /users/{userId} {
        // Read:
        // - Authenticated users can read their own document (by document path ID: userId == request.auth.uid)
        // - Admins can read all users (needed for the Admin Panel)
        allow read: if request.auth != null && (
          userId == request.auth.uid ||
          isAdmin()
        );

        // Create:
        // - Authenticated users can create their own profile during registration (with empty roles, document ID matching their UID)
        // - Admins can create user records directly
        allow create: if request.auth != null && (
          (userId == request.auth.uid && request.resource.data.roles.size() == 0) ||
          isAdmin()
        );

        // Update:
        // - Users can update their own personal info (name, dateOfBirth, photo), but CANNOT elevate their own roles or change isDeleted
        // - Admins can update any user (including roles and status)
        allow update: if request.auth != null && (
          (
            userId == request.auth.uid &&
            request.resource.data.roles == resource.data.roles &&
            request.resource.data.isDeleted == resource.data.isDeleted
          ) ||
          isAdmin()
        );

        // Delete / Archive:
        // - Only admins can delete user records
        allow delete: if isAdmin();
      }
    }
  }
  ```

4) **Web app config**

- Project Settings → General → Your apps → Web → register and copy the config.
- Add the config to the "Environments" files listed below.
  - Add your Firebase web config (without the API key) to:
    - `src/environments/environment-example.ts`
    - `src/environments/firebase/environment.ts`
    - `src/environments/ftp/environment.ts`
    - `src/environments/gh-pages/environment.ts`
  - Copy `environment-example.ts` → `environment.ts` and fill in API key.

5) **Hosting**
Setup hosting on Firebase, just press all default values, with your project name.
Copy the generated by Firebase domain name (usually it is [project-name]-[generated-hash]).

6) **Repo strings to update**

Replace every APPLICATION_NAME with your local app name except of the files:

- `.firebaserc`,
- `CD - firebase - Step 2 - Build and deploy to firebase-release.yaml` → two places,
- `README.md` link to Firebase Hosting.

... in those files, provide a domain name copied from point **Hosting**.

7) **Firebase CLI**

```bash
npm i -g firebase-tools
firebase logout
firebase login --reauth
```

8) **Change firebase project**
```bash
firebase use --add
# Choose your project name
# Provide a alias same as repo name
```

9) **Review and commit changes**
Make a short review of changes and commit.

10) **Initialize Hosting (GitHub integration)**
   Run it. If you configure both sites separately, do it twice.

   ```bash
   firebase init
   # Choose: Hosting
   # Say no for proposition App Hosting 
   # Public directory: Enter (keep default)
   # Single-page app rewrite to /index.html: Yes
   # Set up automatic builds and deploys with GitHub: Yes
   # Provide user/repository (i.e. szymciogrosik/REPO_NAME)
   # Set up the workflow to run a build script before every deploy? No
   # Set up automatic deployment to your site's live channel when a PR is merged? No
   # Would you like to install agent skills for Firebase? No
   ```
11) Rename the secret env var
- `FIREBASE_SERVICE_ACCOUNT_<APPLICATION_NAME>` → use your generated secret name from GitHub.

12) **Revert unwanted changes in `firebase.json`** if init overwrote custom settings.

13) **Update legal statements**
- Replace all `PAGE_OWNER_NAME` by name of responsible person for this page
- Replace all `PAGE_OWNER_EMAIL` by email of responsible person for this page

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

