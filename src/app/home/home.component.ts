import {Component, OnInit, DestroyRef, inject} from '@angular/core';
import {environment} from "../../environments/environment";
import {CustomCommonModule} from "../_imports/CustomCommon.module";
import {WarehouseDbService} from "../_database/warehouse/warehouse.service";
import {Warehouse} from "../_models/warehouse/warehouse";
import {AuthService} from "../_services/auth/auth.service";
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Observable} from "rxjs";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [CustomCommonModule],
})
export class HomeComponent implements OnInit {
  protected readonly environment = environment;
  protected userUid: string | null = null;
  protected warehouse$: Observable<Warehouse | null>;

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
            this.warehouse$ = this.warehouseDb.getByUser(user.uid);
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

  async createDummyWarehouse(): Promise<void> {
    if (!this.userUid) {
      console.error('No logged user');
      return;
    }

    const warehouse = new Warehouse({
      name: 'Main',
      description: 'Central warehouse',
      rooms: [
        {
          name: 'Room A',
          description: 'Electronics section',
          boxes: [
            {
              name: 'Box A1',
              description: 'Laptops',
              items: [
                { name: 'Dell XPS 13', description: 'Laptop model' },
                { name: 'MacBook Pro', description: 'Laptop model' }
              ]
            },
            {
              name: 'Box A2',
              description: 'Monitors',
              items: [
                { name: 'Dell 24"', description: 'Full HD Monitor' },
                { name: 'LG 27"', description: '4K Monitor' }
              ]
            }
          ]
        },
        {
          name: 'Room B',
          description: 'Furniture section',
          boxes: [
            {
              name: 'Box B1',
              description: 'Chairs',
              items: [
                { name: 'Office Chair', description: 'Ergonomic' },
                { name: 'Gaming Chair', description: 'Adjustable' }
              ]
            }
          ]
        }
      ]
    });

    await this.warehouseDb.save(this.userUid, warehouse);
    console.log('Warehouse created with nested rooms, boxes, and items');
  }

}
