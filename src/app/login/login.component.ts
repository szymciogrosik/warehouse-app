import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {CustomTranslateService} from "../_services/translate/custom-translate.service";
import {SnackbarService} from "../_services/util/snackbar.service";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../_services/auth/auth.service";
import {RedirectionEnum} from "../../utils/redirection.enum";
import {MatDialog} from "@angular/material/dialog";
import {EmbeddedBrowserPopupComponent} from "./embedded-browser-popup/embedded-browser-popup.component";
import {EmbeddedBrowserWarningData} from "../_models/dialog/embedded-browser-warning/embedded-browser-warning-data";
import {CustomCommonModule} from "../_imports/CustomCommon.module";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  standalone: true,
  imports: [CustomCommonModule],
})
export class LoginComponent implements OnInit {
  checkingIfUserIsAlreadyLoggedIn: boolean = true;
  loginForm: FormGroup;
  loading: boolean = false;
  submitted: boolean = false;
  hidePassword: boolean = true;
  returnUrl: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snackbarService: SnackbarService,
    private translateService: CustomTranslateService,
    private dialog: MatDialog
  ) {
    setTimeout(() => {
      this.authService.isAuthenticated().subscribe({
        next: (isLoggedUser: boolean) => {
          if (isLoggedUser) {
            this.router.navigate([RedirectionEnum.HOME]);
          } else {
            this.checkingIfUserIsAlreadyLoggedIn = false;
          }
        }
      });
    }, 600);
  }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  // convenience getter for easy access to form fields
  get formControls(): { [key: string]: AbstractControl; } {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    this.authService.loginWithEmailAndPassword(this.loginForm.value.email, this.loginForm.value.password)
      .catch((err): void => {
        this.snackbarService.openLongSnackBar(err);
      })
      .finally((): void => {
        this.loading = false;
      });
  }

  protected getErrorMessage(formControlName: string): string {
    if (this.formControls[formControlName].hasError('required')) {
      return this.translateService.get('login.validation.mandatoryField');
    }

    return this.formControls[formControlName].hasError('email')
      ? this.translateService.get('login.validation.invalidEmail')
      : '';
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

    this.authService.loginWithGoogleSso()
      .catch((err): void => {
        this.snackbarService.openLongSnackBar(err);
      })
      .finally((): void => {
        this.loading = false;
      });
  }

}
