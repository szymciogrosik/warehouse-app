import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

import { Warehouse } from '../../_models/warehouse/warehouse';
import { Warehouses } from '../../_models/warehouse/warehouses';
import { WhRoom } from '../../_models/warehouse/wh-room';
import { WhBox } from '../../_models/warehouse/wh-box';
import { WhItem } from '../../_models/warehouse/wh-item';

import { WarehouseDbService } from '../../_database/warehouse/warehouse.service';
import { AuthService } from '../../_services/auth/auth.service';

@Component({
  selector: 'warehouse-view',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule
  ],
  templateUrl: './warehouse.component.html',
  styleUrls: ['./warehouse.component.scss']
})
export class WarehouseViewComponent implements OnInit {
  warehouses$: Observable<Warehouses | null>;
  currentWarehouses: Warehouses | null = null;
  userUid: string | null = null;

  // navigation state
  selectedWarehouseIndex: number | null = null;
  viewLevel = 0; // 0 = rooms, 1 = boxes, 2 = items
  selectedRoomIndex: number | null = null;
  selectedBoxIndex: number | null = null;

  private warehouseDb = inject(WarehouseDbService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.authService.loggedUser()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(user => {
        if (user) {
          this.userUid = user.uid;
          this.warehouses$ = this.warehouseDb.getByUser(user.uid);
          this.warehouses$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(ws => {
              if (ws) {
                this.sortAll(ws);
              }
              this.currentWarehouses = ws;
            });
        } else {
          this.userUid = null;
        }
      });
  }

  // navigation
  enterWarehouse(index: number): void {
    this.selectedWarehouseIndex = index;
    this.viewLevel = 0;
    this.selectedRoomIndex = null;
    this.selectedBoxIndex = null;
  }

  enterRoom(index: number): void {
    this.selectedRoomIndex = index;
    this.viewLevel = 1;
    this.selectedBoxIndex = null;
  }

  enterBox(index: number): void {
    this.selectedBoxIndex = index;
    this.viewLevel = 2;
  }

  goBack(): void {
    if (this.viewLevel === 2) {
      this.selectedBoxIndex = null;
      this.viewLevel = 1;
    } else if (this.viewLevel === 1) {
      this.selectedRoomIndex = null;
      this.viewLevel = 0;
    } else if (this.selectedWarehouseIndex !== null) {
      this.selectedWarehouseIndex = null;
    }
  }

  getNavTitle(warehouse: Warehouse): string {
    if (this.viewLevel === 1 && this.selectedRoomIndex !== null) {
      return warehouse.rooms[this.selectedRoomIndex].name || '';
    }
    if (this.viewLevel === 2 && this.selectedRoomIndex !== null && this.selectedBoxIndex !== null) {
      return warehouse.rooms[this.selectedRoomIndex].boxes[this.selectedBoxIndex].name || '';
    }
    return warehouse.name || '';
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

  // helpers
  private async save(): Promise<void> {
    if (!this.userUid) throw new Error('User is not logged in');
    if (!this.currentWarehouses) throw new Error('No warehouses state');
    this.sortAll(this.currentWarehouses);
    await this.warehouseDb.save(this.userUid, new Warehouses(this.currentWarehouses));
  }

  private get activeWarehouse(): Warehouse {
    if (
      !this.currentWarehouses ||
      this.selectedWarehouseIndex === null ||
      !this.currentWarehouses.warehouses[this.selectedWarehouseIndex]
    ) throw new Error('Active warehouse not selected');
    return this.currentWarehouses.warehouses[this.selectedWarehouseIndex];
  }

  // mutations
  async addRoom(): Promise<void> {
    const w = this.activeWarehouse;
    w.rooms.push(new WhRoom({
      name: 'New Room',
      description: 'Describe here',
      boxes: []
    }));
    await this.save();
  }

  async addBox(roomIndex: number): Promise<void> {
    const w = this.activeWarehouse;
    if (roomIndex == null || !w.rooms[roomIndex]) throw new Error('Room not found');
    w.rooms[roomIndex].boxes.push(new WhBox({
      name: 'New Box',
      description: 'Describe here',
      items: []
    }));
    await this.save();
  }

  async addItem(roomIndex: number, boxIndex: number): Promise<void> {
    const w = this.activeWarehouse;
    if (roomIndex == null || !w.rooms[roomIndex]) throw new Error('Room not found');
    if (boxIndex == null || !w.rooms[roomIndex].boxes[boxIndex]) throw new Error('Box not found');

    w.rooms[roomIndex].boxes[boxIndex].items.push(new WhItem({
      name: 'New Item',
      description: 'Describe here'
    }));
    await this.save();
  }

  async createWarehouse(): Promise<void> {
    if (!this.userUid) {
      console.error('No logged user');
      return;
    }

    const warehouse = new Warehouse({
      name: 'Main',
      description: 'Central warehouse',
      rooms: []
    });

    if (!this.currentWarehouses || this.currentWarehouses?.warehouses?.length === 0) {
      this.currentWarehouses = new Warehouses({ warehouses: [warehouse] });
    } else {
      this.currentWarehouses.warehouses.push(warehouse);
    }
    await this.save();
  }
}
