import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {CustomUser} from "../../_models/user/custom-user";
import {AccessRole} from "../../_models/user/access-role";
import {CustomTranslateService} from "../../_services/translate/custom-translate.service";
import {CustomValidators} from "../../_services/validator/custom-validators";
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatDialogModule} from '@angular/material/dialog';
import {MatSelectModule} from '@angular/material/select';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, TranslateModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatDialogModule, MatSelectModule],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {
  @Input() user: CustomUser | null = null;
  @Input() showPassword = false;
  @Input() showRoles = true;
  @Input() disableEmail = false;

  @Output() formSubmit = new EventEmitter<any>();

  @ViewChild('submitBtn') submitBtn!: ElementRef;

  userForm!: FormGroup;
  hidePassword = true;
  accessRoleValues: AccessRole[] = Object.values(AccessRole);

  constructor(
    private formBuilder: FormBuilder,
    private translateService: CustomTranslateService,
  ) {
  }

  ngOnInit(): void {
    const defaultRoles = this.user?.roles || [];

    this.userForm = this.formBuilder.group({
      email: [{value: this.user?.email || '', disabled: this.disableEmail}, [Validators.required, Validators.email]],
      firstName: [this.user?.firstName || '', [Validators.required]],
      lastName: [this.user?.lastName || '', [Validators.required]],
    });

    if (this.showRoles) {
      this.userForm.addControl('roles', this.formBuilder.control(defaultRoles));
    }

    if (this.showPassword) {
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

    if (this.user) {
      payload.id = this.user.id;
      payload.uid = this.user.uid;
    }

    // We no longer hack the password into payload.id; it stays as payload.password.
    this.formSubmit.emit(payload);
  }

  onSubmit(): void {
    this.submitForm();
  }

  triggerSubmit(): void {
    this.submitBtn.nativeElement.click();
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
