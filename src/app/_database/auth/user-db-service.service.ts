import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, addDoc, updateDoc, deleteDoc, query, where } from '@angular/fire/firestore';
import { CustomUser } from '../../_models/user/custom-user';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserDbService {
  private dbPathBase = 'users';
  private firestore: Firestore;

  constructor() {
    this.firestore = inject(Firestore);
  }

  public getUser(uid: string, email: string): Observable<CustomUser[]> {
    const usersRef = collection(this.firestore, this.dbPathBase);
    const q = query(usersRef, where('uid', '==', uid), where('email', '==', email));
    return collectionData(q, { idField: 'id' }) as Observable<CustomUser[]>;
  }

  public getAll(): Observable<CustomUser[]> {
    const usersRef = collection(this.firestore, this.dbPathBase);
    return collectionData(usersRef, { idField: 'id' }) as Observable<CustomUser[]>;
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
    await addDoc(usersRef, { ...newUser });
  }
}
