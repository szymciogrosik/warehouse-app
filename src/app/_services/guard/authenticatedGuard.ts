import {ActivatedRouteSnapshot, CanActivateFn, Router} from '@angular/router';
import {inject} from "@angular/core";
import {AuthService} from "../auth/auth.service";
import {RedirectionEnum} from "../../../utils/redirection.enum";
import {tap} from "rxjs";

export const authenticatedGuard: CanActivateFn = (next: ActivatedRouteSnapshot) => {
  const authService: AuthService = inject(AuthService);
  const router: Router = inject(Router);
  return authService.isAuthenticated().pipe(
    tap(isAuthenticated => {
      if (isAuthenticated) {
        return true;
      } else {
        router.navigate([RedirectionEnum.LOGIN]);
        return false;
      }
    })
  );
};
