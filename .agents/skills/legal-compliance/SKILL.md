---
name: legal-compliance
description: "Use this skill when auditing, updating, or expanding legal documents (Privacy Policy, Terms of Service, Cookie Policy), scanning the application code for personal data, third-party services, cookies/localStorage, and keeping compliance aligned with GDPR/RODO and EU/Polish law."
---

# Legal Compliance & Legal Documents Updater Skill

This skill defines:
1. **Mandatory legal requirements** for web applications under EU GDPR (RODO), ePrivacy Directive, and Polish law (Ustawa o prawach konsumenta, Ustawa o świadczeniu usług drogą elektroniczną, Prawo telekomunikacyjne).
2. **Automated application scanning procedures** to determine the real technical footprint of the app.
3. **Conditional additions** based on what features (payments, analytics, new profile fields, OAuth) exist in the code.
4. **Step-by-step update process** for templates and i18n dictionaries.

---

## 1. What EXACTLY Needs to Be in Legal Documents?

### A. Privacy Policy (Polityka Prywatności – GDPR / RODO Art. 13 & 14)
Every web application processing user data MUST include:
1. **Administrator / Data Controller Identity**:
   - Full name or legal entity name, operating country, and direct contact email (`PAGE_OWNER_NAME`, `PAGE_OWNER_EMAIL`).
2. **Exact Scope of Collected Personal Data**:
   - Must mirror actual code models: e.g., email, name, avatar URL, Firebase UID, system roles, login timestamps, IP address.
   - If optional fields are added (phone, company NIP, address), they must be explicitly listed.
3. **Purposes and Legal Grounds (Art. 6 GDPR)**:
   - **Service Provision & Account Management** (Art. 6(1)(b) – contract execution).
   - **System Security & Abuse Prevention** (Art. 6(1)(f) – legitimate interest).
   - **Statutory / Tax Obligations** (Art. 6(1)(c)) – *only if payments/invoicing exist*.
   - **Marketing / Newsletters** (Art. 6(1)(a) – consent) – *only if opt-in marketing exists*.
4. **Data Processors & Third Parties (Podmioty przetwarzające)**:
   - Infrastructure providers (e.g., Google LLC / Firebase Authentication, Firestore, Storage, Hosting).
   - International transfer legal basis (Standard Contractual Clauses – SCC).
   - Payment processors (e.g., Stripe, PayU) – *if applicable*.
   - Transactional email providers (e.g., SendGrid, Resend) – *if applicable*.
5. **Data Retention Periods (Okres przechowywania)**:
   - Account data: duration of user account existence + immediate deletion on account removal.
   - Invoices/billing: 5 years (tax obligations) – *if paid*.
   - Security/auth server logs: temporary retention by Google per their policy.
6. **User Rights**:
   - Access, rectification, erasure ("right to be forgotten"), restriction of processing, objection.
   - Contact mechanism to exercise rights (`PAGE_OWNER_EMAIL`).
   - Right to file a complaint with the supervisory authority (e.g. UODO in Poland or local EU DPA).
7. **Profiling & Automated Decisions**:
   - Explicit statement that no automated profiling affecting legal rights takes place.
8. **Link to Cookie Policy & Amendment Notice**.

---

### B. Terms of Service (Regulamin Serwisu)
Regulates electronic service provision and user obligations:
1. **General Provisions & Service Provider**:
   - Who operates the service, application domain, contact email.
2. **Definitions**:
   - Service, User, Account, Administrator.
3. **Technical Requirements**:
   - Modern browser, internet access, JavaScript & cookies enabled.
4. **Registration & Account Rules**:
   - Age limit (e.g., 16+ or 18+).
   - Truthful information requirement, password confidentiality.
5. **Prohibited Conduct (Zakaz treści bezprawnych)**:
   - Prohibition of unauthorized penetration, hacking, spamming, copyright violation, illegal content.
6. **Administrator Rights**:
   - Right to block/remove accounts violating terms, conduct maintenance, modify non-essential features.
7. **Limitation of Liability**:
   - "As is" provision for free services, exclusions for force majeure or third-party infrastructure vendor outages.
8. **Commercial & Consumer Provisions (CRITICAL: Include ONLY if charging money)**:
   - If payments/subscriptions exist:
     - Prices, payment terms, automatic renewal terms.
     - 14-day statutory right of withdrawal (Prawo odstąpienia od umowy) and exceptions for digital content.
     - Statutory warranty and complaint procedure (reklamacje, 14-day response time).
   - If free: Keep terms lean without unnecessary consumer ecommerce clauses.
9. **Complaints (Reklamacje)**:
   - Address for complaints (`PAGE_OWNER_EMAIL`), statutory response time (14 days).
10. **Final Provisions & Amendment Notice**:
    - Governing law and update notification via the "Last updated" date.

---

### C. Cookie Policy (Polityka Cookies & LocalStorage)
Regulates client-side storage (ePrivacy Directive & Art. 173 Polish Telecommunications Law):
1. **Clear Explanations**:
   - Distinction between HTTP session cookies, persistent tokens, and HTML5 `localStorage`.
2. **Categorized Table of Storage Items**:
   - **Strictly Necessary (Techniczne / Niezbędne)** – does NOT require prior consent:
     - `__session` (browser session, Firebase Auth).
     - Firebase ID Token / Refresh Token.
     - `selected_language` (localStorage, remembers PL/EN).
     - `dark_mode_enabled` (localStorage, remembers theme).
     - `cookie_consent` (localStorage, stores consent record).
   - **Analytics & Performance (Opcjonalne)** – REQUIRES user opt-in consent:
     - Google Analytics (`_ga`, `_gid`), Firebase Analytics (`measurementId`).
   - **Marketing & Social (Opcjonalne)** – REQUIRES user opt-in consent:
     - Facebook Pixel, Google Ads, etc.
3. **Third-Party Providers**:
   - Google LLC policy links and details.
4. **User Control & Browser Management**:
   - Step-by-step guidance to block or clear cookies in Chrome, Firefox, Safari, Edge.

---

## 2. Application Audit & Code Scanning Procedure

Before modifying legal pages, run this structured codebase audit:

### Step 1: Scan Firebase Services & Environment
Inspect `src/environments/environment*.ts` and `src/app/app.config.ts`:
- **Measurement ID**:
  ```ts
  measurementId: "G-..."
  ```
  - **If active and initializing Google Analytics**: Cookie Policy MUST include an Analytics table (`_ga`, `_gid`), and the Cookie Consent banner must offer an opt-out/opt-in choice (not just simple dismiss).
  - **If inactive / placeholder**: State clearly that no analytics or tracking cookies are used.
- **Storage & Functions**:
  - `storageBucket`: Note photo/file storage in Cloud Storage.
  - Cloud Functions / FCM Messaging: Note push notification tokens if used.

### Step 2: Scan Authentication & Identity Providers
Inspect `src/app/_services/auth/` and `src/app/login/`:
- **Social SSO**: Check if Google, GitHub, Facebook, or Apple OAuth are active.
  - Document the exact data retrieved from the provider (e.g. Google profile: email, first name, last name, avatar).
- **Registration Form**: Inspect `login.component.html` and `user-form.component.html`:
  - Verify consent checkbox: `acceptTerms` validator linked to `/terms-of-service` and `/privacy-policy`.

### Step 3: Scan Domain Models (Personal Data Scope)
Inspect `src/app/_models/` (e.g. `user.ts`, `custom-user.ts`):
- List all fields:
  - Base fields: `email`, `firstName`, `lastName`, `photoUrl`, `uid`, `roles`.
  - Additional fields: phone, billing address, tax ID (NIP), birthdate.
- **Action**: Ensure Section 2 of Privacy Policy (`privacy.s2.*`) accurately enumerates ALL active fields and NO phantom/unused fields.

### Step 4: Scan Client-Side Storage Usage
Search the workspace using grep for:
```
localStorage.setItem
sessionStorage.setItem
document.cookie
```
- For every key found (e.g. `cookie_consent`, `selected_language`, `dark_mode_enabled`, auth tokens):
  - Ensure it is explicitly listed in the Cookie Policy table with: Key Name, Purpose, Lifetime, and Party.

### Step 5: Scan for Commercial / Paid Features
Search the codebase for payment libraries or keywords:
```
stripe
paypal
payu
subscription
checkout
cart
invoice
```
- **If payments exist**:
  - Add Section "Płatności i Rozliczenia" to Terms of Service.
  - Add invoice/tax processing to Privacy Policy Section 3.
  - Add consumer withdrawal rights (prawo odstąpienia od umowy) and 14-day return notice.
- **If NO payments exist**:
  - Keep Terms focused purely on account and service usage.

### Step 6: Scan for User-Generated Content (UGC) & Public Sharing
Search for public forums, comments, file uploads, social sharing:
- **If UGC exists**:
  - Add intellectual property clause: User grants a non-exclusive license to host content; prohibited content rules.

### Step 7: Check Placeholders
Search `src/assets/i18n/` for:
```
PAGE_OWNER_NAME
PAGE_OWNER_EMAIL
PAGE_OWNER_USERNAME
```
- If the downstream application has its real owner/company name and email defined, substitute them across `pl.json` and `en.json`.
- If downstream is still in development/accelerator mode, retain the uppercase placeholders.

---

## 3. Implementation & Update Protocol

Whenever the application code changes in a way that affects legal obligations:

1. **Update `src/assets/i18n/pl.json` and `src/assets/i18n/en.json`**:
   - Keep key hierarchies synchronized (`privacy.*`, `terms.*`, `cookies.*`).
   - Update `legal.lastUpdated` to the current date (e.g., `"Ostatnia aktualizacja: [Dzień Miesiąc Rok]"`).
2. **Ensure DRY Templates**:
   - Templates (`privacy-policy.component.html`, `terms-of-service.component.html`, `cookie-policy.component.html`) must use `TranslatePipe` without language-branch duplicates (`@if (currentLang() === 'pl')`).
   - Use `[innerHTML]="'key' | translate"` for strings containing HTML tags (`<strong>`, `<a>`, `<code>`).
   - Use `[routerLink]="rp.SEP + rp.TARGET"` using `RedirectionEnum` for all internal legal navigation links.
3. **Ensure UI Design Compliance**:
   - Strictly follow [`ui-guidelines`](../ui-guidelines/SKILL.md):
     - Wrap in `app-page-container` and `mat-card` (`app-card-medium legal-card`).
     - Back button with icon (`arrow_back`) linking to home.
     - Responsive typography with `Inter`.
     - Bento card container styling.
4. **Verify Application Build**:
   ```bash
   npx ng build --configuration=local
   ```
   Confirm exit code `0`.
