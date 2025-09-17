import {Routes, RouterModule} from '@angular/router';
import {HomeComponent} from './home/home.component';
import {RedirectionEnum} from '../utils/redirection.enum';
import {StatusComponent} from "./status/status.component";
import {LoginComponent} from "./login/login.component";
import {AdminComponent} from "./admin/admin.component";
import {authenticatedGuard} from "./_services/guard/authenticatedGuard";
import {adminPageGuard} from "./_services/guard/adminPageGuard";

const appRoutes: Routes = [
  {
    path: RedirectionEnum.HOME,
    component: HomeComponent
  },
  {
    path: RedirectionEnum.STATUS,
    component: StatusComponent
  },
  {
    path: RedirectionEnum.LOGIN,
    component: LoginComponent
  },
  {
    path: RedirectionEnum.ADMIN,
    component: AdminComponent,
    canActivate: [authenticatedGuard, adminPageGuard]
  },
  // otherwise redirect to home
  {path: '**', redirectTo: ''}
];

export const routing = RouterModule.forRoot(appRoutes);
