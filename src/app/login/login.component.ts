import {ChangeDetectionStrategy, Component, computed, effect, inject, signal} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CustomTranslateService} from '../_services/translate/custom-translate.service';
import {SnackbarService} from '../_services/util/snackbar.service';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {AuthService} from '../_services/auth/auth.service';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {EmbeddedBrowserPopupComponent} from './embedded-browser-popup/embedded-browser-popup.component';
import {EmbeddedBrowserWarningData} from '../_models/dialog/embedded-browser-warning/embedded-browser-warning-data';
import {FirebaseError} from '@angular/fire/app';
import {CustomValidators} from '../_services/validator/custom-validators';
import {MatTabChangeEvent, MatTabsModule} from '@angular/material/tabs';
import {PublicSettingsFacade} from '../_database/settings/public-settings.facade';
import {TranslatePipe} from '@ngx-translate/core';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {SkeletonComponent} from '../_shared-components/skeleton/skeleton.component';
import {RedirectionEnum} from '../../utils/redirection.enum';
import {firstValueFrom} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  standalone: true,
  imports: [
    TranslatePipe,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatTabsModule,
    MatCheckboxModule,
    RouterModule,
    SkeletonComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  readonly loading = signal(false);
  readonly submitted = signal(false);
  readonly hidePassword = signal(true);
  readonly isRegistrationMode = signal(false);
  returnUrl = '';

  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly snackbarService = inject(SnackbarService);
  private readonly translateService = inject(CustomTranslateService);
  private readonly dialog = inject(MatDialog);
  private readonly publicSettingsFacade = inject(PublicSettingsFacade);

  readonly checkingIfUserIsAlreadyLoggedIn = this.authService.isLoading;
  readonly allowForRegistering = this.publicSettingsFacade.allowForRegistering;
  readonly fetchingSettings = computed(() => this.publicSettingsFacade.settings() === undefined);

  constructor() {
    this.createForms();

    effect(() => {
      if (this.authService.isLoggedIn()) {
        this.router.navigate(['/' + RedirectionEnum.ADMIN]);
      }
    });

    this.authService.getAuthErrorLogout()
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.loading.set(false);
        this.loginForm.enable();
      });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  readonly termsRoute = '/' + RedirectionEnum.TERMS;
  readonly privacyRoute = '/' + RedirectionEnum.PRIVACY_POLICY;

  private createForms(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    this.registerForm = this.formBuilder.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), CustomValidators.passwordValidator]],
      acceptTerms: [false, [Validators.requiredTrue]]
    });
  }

  // convenience getter for easy access to form fields
  get loginFormControls(): { [key: string]: AbstractControl; } {
    return this.loginForm.controls;
  }

  get registerFormControls(): { [key: string]: AbstractControl; } {
    return this.registerForm.controls;
  }

  onTabChange(event: MatTabChangeEvent): void {
    this.isRegistrationMode.set(event.index === 1);
    this.hidePassword.set(true);
  }

  onSubmitLogin(): void {
    this.submitted.set(true);
    if (this.loginForm.invalid) return;

    const {email, password} = this.loginForm.getRawValue();
    this.loading.set(true);
    this.loginForm.disable();

    this.authService.loginWithEmailAndPassword(email, password)
      .then((): void => {
        // success
      })
      .catch((err): void => {
        this.snackbarService.openLongSnackBar(err);
        this.loading.set(false);
        this.loginForm.enable();
      });
  }

  onSubmitRegister(): void {
    this.submitted.set(true);
    if (this.registerForm.invalid) return;

    const {email, password, firstName, lastName} = this.registerForm.getRawValue();
    this.loading.set(true);
    this.registerForm.disable();

    this.authService.registerUserWithDetails(email, password, firstName, lastName)
      .then((): void => {
        // success
      })
      .catch((err): void => {
        if (err instanceof FirebaseError && err.code === 'auth/email-already-in-use') {
          this.snackbarService.openLongSnackBar(this.translateService.get('login.error.emailAlreadyUsed'));
        } else {
          this.snackbarService.openLongSnackBar(err);
        }
        this.loading.set(false);
        this.registerForm.enable();
      });
  }

  protected getErrorMessage(formControlName: string, isRegister: boolean = false): string {
    const control = isRegister ? this.registerFormControls[formControlName] : this.loginFormControls[formControlName];
    if (!control) return '';

    if (control.hasError('required')) {
      return this.translateService.get('login.validation.mandatoryField');
    }
    if (control.hasError('email')) {
      return this.translateService.get('login.validation.invalidEmail');
    }
    if (control.hasError('minlength')) {
      const requiredLength = control.errors?.['minlength']?.requiredLength;
      return this.translateService.get('registration.validation.minLength') + requiredLength;
    }
    if (control.hasError('invalidPasswordSecurity')) {
      return this.translateService.get('registration.validation.invalidPasswordSecurity');
    }

    return '';
  }

  protected openPopupIfEmbeddedBrowserOpenOtherwiseOpenPopup(): void {
    const isMessengerBrowser = navigator.userAgent.match(/FBAN|FBAV/i);
    if (isMessengerBrowser) {
      this.openWarningPopup();
    } else {
      this.loginGoogleSsoPopup();
    }
  }

  private async openWarningPopup(): Promise<void> {
    const dialogRef = this.dialog.open(
      EmbeddedBrowserPopupComponent,
      {
        maxWidth: '600px',
        width: '400px',
        disableClose: true,
        data: new EmbeddedBrowserWarningData('Messenger'),
      }
    );

    const result = await firstValueFrom(dialogRef.afterClosed());
    if (result) {
      navigator.clipboard.writeText(window.location.href);
    }
  }

  private loginGoogleSsoPopup(): void {
    this.loading.set(true);
    if (this.isRegistrationMode() && this.allowForRegistering()) this.registerForm.disable();
    else this.loginForm.disable();

    this.authService.loginWithGoogleSso(this.isRegistrationMode() && this.allowForRegistering())
      .then((): void => {
        // success; leave loading = true so spinner stays until redirection
      })
      .catch((err): void => {
        this.snackbarService.openLongSnackBar(err);
        this.loading.set(false);
        if (this.isRegistrationMode() && this.allowForRegistering()) this.registerForm.enable();
        else this.loginForm.enable();
      });
  }

}

