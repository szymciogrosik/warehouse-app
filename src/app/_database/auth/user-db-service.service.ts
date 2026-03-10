import {inject, Injectable, Injector, runInInjectionContext} from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  query,
  updateDoc,
  where
} from '@angular/fire/firestore';
import {CustomUser} from '../../_models/user/custom-user';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserDbService {
  private dbPathBase = 'users';
  private readonly firestore: Firestore;
  private readonly injector: Injector;

  constructor() {
    this.firestore = inject(Firestore);
    this.injector = inject(Injector);
  }

  public getUser(uid: string, email: string): Observable<CustomUser[]> {
    return runInInjectionContext(this.injector, () => {
      const usersRef = collection(this.firestore, this.dbPathBase);
      const q = query(usersRef, where('uid', '==', uid), where('email', '==', email));
      return collectionData(q, {idField: 'id'}) as Observable<CustomUser[]>;
    });
  }

  public getUserByEmail(email: string): Observable<CustomUser[]> {
    return runInInjectionContext(this.injector, () => {
      const usersRef = collection(this.firestore, this.dbPathBase);
      const q = query(usersRef, where('email', '==', email));
      return collectionData(q, {idField: 'id'}) as Observable<CustomUser[]>;
    });
  }

  public getAll(): Observable<CustomUser[]> {
    return runInInjectionContext(this.injector, () => {
      const usersRef = collection(this.firestore, this.dbPathBase);
      return collectionData(usersRef, {idField: 'id'}) as Observable<CustomUser[]>;
    });
  }

  public delete(id: string): Promise<void> {
    const docRef = doc(this.firestore, `${this.dbPathBase}/${id}`);
    return deleteDoc(docRef);
  }

  public update(docId: string, updatedUser: Partial<CustomUser>): Promise<void> {
    const docRef = doc(this.firestore, `${this.dbPathBase}/${docId}`);
    return updateDoc(docRef, updatedUser);
  }

  public async create(newUser: CustomUser): Promise<void> {
    const usersRef = collection(this.firestore, this.dbPathBase);
    await addDoc(usersRef, {...newUser});
  }
}
