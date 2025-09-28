import {Component, OnInit, inject, DestroyRef} from '@angular/core';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSortModule} from '@angular/material/sort';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

import {TranslatePipe} from "@ngx-translate/core";
import {WarehouseDbService} from "../_database/warehouse/warehouse.service";
import {AuthService} from "../_services/auth/auth.service";
import {CustomTranslateService} from "../_services/translate/custom-translate.service";
import {Warehouses} from "../_models/warehouse/warehouses";
import {Warehouse} from "../_models/warehouse/warehouse";
import {WhRoom} from "../_models/warehouse/wh-room";
import {WhBox} from "../_models/warehouse/wh-box";
import {WhItem} from "../_models/warehouse/wh-item";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {MatList, MatListItem, MatListItemLine, MatListItemTitle} from "@angular/material/list";
import {CommonModule} from "@angular/common";
import {MatCard} from "@angular/material/card";
import {DateTime} from "luxon";
import {DateService} from "../_services/util/date.service";

interface ItemTableRow {
  name: string;
  description: string;
  location: string;
  warehouseIndex: number;
  roomIndex: number;
  boxIndex: number;
  updatedTimestamp: string;
  createdTimestamp: string;
}

@Component({
  selector: 'app-search',
  standalone: true,
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  imports: [
    CommonModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    TranslatePipe,
    MatListItem,
    MatList,
    MatCard,
    MatListItemLine,
    MatListItemTitle
  ]
})
export class SearchComponent implements OnInit {
  protected displayedColumns: string[] = ['position', 'name', 'description', 'location'];
  protected dataSource = new MatTableDataSource<ItemTableRow>([]);
  private warehouseDb = inject(WarehouseDbService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  private dateService = inject(DateService);
  private translate = inject(CustomTranslateService);

  protected warehouses: Warehouses | null = null;

  ngOnInit(): void {
    this.authService.loggedUser()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(user => {
        if (user) {
          this.warehouseDb.getByUser(user.uid)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(ws => {
              this.warehouses = ws;
              if (ws) {
                this.dataSource.data = this.flattenItems(ws);
              }
            });
        }
      });
  }

  protected applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  private flattenItems(ws: Warehouses): ItemTableRow[] {
    const rows: ItemTableRow[] = [];
    ws.warehouses.forEach((w: Warehouse, wi: number) => {
      w.rooms.forEach((r: WhRoom, ri: number) => {
        r.boxes.forEach((b: WhBox, bi: number) => {
          b.items.forEach((it: WhItem) => {
            rows.push({
              name: it.name ? it.name : '',
              description: it.description ? it.description : '',
              location: `${w.name} → ${r.name} → ${b.name}`,
              warehouseIndex: wi,
              roomIndex: ri,
              boxIndex: bi,
              updatedTimestamp: it.updatedTimestamp,
              createdTimestamp: it.createdTimestamp
            });
          });
        });
      });
    });
    return rows;
  }

  protected navigateToBox(row: ItemTableRow): void {
    // Tutaj zamiast console.log powinieneś:
    // - albo zawołać serwis do ustawienia "selectedWarehouseIndex/Room/Box"
    // - albo router.navigate do WarehouseViewComponent
    console.log('Navigate to box:', row);
  }

  public presentTimestamp(timestamp: string): string {
    if (timestamp) {
      return this.dateService.presentDateTime(DateTime.fromISO(timestamp))
    } else {
      return '';
    }
  }

}
