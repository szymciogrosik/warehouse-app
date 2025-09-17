import {ActivatedRouteSnapshot, CanActivateFn, Router} from '@angular/router';
import {inject} from "@angular/core";
import {RedirectionEnum} from "../../../utils/redirection.enum";
import {from, tap} from "rxjs";
import {AccessRoleService} from "../auth/access-role.service";
import {AccessRole} from "../../_models/user/access-role";
import {map} from "rxjs/operators";

export const adminPageGuard: CanActivateFn = (next: ActivatedRouteSnapshot) => {
  const accessRoleService: AccessRoleService = inject(AccessRoleService);
  const router: Router = inject(Router);
  return from(accessRoleService.isAuthorized(AccessRole.ADMIN_PAGE_ACCESS)).pipe(
    map(isAuthenticated => {
      if (isAuthenticated) {
        return true;
      } else {
        router.navigate([RedirectionEnum.HOME]);
        return false;
      }
    })
  );
};
