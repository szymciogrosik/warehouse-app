# Firebase Security & Performance

## Firestore Rules
- Enforce `request.auth != null` for all private data.
- Use `get()` and `exists()` in rules to validate cross-document relationships.
- Prohibit `allow write` without specific field validation using `request.resource.data`.

## Performance
- **Queries**: Always use `query()` with specific `where()` clauses. Never fetch entire collections for client-side filtering.
- **Hydration**: Enable `provideClientHydration()` and ensure Firebase data is serialized to avoid double fetching on the client.
