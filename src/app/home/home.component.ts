import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {APP_CONFIG} from '../app.config.token';
import {CommonModule} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {WarehouseViewComponent} from './warehouse/warehouse.component';
import {StarterShowcaseComponent} from './starter-showcase/starter-showcase.component';
import {SkeletonComponent} from '../_shared-components/skeleton/skeleton.component';
import {AuthService} from '../_services/auth/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [CommonModule, MatCardModule, WarehouseViewComponent, StarterShowcaseComponent, SkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
  protected readonly environment = inject(APP_CONFIG);
  private readonly authService = inject(AuthService);

  protected readonly isLoggedIn = this.authService.isLoggedIn;
  protected readonly isAuthLoading = this.authService.isLoading;
}
