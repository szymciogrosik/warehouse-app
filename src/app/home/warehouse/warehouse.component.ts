import {Component, Input, OnInit, inject, DestroyRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatIconModule} from '@angular/material/icon';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Observable} from 'rxjs';

import {Warehouse} from '../../_models/warehouse/warehouse';
import {WarehouseDbService} from '../../_database/warehouse/warehouse.service';
import {AuthService} from '../../_services/auth/auth.service';
import {MatList, MatListItem} from "@angular/material/list";

@Component({
  selector: 'warehouse-view',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatExpansionModule,
    MatIconModule,
    MatList,
    MatListItem
  ],
  templateUrl: './warehouse.component.html',
  styleUrls: ['./warehouse.component.scss']
})
export class WarehouseViewComponent implements OnInit {
  warehouse$: Observable<Warehouse | null>;
  currentWarehouse: Warehouse | null = null;
  userUid: string | null = null;

  private warehouseDb = inject(WarehouseDbService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.authService.loggedUser()
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

  async addRoom(): Promise<void> {
    if (!this.userUid) {
      throw new Error('User is not logged in');
    }

    if (!this.currentWarehouse) {
      throw new Error('Warehouse not found');
    }

    this.currentWarehouse.rooms.push({
      name: 'New Room',
      description: 'Describe here',
      boxes: []
    });

    await this.warehouseDb.save(this.userUid, new Warehouse(this.currentWarehouse));
  }

  async addBox(roomIndex: number): Promise<void> {
    const newBox = {name: 'New Box', description: 'Describe here', items: []};

    if (!this.userUid) {
      throw new Error('User is not logged in');
    }

    if (!this.currentWarehouse) {
      throw new Error('Warehouse not found');
    }

    this.currentWarehouse.rooms[roomIndex].boxes.push(newBox);

    await this.warehouseDb.save(this.userUid, new Warehouse(this.currentWarehouse));
  }

  async addItem(roomIndex: number, boxIndex: number): Promise<void> {
    const newItem = {name: 'New Item', description: 'Describe here'};

    if (!this.userUid) {
      throw new Error('User is not logged in');
    }

    if (!this.currentWarehouse) {
      throw new Error('Warehouse not found');
    }

    this.currentWarehouse.rooms[roomIndex].boxes[boxIndex].items.push(newItem);

    await this.warehouseDb.save(this.userUid, new Warehouse(this.currentWarehouse));
  }
}
