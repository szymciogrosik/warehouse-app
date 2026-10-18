import {ChangeDetectionStrategy, Component, OnInit, inject} from '@angular/core';
import {APP_CONFIG} from '../app.config.token';
import {CommonModule} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {WarehouseViewComponent} from './warehouse/warehouse.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [CommonModule, MatCardModule, WarehouseViewComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  protected readonly environment = inject(APP_CONFIG);

  ngOnInit(): void {
  }
}
