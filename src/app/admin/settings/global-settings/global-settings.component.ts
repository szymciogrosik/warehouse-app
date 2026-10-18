import { Component } from '@angular/core';
import { UsersComponent } from '../global-settings/users/users.component';
import { PublicSettingsComponent } from '../global-settings/public-settings/public-settings.component';
import { TranslatePipe } from '@ngx-translate/core';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-global-settings',
  imports: [UsersComponent, PublicSettingsComponent, TranslatePipe, MatTabsModule],
  templateUrl: './global-settings.component.html',
  styleUrl: './global-settings.component.scss'
})
export class GlobalSettingsComponent {

}
