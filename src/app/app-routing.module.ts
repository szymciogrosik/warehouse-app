import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from './home/home.component';
import {RedirectionEnum} from '../utils/redirection.enum';
import {StatusComponent} from "./status/status.component";
import {LoginComponent} from "./login/login.component";
import {AdminComponent} from "./admin/admin.component";
import {authenticatedGuard} from "./_services/guard/authenticatedGuard";
import {adminPageGuard} from "./_services/guard/adminPageGuard";
import {ProfileComponent} from "./profile/profile.component";
import {SearchComponent} from "./search/search.component";
import {PrivacyPolicyComponent} from "./legal/privacy-policy/privacy-policy.component";
import {TermsOfServiceComponent} from "./legal/terms-of-service/terms-of-service.component";
import {CookiePolicyComponent} from "./legal/cookie-policy/cookie-policy.component";

const appRoutes: Routes = [
  {
    path: RedirectionEnum.HOME,
    component: HomeComponent,
    canActivate: [authenticatedGuard]
  },
  {
    path: RedirectionEnum.SEARCH,
    component: SearchComponent,
    canActivate: [authenticatedGuard]
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
  {
    path: RedirectionEnum.PROFILE,
    component: ProfileComponent,
    canActivate: [authenticatedGuard]
  },
  {
    path: RedirectionEnum.PRIVACY_POLICY,
    component: PrivacyPolicyComponent
  },
  {
    path: RedirectionEnum.TERMS,
    component: TermsOfServiceComponent
  },
  {
    path: RedirectionEnum.COOKIES,
    component: CookiePolicyComponent
  },
  // otherwise redirect to home
  {path: '**', redirectTo: ''}
];

export const routing = RouterModule.forRoot(appRoutes, {
  scrollPositionRestoration: 'top',
  anchorScrolling: 'enabled'
});

