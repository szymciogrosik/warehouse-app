import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {firstValueFrom, Observable} from 'rxjs';

import { Warehouse } from '../../_models/warehouse/warehouse';
import { Warehouses } from '../../_models/warehouse/warehouses';
import { WhRoom } from '../../_models/warehouse/wh-room';
import { WhBox } from '../../_models/warehouse/wh-box';
import { WhItem } from '../../_models/warehouse/wh-item';

import { WarehouseDbService } from '../../_database/warehouse/warehouse.service';
import { AuthService } from '../../_services/auth/auth.service';
import {MatDialog, MatDialogModule} from "@angular/material/dialog";
import {ConfirmDialogComponent} from "../../_shared-components/confirm-dialog/confirm-dialog.component";
import {EditDialogComponent} from "../../_shared-components/edit-dialog/edit-dialog.component";

@Component({
  selector: 'warehouse-view',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDialogModule
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
  private dialog = inject(MatDialog);

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
    this.viewLevel = 1;
    this.selectedRoomIndex = null;
    this.selectedBoxIndex = null;
  }

  enterRoom(index: number): void {
    this.selectedRoomIndex = index;
    this.viewLevel = 2;
    this.selectedBoxIndex = null;
  }

  enterBox(index: number): void {
    this.selectedBoxIndex = index;
    this.viewLevel = 3;
  }

  goBack(): void {
    if (this.viewLevel === 3) {
      this.selectedBoxIndex = null;
      this.viewLevel = 2;
    } else if (this.viewLevel === 2) {
      this.selectedRoomIndex = null;
      this.viewLevel = 1;
    } else if (this.viewLevel === 1) {
      this.selectedWarehouseIndex = null;
      this.viewLevel = 0;
    }
  }

  getNavTitle(): string {
    if (this.viewLevel === 0) {
      return 'Warehouses';
    }
    let warehouse = this.currentWarehouses?.warehouses[this.selectedWarehouseIndex ?? 0]
    if (this.viewLevel === 1) {
      return warehouse?.name || '';
    }
    if (this.viewLevel === 2 && this.selectedRoomIndex !== null) {
      return warehouse?.rooms[this.selectedRoomIndex].name || '';
    }
    if (this.viewLevel === 3 && this.selectedRoomIndex !== null && this.selectedBoxIndex !== null) {
      return warehouse?.rooms[this.selectedRoomIndex].boxes[this.selectedBoxIndex].name || '';
    }
    return '';
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

  private async openEditDialog(title: string, name = '', description = ''): Promise<{name: string, description: string} | null> {
    const result = await firstValueFrom(
      this.dialog.open(EditDialogComponent, {
        data: { title, name, description }
      }).afterClosed()
    );
    return result ?? null;
  }

  protected add(): Promise<void> {
    if (this.viewLevel === 0) {
      return this.addWarehouse();
    }
    if (this.viewLevel === 1) {
      return this.addRoom();
    }
    if (this.viewLevel === 2 && this.selectedRoomIndex !== null) {
      return this.addBox(this.selectedRoomIndex);
    }
    if (this.viewLevel === 3 && this.selectedRoomIndex !== null && this.selectedBoxIndex !== null) {
      return this.addItem(this.selectedRoomIndex, this.selectedBoxIndex);
    }
    throw new Error('Provided no supported level ' +
      'viewLevel: ' + this.viewLevel + ', selectedRoomIndex: ' + this.selectedRoomIndex + 'selectedBoxIndex: ' + this.selectedBoxIndex);
  }

  protected async edit(): Promise<void> {
    if (!this.currentWarehouses) throw new Error('No warehouses state');

    // edit warehouse
    if (this.viewLevel === 1 && this.selectedWarehouseIndex !== null) {
      const w = this.activeWarehouse;
      const result = await this.openEditDialog('Edit Warehouse', w.name, w.description);
      if (result) {
        w.name = result.name;
        w.description = result.description;
        await this.save();
      }
      return;
    }

    // edit room
    if (this.viewLevel === 2 && this.selectedWarehouseIndex !== null && this.selectedRoomIndex !== null) {
      const room = this.activeWarehouse.rooms[this.selectedRoomIndex];
      const result = await this.openEditDialog('Edit Room', room.name, room.description);
      if (result) {
        room.name = result.name;
        room.description = result.description;
        await this.save();
      }
      return;
    }

    // edit box
    if (this.viewLevel === 3 && this.selectedWarehouseIndex !== null && this.selectedRoomIndex !== null && this.selectedBoxIndex !== null) {
      const box = this.activeWarehouse.rooms[this.selectedRoomIndex].boxes[this.selectedBoxIndex];
      const result = await this.openEditDialog('Edit Box', box.name, box.description);
      if (result) {
        box.name = result.name;
        box.description = result.description;
        await this.save();
      }
      return;
    }

    throw new Error('Unsupported edit state');
  }

  protected async remove(): Promise<void> {
    const confirmed = await firstValueFrom(this.dialog.open(ConfirmDialogComponent, {
      data: { message: 'Are you sure you want to delete this?' }
    }).afterClosed());

    if (!confirmed) {
      return;
    }

    if (!this.currentWarehouses) throw new Error('No warehouses state');

    // remove warehouse
    if (this.viewLevel === 1 && this.selectedWarehouseIndex !== null) {
      this.currentWarehouses.warehouses.splice(this.selectedWarehouseIndex, 1);
      this.selectedWarehouseIndex = null;
      this.viewLevel = 0;
      await this.save();
      return;
    }

    // remove room
    if (this.viewLevel === 2 &&
      this.selectedWarehouseIndex !== null &&
      this.selectedRoomIndex !== null) {
      const w = this.activeWarehouse;
      w.rooms.splice(this.selectedRoomIndex, 1);
      this.selectedRoomIndex = null;
      this.viewLevel = 1;
      await this.save();
      return;
    }

    // remove box
    if (this.viewLevel === 3 &&
      this.selectedWarehouseIndex !== null &&
      this.selectedRoomIndex !== null &&
      this.selectedBoxIndex !== null) {
      const w = this.activeWarehouse;
      w.rooms[this.selectedRoomIndex].boxes.splice(this.selectedBoxIndex, 1);
      this.selectedBoxIndex = null;
      this.viewLevel = 2;
      await this.save();
      return;
    }

    throw new Error('Unsupported deletion state');
  }

  // mutations
  async addWarehouse(): Promise<void> {
    if (!this.userUid) {
      console.error('No logged user');
      return;
    }

    const result = await this.openEditDialog('Create Warehouse');
    if (!result) return;

    const warehouse = new Warehouse({
      name: result.name,
      description: result.description,
      rooms: []
    });

    if (!this.currentWarehouses || this.currentWarehouses.warehouses.length === 0) {
      this.currentWarehouses = new Warehouses({ warehouses: [warehouse] });
    } else {
      this.currentWarehouses.warehouses.push(warehouse);
    }
    await this.save();
  }

  async addRoom(): Promise<void> {
    const result = await this.openEditDialog('Create Room');
    if (!result) return;

    this.activeWarehouse.rooms.push(new WhRoom({
      name: result.name,
      description: result.description,
      boxes: []
    }));
    await this.save();
  }

  async addBox(roomIndex: number): Promise<void> {
    const result = await this.openEditDialog('Create Box');
    if (!result) return;

    this.activeWarehouse.rooms[roomIndex].boxes.push(new WhBox({
      name: result.name,
      description: result.description,
      items: []
    }));
    await this.save();
  }

  async addItem(roomIndex: number, boxIndex: number): Promise<void> {
    const result = await this.openEditDialog('Create Item');
    if (!result) return;

    this.activeWarehouse.rooms[roomIndex].boxes[boxIndex].items.push(new WhItem({
      name: result.name,
      description: result.description
    }));
    await this.save();
  }

}
