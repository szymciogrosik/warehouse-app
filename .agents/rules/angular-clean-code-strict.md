# Angular 21+ Strict Clean Code Standards

## General rules
- If you are changing some general approach, like using "signals" instead "promises" then scan whole application and fix all related issues
- Always inject services by inject(...) pattern, never by constructor
- always when loading data (when page is open and data could not be fetched yet), do the same modern loading, use the "skeleton-loader" class with general placeholder skeleton.component
- always when implementing new components divide it for ts, scss, and html files

## Modern Control Flow
- Strictly use built-in control flow (`@if`, `@for`, `@switch`).
- Ban legacy directives (`*ngIf`, `*ngFor`, `*ngSwitch`).
- Always use `track` in `@for` loops with unique primitive identifiers. Avoid tracking by object reference unless necessary.

## Component API & Immutability
- Ban `@Input()`, `@Output()`, and `@ViewChild()`. Use Signal-based functions: `input()`, `input.required()`, `output()`, `viewChild()`.
- Enforce `Readonly` and `ReadonlyArray` for all data models and interface definitions to prevent accidental mutation.

## Signal Anti-Patterns
- **No state mutation in effects**: Never call `.set()` or `.update()` inside an `effect()`. Effects are strictly for side effects (e.g., DOM manipulation, logging, syncing with Web Storage).
- **Untracked reads**: Use `untracked()` when reading a Signal inside a `computed` or `effect` if that read should not trigger a re-evaluation.

## Code Example
```typescript
// Do not add spaces after "{" and before "}" in the imports, in ecvery class
import {Component, ChangeDetectionStrategy, input, output, computed, effect, untracked} from '@angular/core';

export interface UserDTO {
  readonly id: string;
  readonly name: string;
  readonly permissions: ReadonlyArray<string>;
}

@Component({
  selector: 'app-user-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isActive()) {
      <article>
        <h2>{{ user().name }}</h2>
        <ul>
          @for (perm of user().permissions; track perm) {
            <li>{{ perm }}</li>
          }
        </ul>
        <button (click)="onActionClick()">Perform Action</button>
      </article>
    } @else {
      <p>User is inactive.</p>
    }
  `
})
export class UserCardComponent {
  // Strict Signal API
  readonly user = input.required<UserDTO>();
  readonly isActive = input(false);
  readonly actionTriggered = output<string>();

  // Derived state
  readonly hasAdminRights = computed(() => this.user().permissions.includes('ADMIN'));

  constructor() {
    effect(() => {
      // Reacts ONLY to 'isActive' changes.
      // Reading 'user' is untracked to avoid unnecessary executions if only the user object updates.
      const activeState = this.isActive();
      const currentId = untracked(this.user).id;
      
      console.log(`State changed for ${currentId}: Active=${activeState}`);
    });
  }

  onActionClick(): void {
    this.actionTriggered.emit(this.user().id);
  }
}
