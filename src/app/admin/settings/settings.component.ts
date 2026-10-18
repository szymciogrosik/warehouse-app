import {Component, signal, inject} from '@angular/core';
import {AccessRoleService} from "../../_services/auth/access-role.service";
import {GlobalSettingsComponent} from "./global-settings/global-settings.component";
import {AccessRole} from "../../_models/user/access-role";
import {TranslatePipe} from '@ngx-translate/core';
import {MatTabsModule} from '@angular/material/tabs';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  standalone: true,
  imports: [GlobalSettingsComponent, TranslatePipe, MatTabsModule],
})
export class SettingsComponent {
  private accessService = inject(AccessRoleService);
  protected coreSettingsVisible = this.accessService.hasAnyRoleSignal([AccessRole.ADMIN_CORE_SETTINGS]);

}

