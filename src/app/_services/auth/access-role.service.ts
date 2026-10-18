import {computed, inject, Injectable, Signal} from '@angular/core';
import {AuthService} from './auth.service';
import {AccessRole} from '../../_models/user/access-role';
import {firstValueFrom} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccessRoleService {
  private readonly authService = inject(AuthService);

  public isAuthorizedSignal(requestedRole: AccessRole): Signal<boolean> {
    return computed(() => {
      const user = this.authService.currentUser();
      return !!user?.roles.includes(requestedRole);
    });
  }

  public hasAnyRoleSignal(requestedRoles: AccessRole[]): Signal<boolean> {
    return computed(() => {
      const user = this.authService.currentUser();
      if (!user?.roles) return false;
      return requestedRoles.some(role => user.roles.includes(role));
    });
  }

  public async isAuthorized(requestedRole: AccessRole): Promise<boolean> {
    try {
      const user = await firstValueFrom(this.authService.loggedUser());
      return !!user?.roles.includes(requestedRole);
    } catch {
      return false;
    }
  }
}
