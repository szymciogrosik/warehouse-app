# Angular 21+ & Firebase Best Practices

## Core Architecture
- **Zoneless Strategy**: Use `provideExperimentalZonelessChangeDetection()` in `app.config.ts`. Avoid `NgZone`.
- **Reactivity**: Prefer Signals for UI state and template binding. Use RxJS only for async streams (Firestore listeners, Auth state) and convert them immediately using `toSignal`.
- **Dependency Injection**: Use `inject()` function for all services and Firebase modules (`Firestore`, `Auth`, `Functions`).
- **Signal-based Components**: Use `input()`, `output()`, and `model()` functions instead of decorators.

## Firebase & Firestore
- **Functional SDK**: Use modular imports from `@angular/fire/firestore`. Avoid the legacy `AngularFirestore` compatibility layer.
- **Data Converters**: Implement `FirestoreDataConverter` for every collection to ensure strict typing between Firestore `DocumentData` and application models.
- **Logic Isolation**: 
    - `Service`: Handles raw Firebase calls and `dataConverter` logic.
    - `Facade`: Orchestrates state using Signals, handles optimistic updates.

## Code Standards (English)
```typescript
// Do not add spaces after "{" and before "}" in the imports
import {Injectable, inject, signal, computed} from '@angular/core';
import {Firestore, collection, collectionData, query, where, doc, setDoc} from '@angular/fire/firestore';
import {toSignal} from '@angular/core/rxjs-interop';
import {User} from './user.model';
import {userConverter} from './user.converter';

@Injectable({ providedIn: 'root' })
export class UserFacade {
  private readonly firestore = inject(Firestore);
  
  // Define all variables at the top
  // Define collection with converter
  private readonly usersRef = collection(this.firestore, 'users').withConverter(userConverter);

  // Expose state as Signal from RxJS stream
  readonly allUsers = toSignal(collectionData(this.usersRef), { initialValue: [] });
  
  // Selection state
  readonly selectedId = signal<string | null>(null);
  
  // Derived state
  readonly activeUser = computed(() => 
    this.allUsers().find(u => u.id === this.selectedId())
  );

  async updateUser(user: User): Promise<void> {
    const userDoc = doc(this.firestore, `users/${user.id}`).withConverter(userConverter);
    await setDoc(userDoc, user, { merge: true });
  }
}
