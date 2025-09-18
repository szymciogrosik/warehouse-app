import {Injectable, inject} from '@angular/core';
import {Firestore, doc, docData, setDoc, deleteDoc} from '@angular/fire/firestore';
import {Observable} from 'rxjs';
import {Warehouses} from "../../_models/warehouse/warehouses";

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
    return docData(ref, {idField: 'id'}) as Observable<Warehouses | null>;
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

}
