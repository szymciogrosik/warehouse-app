import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

export interface WarehouseNavigationTarget {
  warehouseIndex: number;
  roomIndex: number;
  boxIndex: number;
}

@Injectable({providedIn: 'root'})
export class WarehouseNavigationService {
  private targetSubject = new BehaviorSubject<WarehouseNavigationTarget | null>(null);
  target$ = this.targetSubject.asObservable();

  setTarget(target: WarehouseNavigationTarget) {
    this.targetSubject.next(target);
  }

  consumeTarget(): WarehouseNavigationTarget | null {
    const val = this.targetSubject.value;
    this.targetSubject.next(null); // clear after use
    return val;
  }
}
