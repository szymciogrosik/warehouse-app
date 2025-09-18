import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatListModule } from '@angular/material/list';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

import { Warehouse } from '../../_models/warehouse/warehouse';
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
    MatGridListModule,
    MatListModule
  ],
  templateUrl: './warehouse.component.html',
  styleUrls: ['./warehouse.component.scss']
})
export class WarehouseViewComponent implements OnInit {
  warehouse$: Observable<Warehouse | null>;
  currentWarehouse: Warehouse | null = null;
  userUid: string | null = null;

  // navigation state
  viewLevel = 0; // 0 = rooms, 1 = boxes, 2 = items
  selectedRoomIndex: number | null = null;
  selectedBoxIndex: number | null = null;

  private warehouseDb = inject(WarehouseDbService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.authService
      .loggedUser()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(user => {
        if (user) {
          this.userUid = user.uid;
          this.warehouse$ = this.warehouseDb.getByUser(user.uid);
          this.warehouse$.subscribe(warehouse => {
            this.currentWarehouse = warehouse;
          });
        } else {
          this.userUid = null;
        }
      });
  }

  // navigation methods
  enterRoom(index: number): void {
    this.selectedRoomIndex = index;
    this.viewLevel = 1;
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
    }
  }

  getNavTitle(warehouse: Warehouse): string | undefined {
    if (this.viewLevel === 1 && this.selectedRoomIndex !== null) {
      return warehouse.rooms[this.selectedRoomIndex].name;
    }
    if (
      this.viewLevel === 2 &&
      this.selectedBoxIndex !== null &&
      this.selectedRoomIndex !== null
    ) {
      return warehouse.rooms[this.selectedRoomIndex].boxes[
        this.selectedBoxIndex
        ].name;
    }
    return '';
  }

  // data modifications
  async addRoom(): Promise<void> {
    if (!this.userUid) throw new Error('User is not logged in');
    if (!this.currentWarehouse) throw new Error('Warehouse not found');

    this.currentWarehouse.rooms.push({
      name: 'New Room',
      description: 'Describe here',
      boxes: []
    });

    await this.warehouseDb.save(
      this.userUid,
      new Warehouse(this.currentWarehouse)
    );
  }

  async addBox(roomIndex: number): Promise<void> {
    if (!this.userUid) throw new Error('User is not logged in');
    if (!this.currentWarehouse) throw new Error('Warehouse not found');

    const newBox = { name: 'New Box', description: 'Describe here', items: [] };
    this.currentWarehouse.rooms[roomIndex].boxes.push(newBox);

    await this.warehouseDb.save(
      this.userUid,
      new Warehouse(this.currentWarehouse)
    );
  }

  async addItem(roomIndex: number, boxIndex: number): Promise<void> {
    if (!this.userUid) throw new Error('User is not logged in');
    if (!this.currentWarehouse) throw new Error('Warehouse not found');

    const newItem = { name: 'New Item', description: 'Describe here' };
    this.currentWarehouse.rooms[roomIndex].boxes[boxIndex].items.push(newItem);

    await this.warehouseDb.save(
      this.userUid,
      new Warehouse(this.currentWarehouse)
    );
  }
}
