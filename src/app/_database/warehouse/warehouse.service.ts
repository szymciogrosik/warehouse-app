import {Injectable, inject} from '@angular/core';
import {Firestore, doc, docData, setDoc, deleteDoc} from '@angular/fire/firestore';
import {combineLatest, from, Observable, of, switchMap} from 'rxjs';
import {Warehouses} from '../../_models/warehouse/warehouses';
import {VaultService} from '../../_services/security/vault.service';

@Injectable({
  providedIn: 'root'
})
export class WarehouseDbService {
  private dbPathBase = 'warehouses';
  private readonly firestore: Firestore;
  private readonly vaultService = inject(VaultService);

  constructor() {
    this.firestore = inject(Firestore);
  }

  public getByUser(uid: string): Observable<Warehouses | null> {
    const ref = doc(this.firestore, `${this.dbPathBase}/${uid}`);
    return combineLatest([
      docData(ref),
      this.vaultService.onVaultStateChanged$
    ]).pipe(
      switchMap(([data]) => {
        if (!data) return of(null);

        // Check if data is client-side encrypted
        if (data['isEncrypted'] === true && data['encryptedData'] && data['iv']) {
          if (!this.vaultService.isUnlocked()) {
            return of(null);
          }
          return from(
            this.vaultService.decryptData(data['encryptedData'], data['iv']).then(decryptedJson => {
              const parsed = JSON.parse(decryptedJson) as Warehouses;
              const warehouses = new Warehouses(parsed);
              this.sortAll(warehouses);
              return warehouses;
            }).catch(err => {
              console.error('Error decrypting warehouses payload:', err);
              return null;
            })
          );
        }

        // Legacy unencrypted data fallback
        if (data['warehouses']) {
          const warehouses = new Warehouses(data as Partial<Warehouses>);
          this.sortAll(warehouses);
          return of(warehouses);
        }

        return of(null);
      })
    );
  }

  public async save(uid: string, warehouse: Warehouses): Promise<void> {
    const ref = doc(this.firestore, `${this.dbPathBase}/${uid}`);
    const plain = JSON.parse(JSON.stringify(warehouse));

    if (this.vaultService.isUnlocked()) {
      const plainJson = JSON.stringify(plain);
      const { ciphertext, iv } = await this.vaultService.encryptData(plainJson);
      const payload = {
        isEncrypted: true,
        version: 1,
        iv,
        encryptedData: ciphertext,
        updatedAt: new Date().toISOString()
      };
      // Overwrite the document so no unencrypted legacy fields remain
      await setDoc(ref, payload);
    } else {
      await setDoc(ref, plain, { merge: true });
    }
  }

  public async delete(uid: string): Promise<void> {
    const ref = doc(this.firestore, `${this.dbPathBase}/${uid}`);
    await deleteDoc(ref);
  }

  // sorting utility
  private sortAll(ws: Warehouses): void {
    const safe = (val?: string) => val?.toLowerCase() ?? '';

    ws.warehouses.sort((a, b) => safe(a.name).localeCompare(safe(b.name)));
    ws.warehouses.forEach(w => {
      w.rooms.sort((a, b) => safe(a.name).localeCompare(safe(b.name)));
      w.rooms.forEach(r => {
        r.boxes.sort((a, b) => safe(a.name).localeCompare(safe(b.name)));
        r.boxes.forEach(bx => {
          bx.items.sort((a, b) => safe(a.name).localeCompare(safe(b.name)));
        });
      });
    });
  }
}
