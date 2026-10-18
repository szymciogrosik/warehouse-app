import {inject, Injectable, Injector, runInInjectionContext} from '@angular/core';
import {doc, docData, Firestore, setDoc, updateDoc} from '@angular/fire/firestore';
import {Observable} from 'rxjs';
import {PublicSettings} from '../../_models/settings/public-settings';
import {publicSettingsConverter} from './public-settings.converter';

@Injectable({
  providedIn: 'root'
})
export class PublicSettingsService {
  private dbPathBase = 'public_settings';
  private readonly firestore = inject(Firestore);
  private readonly injector = inject(Injector);

  public getDocument(docId: string): Observable<PublicSettings | undefined> {
    return runInInjectionContext(this.injector, () => {
      const docRef = doc(this.firestore, `${this.dbPathBase}/${docId}`).withConverter(publicSettingsConverter);
      return docData(docRef);
    });
  }

  public update(docId: string, data: Partial<PublicSettings>): Promise<void> {
    const docRef = doc(this.firestore, `${this.dbPathBase}/${docId}`);
    return updateDoc(docRef, data);
  }

  public setDocument(docId: string, data: PublicSettings): Promise<void> {
    const docRef = doc(this.firestore, `${this.dbPathBase}/${docId}`).withConverter(publicSettingsConverter);
    return setDoc(docRef, data);
  }
}
