import {Injectable, inject} from '@angular/core';
import {Firestore, doc, docData, getDoc, setDoc, deleteDoc} from '@angular/fire/firestore';
import {Observable, from, map} from 'rxjs';
import {UserVaultMetadata} from '../../_models/security/vault-metadata';

@Injectable({
  providedIn: 'root'
})
export class VaultMetaDbService {
  private readonly dbPathBase = 'vault_meta';
  private readonly firestore: Firestore;

  constructor() {
    this.firestore = inject(Firestore);
  }

  public watchMetadata(uid: string): Observable<UserVaultMetadata | null> {
    const ref = doc(this.firestore, `${this.dbPathBase}/${uid}`);
    return docData(ref).pipe(
      map(data => (data ? (data as UserVaultMetadata) : null))
    );
  }

  public async getMetadata(uid: string): Promise<UserVaultMetadata | null> {
    const ref = doc(this.firestore, `${this.dbPathBase}/${uid}`);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as UserVaultMetadata) : null;
  }

  public async saveMetadata(uid: string, meta: UserVaultMetadata): Promise<void> {
    const ref = doc(this.firestore, `${this.dbPathBase}/${uid}`);
    const plain = JSON.parse(JSON.stringify(meta));
    await setDoc(ref, plain, { merge: true });
  }

  public async deleteMetadata(uid: string): Promise<void> {
    const ref = doc(this.firestore, `${this.dbPathBase}/${uid}`);
    await deleteDoc(ref);
  }
}
