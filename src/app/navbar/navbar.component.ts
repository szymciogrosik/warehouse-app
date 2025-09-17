import {Component, OnInit} from '@angular/core';
import {RedirectionEnum} from '../../utils/redirection.enum';
import {CustomTranslateService} from '../_services/translate/custom-translate.service';
import {LanguageEnum} from "../_services/translate/language-enum";
import {AuthService} from "../_services/auth/auth.service";
import {CustomCommonModule} from "../_imports/CustomCommon.module";
import {AccessRoleService} from "../_services/auth/access-role.service";
import {AccessRole} from "../_models/user/access-role";
import {Observable} from "rxjs";
import {Router} from "@angular/router";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: true,
  imports: [CustomCommonModule],
})
export class NavbarComponent implements OnInit {
  protected readonly LanguageEnum = LanguageEnum;
  protected readonly rp = RedirectionEnum;
  protected isAdmin$: Observable<boolean>;

  constructor(
    protected translateService: CustomTranslateService,
    protected authService: AuthService,
    private accessService: AccessRoleService,
    private router: Router,
  ) {
    this.isAdmin$ = this.accessService.isAuthorized$(AccessRole.ADMIN_PAGE_ACCESS);
  }

  ngOnInit(): void { }

  logout(): void {
    this.authService.logout(true);
  }

  navigateToAdminPanel(): void {
    this.router.navigate(["/" + RedirectionEnum.ADMIN]);
  }

  protected readonly AccessRoleService = AccessRoleService;
  protected readonly AccessRole = AccessRole;
}
