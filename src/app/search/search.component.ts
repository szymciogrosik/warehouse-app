import {Component, OnInit, inject, DestroyRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {firstValueFrom, Observable} from 'rxjs';
import {DateTime} from "luxon";
import {Warehouses} from "../_models/warehouse/warehouses";
import {WarehouseDbService} from "../_database/warehouse/warehouse.service";
import {AuthService} from "../_services/auth/auth.service";
import {CustomTranslateService} from "../_services/translate/custom-translate.service";
import {DateService} from "../_services/util/date.service";

@Component({
  selector: 'app-search',
  imports: [],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent implements OnInit {
  protected readonly DateTime = DateTime;

  warehouses$: Observable<Warehouses | null>;
  currentWarehouses: Warehouses | null = null;
  userUid: string | null = null;

  private warehouseDb = inject(WarehouseDbService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);
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
            });
        } else {
          this.userUid = null;
        }
      });
  }

  public presentTimestamp(timestamp: string): string {
    return this.dateService.presentDateTime(DateTime.fromISO(timestamp))
  }

}
