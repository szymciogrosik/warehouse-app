import {Component, OnInit, inject, DestroyRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {firstValueFrom, Observable} from 'rxjs';

import {Warehouse} from '../../_models/warehouse/warehouse';
import {Warehouses} from '../../_models/warehouse/warehouses';
import {WhRoom} from '../../_models/warehouse/wh-room';
import {WhBox} from '../../_models/warehouse/wh-box';
import {WhItem} from '../../_models/warehouse/wh-item';

import {WarehouseDbService} from '../../_database/warehouse/warehouse.service';
import {AuthService} from '../../_services/auth/auth.service';
import {MatDialog, MatDialogModule} from "@angular/material/dialog";
import {ConfirmDeleteDialogComponent} from "../../_shared-components/confirm-dialog/confirm-delete-dialog.component";
import {EditDialogComponent} from "../../_shared-components/edit-dialog/edit-dialog.component";
import {CustomTranslateService} from "../../_services/translate/custom-translate.service";
import {MatLineModule} from '@angular/material/core';
import {TranslatePipe} from "@ngx-translate/core";
import {DateTime} from "luxon";
import {DateService} from "../../_services/util/date.service";
import {WhSharedElem} from "../../_models/warehouse/shared/wh-shared-elem";

@Component({
  selector: 'warehouse-view',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDialogModule,
    MatLineModule,
    TranslatePipe
  ],
  templateUrl: './warehouse.component.html',
  styleUrls: ['./warehouse.component.scss']
})
export class WarehouseViewComponent implements OnInit {
  protected readonly DateTime = DateTime;

  warehouses$: Observable<Warehouses | null>;
  currentWarehouses: Warehouses | null = null;
  userUid: string | null = null;

  // navigation state
  selectedWarehouseIndex: number | null = null;
  viewLevel = 0; // 0 = rooms, 1 = boxes, 2 = items
  selectedRoomIndex: number | null = null;
  selectedBoxIndex: number | null = null;
  private firstLoading: boolean = true;

  private warehouseDb = inject(WarehouseDbService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  private dialog = inject(MatDialog);
  private translateService = inject(CustomTranslateService);
  protected dateService = inject(DateService);

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
              this.currentWarehouses = ws;
              if (this.currentWarehouses) {
                this.setupStartPointIfFirstLoading();
              }
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
      return this.translateService.get('confirmation.dialog.warehouses');
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

  // helpers
  private async save(): Promise<void> {
    if (!this.userUid) throw new Error('User is not logged in');
    if (!this.currentWarehouses) throw new Error('No warehouses state');
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

  private async openEditDialog(title: string, name = '', description = ''): Promise<{
    name: string,
    description: string
  } | null> {
    const result = await firstValueFrom(
      this.dialog.open(EditDialogComponent, {
        data: {title, name, description},
        width: '600px',          // fixed width
        maxWidth: '90vw',        // responsive cap
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
      const result =
        await this.openEditDialog(this.translateService.get('edit.wh.dialog.edit.warehouse'), w.name, w.description);
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
      const result =
        await this.openEditDialog(this.translateService.get('edit.wh.dialog.edit.room'), room.name, room.description);
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
      const result =
        await this.openEditDialog(this.translateService.get('edit.wh.dialog.edit.box'), box.name, box.description);
      if (result) {
        box.name = result.name;
        box.description = result.description;
        await this.save();
      }
      return;
    }

    throw new Error('Unsupported edit state');
  }

  protected async editItem(itemIndex: number): Promise<void> {
    if (this.selectedWarehouseIndex === null || this.selectedRoomIndex === null || this.selectedBoxIndex === null) {
      return;
    }

    const item = this.activeWarehouse.rooms[this.selectedRoomIndex].boxes[this.selectedBoxIndex].items[itemIndex];
    const result = await this.openEditDialog(
      this.translateService.get('edit.wh.dialog.edit.item'),
      item.name,
      item.description
    );

    if (result) {
      item.name = result.name;
      item.description = result.description;
      item.updatedTimestamp = WhSharedElem.normalizeTimestamp(null);
      await this.save();
    }
  }

  protected async removeItem(itemIndex: number): Promise<void> {
    const confirmed = await firstValueFrom(this.dialog.open(ConfirmDeleteDialogComponent).afterClosed());
    if (!confirmed) return;

    if (this.selectedWarehouseIndex === null || this.selectedRoomIndex === null || this.selectedBoxIndex === null) {
      return;
    }

    this.activeWarehouse.rooms[this.selectedRoomIndex].boxes[this.selectedBoxIndex].items.splice(itemIndex, 1);
    await this.save();
  }

  protected async remove(): Promise<void> {
    const confirmed = await firstValueFrom(this.dialog.open(ConfirmDeleteDialogComponent).afterClosed());

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

    const result =
      await this.openEditDialog(this.translateService.get('edit.wh.dialog.add.warehouse'));
    if (!result) return;

    const warehouse = new Warehouse({
      name: result.name,
      description: result.description,
      rooms: []
    });

    if (!this.currentWarehouses || this.currentWarehouses.warehouses.length === 0) {
      this.currentWarehouses = new Warehouses({warehouses: [warehouse]});
    } else {
      this.currentWarehouses.warehouses.push(warehouse);
    }
    await this.save();
  }

  async addRoom(): Promise<void> {
    const result =
      await this.openEditDialog(this.translateService.get('edit.wh.dialog.add.room'));
    if (!result) return;

    this.activeWarehouse.rooms.push(new WhRoom({
      name: result.name,
      description: result.description,
      boxes: []
    }));
    await this.save();
  }

  async addBox(roomIndex: number): Promise<void> {
    const result =
      await this.openEditDialog(this.translateService.get('edit.wh.dialog.add.box'));
    if (!result) return;

    this.activeWarehouse.rooms[roomIndex].boxes.push(new WhBox({
      name: result.name,
      description: result.description,
      items: []
    }));
    await this.save();
  }

  async addItem(roomIndex: number, boxIndex: number): Promise<void> {
    const result =
      await this.openEditDialog(this.translateService.get('edit.wh.dialog.add.item'));
    if (!result) return;

    this.activeWarehouse.rooms[roomIndex].boxes[boxIndex].items.push(new WhItem({
      name: result.name,
      description: result.description
    }));
    await this.save();
  }

  public getLastModificationTimestampForWarehouse(warehouse: Warehouse): string {
    let latest: string | null = null;
    for (const room of warehouse.rooms) {
      const ts = this.getLastModificationTimestampForRoom(room);
      if (!ts) continue;
      if (!latest || DateTime.fromISO(ts) > DateTime.fromISO(latest)) {
        latest = ts;
      }
    }
    return latest ?? warehouse.createdTimestamp;
  }

  public getLastModificationTimestampForRoom(room: WhRoom): string {
    let latest: string | null = null;
    for (const box of room.boxes) {
      const ts = this.getLastModificationTimestampForBox(box);
      if (!ts) continue;
      if (!latest || DateTime.fromISO(ts) > DateTime.fromISO(latest)) {
        latest = ts;
      }
    }
    return latest ?? room.createdTimestamp;
  }

  public getLastModificationTimestampForBox(box: WhBox): string {
    if (!box.items || box.items.length === 0) return '';
    let latest = box.items[0].updatedTimestamp;
    for (const item of box.items) {
      if (DateTime.fromISO(item.updatedTimestamp) > DateTime.fromISO(latest)) {
        latest = item.updatedTimestamp;
      }
    }
    return latest;
  }

  public presentTimestamp(timestamp: string): string {
    if (timestamp) {
      return this.dateService.presentDateTime(DateTime.fromISO(timestamp))
    } else {
      return '';
    }
  }

  private setupStartPointIfFirstLoading() {
    if (!this.firstLoading) {
      return;
    }
    if (this.currentWarehouses?.warehouses?.length === 1) {
      this.enterWarehouse(0);
      if (this.currentWarehouses.warehouses[0]?.rooms?.length === 1) {
        this.enterRoom(0);
        if (this.currentWarehouses.warehouses[0].rooms[0]?.boxes?.length === 1) {
          this.enterBox(0);
        }
      }
    }
    this.firstLoading = false;
  }
}
