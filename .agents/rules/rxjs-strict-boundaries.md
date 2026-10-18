# RxJS Strict Boundaries

## Component Subscriptions
- Ban explicit `.subscribe()` calls in Components. 
- Map all observable streams to Signals using `toSignal()` at the class property declaration level.

## Declarative Data Pipelines
- Avoid nested subscriptions. Use Higher-Order Mapping Operators (`switchMap`, `concatMap`, `exhaustMap`).
- Compose complex state using `combineLatest` or `forkJoin` before converting to a Signal.

## Code Example
```typescript
import {Injectable, inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {toSignal} from '@angular/core/rxjs-interop';
import {Subject, switchMap, catchError, of, map} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SearchFacade {
  private readonly http = inject(HttpClient);
  
  // Action stream
  private readonly searchTerms$ = new Subject<string>();

  // Declarative pipeline
  private readonly results$ = this.searchTerms$.pipe(
    switchMap(term => this.http.get<ReadonlyArray<string>>(`/api/search?q=${term}`).pipe(
      catchError(() => of([]))
    )),
    map(results => results.slice(0, 10))
  );

  // Exposed as Signal for the UI
  readonly searchResults = toSignal(this.results$, { initialValue: [] });

  search(term: string): void {
    this.searchTerms$.next(term);
  }
}
