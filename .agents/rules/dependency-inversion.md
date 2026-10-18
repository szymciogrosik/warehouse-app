# Dependency Inversion & Isolation

## Injection Tokens over Concrete Classes
- Use `InjectionToken` for external dependencies (e.g., `Window`, `Document`, third-party libraries) to guarantee testability and SSR compatibility.
- Do not inject environment files directly into components or services. Wrap environment variables in an `InjectionToken`.

## Provider Scoping
- Default to `providedIn: 'root'` for stateless singletons.
- Use Component-level `providers` to tie a service's lifecycle to a specific component tree, acting as a local state container.

## Code Example
```typescript
import {InjectionToken, inject, Injectable} from '@angular/core';

export interface AppConfig {
  readonly apiUrl: string;
  readonly featureFlags: ReadonlyArray<string>;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly config = inject(APP_CONFIG);

  fetchData(): void {
    console.log(`Connecting to: ${this.config.apiUrl}`);
  }
}
