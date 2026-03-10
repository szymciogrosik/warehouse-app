import {Component, OnInit} from '@angular/core';
import {RedirectionEnum} from '../../utils/redirection.enum';
import {CustomTranslateService} from '../_services/translate/custom-translate.service';
import {LanguageEnum} from '../_services/translate/language-enum';
import {AuthService} from '../_services/auth/auth.service';
import {AccessRoleService} from '../_services/auth/access-role.service';
import {AccessRole} from '../_models/user/access-role';
import {CustomUser} from '../_models/user/custom-user';
import {Observable} from 'rxjs';
import {Router, RouterModule} from '@angular/router';
import {ThemeService} from '../_services/util/theme.service';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatToolbarModule} from '@angular/material/toolbar';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    RouterModule,
    MatToolbarModule
  ]
})
export class NavbarComponent implements OnInit {
  protected readonly LanguageEnum = LanguageEnum;
  protected readonly rp = RedirectionEnum;
  protected isAdmin$: Observable<boolean>;
  protected currentUser$: Observable<CustomUser | null>;
  protected isDarkTheme$: Observable<boolean>;
  protected allowDarkMode$: Observable<boolean>;

  constructor(
    protected translateService: CustomTranslateService,
    protected authService: AuthService,
    private accessService: AccessRoleService,
    private router: Router,
    public themeService: ThemeService
  ) {
    this.isAdmin$ = this.accessService.isAuthorized$(AccessRole.ADMIN_PAGE_ACCESS);
    this.currentUser$ = this.authService.loggedUser();
    this.isDarkTheme$ = this.themeService.isDarkTheme$;
    this.allowDarkMode$ = this.themeService.allowDarkMode$;
  }

  ngOnInit(): void {
  }

  logout(): void {
    this.authService.logout(true);
  }

  navigateToAdminPanel(): void {
    this.router.navigate(['/' + RedirectionEnum.ADMIN]);
  }

  navigateToProfile(): void {
    this.router.navigate(['/' + RedirectionEnum.PROFILE]);
  }

  navigateToLogin(): void {
    this.router.navigate(['/' + RedirectionEnum.LOGIN]);
  }

  navigateToSearchItems() {
    this.router.navigate(["/" + RedirectionEnum.SEARCH]);
  }

  protected readonly AccessRoleService = AccessRoleService;
  protected readonly AccessRole = AccessRole;
}
