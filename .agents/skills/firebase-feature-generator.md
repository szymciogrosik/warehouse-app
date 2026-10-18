# Firebase Feature Workflow

When generating a new feature:
1. **Model Definition**: Create a TypeScript interface and a corresponding `FirestoreDataConverter`.
2. **Infrastructure**: Create a `DataService` using `inject(Firestore)`.
3. **State Layer**: Create a `Facade` that exposes Signals. Use `toSignal` for real-time Firestore synchronization.
4. **View Layer**: Create Standalone Components using `OnPush` and Signal inputs.
5. **Security Check**: Output the required Firestore Security Rules changes for the new collection.
