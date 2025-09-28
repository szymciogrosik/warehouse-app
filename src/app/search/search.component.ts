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
import {WarehouseNavigationService} from "../_services/warehouse/warehouse-navigation.service";
import {Router} from "@angular/router";
import {RedirectionEnum} from "../../utils/redirection.enum";
import {MatSelectModule} from "@angular/material/select";

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
    MatListItemTitle,
    MatSelectModule,
  ]
})
export class SearchComponent implements OnInit {
  protected availableRooms: { name: string; rooms: { name: string; fullPath: string }[] }[] = [];
  protected selectedRooms: string[] = [];
  protected displayedColumns: string[] = ['position', 'name', 'description', 'location'];
  protected dataSource = new MatTableDataSource<ItemTableRow>([]);
  private warehouseDb = inject(WarehouseDbService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  private dateService = inject(DateService);
  private translate = inject(CustomTranslateService);
  private navService = inject(WarehouseNavigationService);
  private router = inject(Router);

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

  protected applyFilter(event?: Event): void {
    const textFilter = event
      ? (event.target as HTMLInputElement).value.trim().toLowerCase()
      : '';

    this.dataSource.filterPredicate = (row: ItemTableRow, filter: string) => {
      const matchesText =
        !textFilter ||
        row.name.toLowerCase().includes(textFilter) ||
        row.description.toLowerCase().includes(textFilter) ||
        row.location.toLowerCase().includes(textFilter);

      const matchesRoom =
        this.selectedRooms.length > 0 &&
        this.selectedRooms.some(roomPath => row.location.includes(roomPath));

      return matchesText && matchesRoom;
    };

    // force re-evaluation even if content looks same
    this.dataSource.filter =
      textFilter + '|' + this.selectedRooms.sort().join(',') + '|' + Date.now();
  }

  private flattenItems(ws: Warehouses): ItemTableRow[] {
    const rows: ItemTableRow[] = [];
    const roomMap: { name: string; rooms: { name: string; fullPath: string }[] }[] = [];

    ws.warehouses.forEach((w: Warehouse, wi: number) => {
      const warehouseEntry = { name: w.name, rooms: [] as { name: string; fullPath: string }[] };

      w.rooms.forEach((r: WhRoom, ri: number) => {
        const roomPath = `${w.name} → ${r.name}`;
        warehouseEntry.rooms.push({ name: r.name, fullPath: roomPath });

        r.boxes.forEach((b: WhBox, bi: number) => {
          b.items.forEach((it: WhItem) => {
            rows.push({
              name: it.name || '',
              description: it.description || '',
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

      roomMap.push(warehouseEntry);
    });

    this.availableRooms = roomMap;

    // default: all rooms selected
    this.selectedRooms = roomMap.flatMap(w => w.rooms.map(r => r.fullPath));

    return rows;
  }

  protected navigateToBox(row: ItemTableRow): void {
    this.navService.setTarget({
      warehouseIndex: row.warehouseIndex,
      roomIndex: row.roomIndex,
      boxIndex: row.boxIndex
    });
    this.router.navigate([RedirectionEnum.HOME]);
  }

  public presentTimestamp(timestamp: string): string {
    if (timestamp) {
      return this.dateService.presentDateTime(DateTime.fromISO(timestamp))
    } else {
      return '';
    }
  }

}
