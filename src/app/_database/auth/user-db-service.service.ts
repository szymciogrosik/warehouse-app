import {inject, Injectable, Injector, runInInjectionContext} from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  docData,
  Firestore,
  query,
  setDoc,
  updateDoc,
  where
} from '@angular/fire/firestore';
import {CustomUser} from '../../_models/user/custom-user';
import {Observable} from 'rxjs';
import {userConverter} from './user.converter';

@Injectable({
  providedIn: 'root'
})
export class UserDbService {
  private dbPathBase = 'users';
  private readonly firestore = inject(Firestore);
  private readonly injector = inject(Injector);

  public getUser(uid: string, _email?: string): Observable<CustomUser | undefined> {
    return runInInjectionContext(this.injector, () => {
      const docRef = doc(this.firestore, `${this.dbPathBase}/${uid}`).withConverter(userConverter);
      return docData(docRef);
    });
  }

  public getUserByEmail(email: string): Observable<CustomUser[]> {
    return runInInjectionContext(this.injector, () => {
      const usersRef = collection(this.firestore, this.dbPathBase).withConverter(userConverter);
      const q = query(usersRef, where('email', '==', email));
      return collectionData(q);
    });
  }

  public getAll(): Observable<CustomUser[]> {
    return runInInjectionContext(this.injector, () => {
      const usersRef = collection(this.firestore, this.dbPathBase).withConverter(userConverter);
      return collectionData(usersRef);
    });
  }

  public delete(id: string): Promise<void> {
    const docRef = doc(this.firestore, `${this.dbPathBase}/${id}`);
    return deleteDoc(docRef);
  }

  public update(docId: string, updatedUser: Partial<CustomUser>): Promise<void> {
    const { id, uid, ...dataToSave } = updatedUser as any;
    const docRef = doc(this.firestore, `${this.dbPathBase}/${docId}`);
    return updateDoc(docRef, dataToSave);
  }

  public async create(newUser: CustomUser): Promise<void> {
    const docId = newUser.uid || newUser.id;
    if (docId) {
      const docRef = doc(this.firestore, `${this.dbPathBase}/${docId}`).withConverter(userConverter);
      await setDoc(docRef, newUser);
    } else {
      const usersRef = collection(this.firestore, this.dbPathBase).withConverter(userConverter);
      await addDoc(usersRef, newUser);
    }
  }
}
