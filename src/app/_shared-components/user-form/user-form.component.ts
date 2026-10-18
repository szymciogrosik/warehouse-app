import {ChangeDetectionStrategy, Component, effect, ElementRef, inject, input, OnInit, output, viewChild} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CustomUser} from '../../_models/user/custom-user';
import {AccessRole} from '../../_models/user/access-role';
import {select_roles} from '../../_models/registration/select/select-roles';
import {CustomTranslateService} from '../../_services/translate/custom-translate.service';
import {CustomValidators} from '../../_services/validator/custom-validators';
import {TranslatePipe} from '@ngx-translate/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatDialogModule} from '@angular/material/dialog';
import {MatSelectModule} from '@angular/material/select';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    TranslatePipe,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatSelectModule
  ],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserFormComponent implements OnInit {
  readonly user = input<CustomUser | null>(null);
  readonly showPassword = input<boolean>(false);
  readonly showRoles = input<boolean>(true);
  readonly disableEmail = input<boolean>(false);

  readonly formSubmit = output<any>();
  readonly submitBtn = viewChild<ElementRef>('submitBtn');

  userForm!: FormGroup;
  hidePassword = true;
  readonly selectRoles = select_roles;

  private readonly formBuilder = inject(FormBuilder);
  private readonly translateService = inject(CustomTranslateService);

  constructor() {
    effect(() => {
      const user = this.user();
      if (user && this.userForm) {
        this.userForm.patchValue({
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.roles || []
        }, { emitEvent: false });
      }
    });
  }

  ngOnInit(): void {
    this.createForm();
  }

  private createForm(): void {
    const userVal = this.user();
    this.userForm = this.formBuilder.group({
      email: [{value: userVal?.email || '', disabled: this.disableEmail()}, [Validators.required, Validators.email]],
      firstName: [userVal?.firstName || '', [Validators.required]],
      lastName: [userVal?.lastName || '', [Validators.required]],
    });

    if (this.showRoles()) {
      this.userForm.addControl('roles', this.formBuilder.control(userVal?.roles || []));
    }

    if (this.showPassword()) {
      this.userForm.addControl(
        'password',
        this.formBuilder.control('', [Validators.required, Validators.minLength(6), CustomValidators.passwordValidator])
      );
    }
  }

  submitForm(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const payload = {...this.userForm.getRawValue()};
    if (payload.email) {
      payload.email = payload.email.trim();
    }

    const userVal = this.user();
    if (userVal) {
      payload.id = userVal.id;
      payload.uid = userVal.uid;
    }

    // We no longer hack the password into payload.id; it stays as payload.password.
    this.formSubmit.emit(payload);
  }

  onSubmit(): void {
    this.submitForm();
  }

  triggerSubmit(): void {
    this.submitBtn()?.nativeElement.click();
  }

  getErrorMessage(formControlName: string): string {
    const control = this.formControls[formControlName];
    if (!control) return '';

    if (control.hasError('required')) {
      return this.translateService.get('registration.validation.mandatoryField');
    }
    if (control.hasError('email')) {
      return this.translateService.get('registration.validation.invalidEmail');
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

  get formControls(): { [key: string]: AbstractControl; } {
    return this.userForm.controls;
  }
}

