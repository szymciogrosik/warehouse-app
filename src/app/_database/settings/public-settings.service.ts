import { Injectable, inject } from '@angular/core';
import { Firestore, doc, docData, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PublicSettingsService {
  private dbPathBase = 'public_settings';
  private firestore: Firestore;

  constructor() {
    this.firestore = inject(Firestore);
  }

  public getDocument(docId: string): Observable<any> {
    const docRef = doc(this.firestore, `${this.dbPathBase}/${docId}`);
    return docData(docRef, { idField: 'id' });
  }

  public update(docId: string, data: any): Promise<void> {
    const docRef = doc(this.firestore, `${this.dbPathBase}/${docId}`);
    return updateDoc(docRef, data);
  }
}
