# Mandatory Testing & Quality Gate Standards

## Core Requirement
Every time you modify existing code, add new features, refactor components/services, or fix bugs, you **MUST** write or update comprehensive automated tests covering:
1. **Happy paths**: Standard user flows and expected operational outputs.
2. **Error paths**: Handling failed promises, HTTP/Firebase network failures, thrown errors, and validation rejections.
3. **Edge cases**: Empty strings, `null`, `undefined`, boundary numeric values, special characters, whitespace, unauthorized access, and unexpected inputs.

**Never finish a task without running `npm run test:ci` and ensuring 100% of tests pass.**

---

## Testing Principles in this Repository

### 1. Zoneless Angular Architecture
- This application uses `provideZonelessChangeDetection()`.
- **DO NOT** use `fakeAsync()` or `tick()` from `@angular/core/testing` because `zone.js/testing` is intentionally absent.
- For timer or async delays, use Jasmine clocks:
  ```typescript
  jasmine.clock().install();
  // trigger action
  jasmine.clock().tick(1000);
  jasmine.clock().uninstall();
  ```
- Trigger change detection explicitly when testing DOM updates: `fixture.detectChanges()`.

### 2. Angular Signals & Facades
- When testing Signals and `computed()` values, mutate the underlying signal state and assert on the computed signal value:
  ```typescript
  expect(facade.myComputedSignal()).toEqual(expectedValue);
  ```

### 3. Mocking Dependencies
- Always mock Firebase services (`Auth`, `Firestore`, `Storage`) and routing (`Router`, `ActivatedRoute`) using Jasmine spies or spy objects:
  ```typescript
  const authMock = jasmine.createSpyObj('Auth', ['signOut']);
  TestBed.configureTestingModule({
    providers: [
      { provide: Auth, useValue: authMock },
      provideZonelessChangeDetection()
    ]
  });
  ```
- For `@ngx-translate/core`, provide `provideTranslateService()`.

### 4. Continuous Integration Verification
- Always execute:
  ```bash
  npm run test:ci
  ```
- Tests must exit with code 0 and 0 failures. The CI pipeline (`.github/workflows/ci-pr-tests.yaml`) strictly blocks merging into `main`, `release/firebase`, or `release/gh-pages` if any test fails.
