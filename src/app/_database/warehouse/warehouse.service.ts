import {Injectable, inject} from '@angular/core';
import {Firestore, doc, docData, setDoc, deleteDoc} from '@angular/fire/firestore';
import {map, Observable} from 'rxjs';
import {Warehouses} from "../../_models/warehouse/warehouses";
import {Warehouse} from "../../_models/warehouse/warehouse";

@Injectable({
  providedIn: 'root'
})
export class WarehouseDbService {
  private dbPathBase = 'warehouses';
  private readonly firestore: Firestore;

  constructor() {
    this.firestore = inject(Firestore);
  }

  public getByUser(uid: string): Observable<Warehouses | null> {
    const ref = doc(this.firestore, `${this.dbPathBase}/${uid}`);
    return docData(ref, { idField: 'id' }).pipe(
      map(data => {
        if (!data) return null;
        const warehouses = data as Warehouses;
        this.sortAll(warehouses);
        return warehouses;
      })
    );
  }

  public async save(uid: string, warehouse: Warehouses): Promise<void> {
    const ref = doc(this.firestore, `${this.dbPathBase}/${uid}`);
    const plain = JSON.parse(JSON.stringify(warehouse));
    await setDoc(ref, plain, {merge: true});
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
