import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CustomTranslateService} from '../_services/translate/custom-translate.service';
import {SnackbarService} from '../_services/util/snackbar.service';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../_services/auth/auth.service';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {EmbeddedBrowserPopupComponent} from './embedded-browser-popup/embedded-browser-popup.component';
import {EmbeddedBrowserWarningData} from '../_models/dialog/embedded-browser-warning/embedded-browser-warning-data';
import {FirebaseError} from '@angular/fire/app';
import {CustomValidators} from '../_services/validator/custom-validators';
import {MatTabChangeEvent, MatTabsModule} from '@angular/material/tabs';
import {PublicSettingsService} from '../_database/settings/public-settings.service';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  standalone: true,
  imports: [CommonModule, TranslateModule, MatCardModule, MatButtonModule, MatProgressSpinnerModule, MatIconModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatDialogModule, MatTabsModule],
})
export class LoginComponent implements OnInit {
  checkingIfUserIsAlreadyLoggedIn: boolean = true;
  loginForm: FormGroup;
  registerForm: FormGroup;
  loading: boolean = false;
  submitted: boolean = false;
  hidePassword: boolean = true;
  isRegistrationMode: boolean = false;
  returnUrl: string = '';

  allowForRegistering: boolean = false;
  fetchingSettings: boolean = true;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snackbarService: SnackbarService,
    private translateService: CustomTranslateService,
    private dialog: MatDialog,
    private publicSettingsService: PublicSettingsService
  ) {
    setTimeout(() => {
      this.authService.isAuthenticated().subscribe({
        next: (isLoggedUser: boolean) => {
          if (isLoggedUser) {
            this.router.navigateByUrl(this.returnUrl || '/');
          } else {
            this.checkingIfUserIsAlreadyLoggedIn = false;
          }
        }
      });

      this.authService.getAuthErrorLogout().subscribe(() => {
        this.loading = false;
        this.loginForm.enable();
      });
    }, 600);
  }

  ngOnInit(): void {
    this.publicSettingsService.getDocument('general').subscribe({
      next: (data) => {
        if (data && data.allowForRegistering !== undefined) {
          this.allowForRegistering = data.allowForRegistering;
        } else {
          this.allowForRegistering = false;
        }
        this.fetchingSettings = false;
      },
      error: (err) => {
        console.error('Failed to fetch public settings.', err);
        this.allowForRegistering = false;
        this.fetchingSettings = false;
      }
    });

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    this.registerForm = this.formBuilder.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), CustomValidators.passwordValidator]]
    });

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  // convenience getter for easy access to form fields
  get loginFormControls(): { [key: string]: AbstractControl; } {
    return this.loginForm.controls;
  }

  get registerFormControls(): { [key: string]: AbstractControl; } {
    return this.registerForm.controls;
  }

  onTabChange(event: MatTabChangeEvent): void {
    this.isRegistrationMode = event.index === 1;
    this.hidePassword = true;
  }

  onSubmitLogin(): void {
    this.submitted = true;
    if (this.loginForm.invalid) return;

    const {email, password} = this.loginForm.getRawValue();
    this.loading = true;
    this.loginForm.disable();

    this.authService.loginWithEmailAndPassword(email, password)
      .then((): void => {
        // success
      })
      .catch((err): void => {
        this.snackbarService.openLongSnackBar(err);
        this.loading = false;
        this.loginForm.enable();
      });
  }

  onSubmitRegister(): void {
    this.submitted = true;
    if (this.registerForm.invalid) return;

    const {email, password, firstName, lastName} = this.registerForm.getRawValue();
    this.loading = true;
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
        this.loading = false;
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

  private openWarningPopup() {
    const dialogRef = this.dialog.open(
      EmbeddedBrowserPopupComponent,
      {
        maxWidth: '600px',
        width: '400px',
        disableClose: true,
        data: new EmbeddedBrowserWarningData('Messenger'),
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        navigator.clipboard.writeText(window.location.href);
      }
    });
  }

  private loginGoogleSsoPopup(): void {
    this.loading = true;
    if (this.isRegistrationMode && this.allowForRegistering) this.registerForm.disable();
    else this.loginForm.disable();

    this.authService.loginWithGoogleSso(this.isRegistrationMode && this.allowForRegistering)
      .then((): void => {
        // success; leave loading = true so spinner stays until redirection
      })
      .catch((err): void => {
        this.snackbarService.openLongSnackBar(err);
        this.loading = false;
        if (this.isRegistrationMode && this.allowForRegistering) this.registerForm.enable();
        else this.loginForm.enable();
      });
  }

}
