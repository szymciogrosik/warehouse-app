import {inject, Injectable, Injector, runInInjectionContext} from '@angular/core';
import {doc, docData, Firestore, setDoc, updateDoc} from '@angular/fire/firestore';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PublicSettingsService {
  private dbPathBase = 'public_settings';
  private readonly firestore: Firestore;
  private readonly injector: Injector;

  constructor() {
    this.firestore = inject(Firestore);
    this.injector = inject(Injector);
  }

  public getDocument(docId: string): Observable<any> {
    return runInInjectionContext(this.injector, () => {
      const docRef = doc(this.firestore, `${this.dbPathBase}/${docId}`);
      return docData(docRef, {idField: 'id'});
    });
  }

  public update(docId: string, data: any): Promise<void> {
    const docRef = doc(this.firestore, `${this.dbPathBase}/${docId}`);
    return updateDoc(docRef, data);
  }

  public setDocument(docId: string, data: any): Promise<void> {
    const docRef = doc(this.firestore, `${this.dbPathBase}/${docId}`);
    return setDoc(docRef, data);
  }
}
