import {Component, OnInit, DestroyRef, inject} from '@angular/core';
import {environment} from "../../environments/environment";
import {CustomCommonModule} from "../_imports/CustomCommon.module";
import {WarehouseDbService} from "../_database/warehouse/warehouse.service";
import {Warehouse} from "../_models/warehouse/warehouse";
import {Warehouses} from "../_models/warehouse/warehouses";
import {AuthService} from "../_services/auth/auth.service";
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Observable} from "rxjs";
import {WarehouseViewComponent} from "./warehouse/warehouse.component";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [CustomCommonModule, WarehouseViewComponent],
})
export class HomeComponent implements OnInit {
  protected readonly environment = environment;
  protected userUid: string | null = null;
  protected warehouses$: Observable<Warehouses | null>;

  private destroyRef = inject(DestroyRef);

  constructor(
    private authService: AuthService,
    private warehouseDb: WarehouseDbService
  ) {
  }

  ngOnInit(): void {
    this.authService.loggedUser()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: user => {
          if (user) {
            this.userUid = user.uid;
            this.warehouses$ = this.warehouseDb.getByUser(user.uid);
          } else {
            this.userUid = null;
          }
        },
        error: err => {
          this.userUid = null;
          console.error(err);
        }
      });
  }
}
