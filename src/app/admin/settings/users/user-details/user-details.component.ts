import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {AbstractControl, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {UserDetailsPopupData} from "../../../../_models/dialog/user-details/user-details-popup-data";
import {UserDetailsType} from "../../../../_models/dialog/user-details/user-details-type";
import {AccessRole} from "../../../../_models/user/access-role";
import {CustomTranslateService} from "../../../../_services/translate/custom-translate.service";
import {CustomValidators} from "../../../../_services/validator/custom-validators";
import {CustomCommonModule} from "../../../../_imports/CustomCommon.module";

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.scss',
  standalone: true,
  imports: [CustomCommonModule],
})
export class UserDetailsComponent implements OnInit {
  @ViewChild('submitBtn') submitBtn: ElementRef;
  protected readonly UserDetailsType = UserDetailsType;
  protected userForm: FormGroup;
  protected hidePassword: boolean = true;
  protected accessRoleValues: AccessRole[] = Object.values(AccessRole);

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<UserDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserDetailsPopupData,
    private translateService: CustomTranslateService,
  ) { }

  ngOnInit(): void {
    this.userForm = this.formBuilder.group({
      email: [{ value: this.data.user.email, disabled: this.data.userDetailsType !== UserDetailsType.CREATE }, [Validators.required, Validators.email]],
      firstName: [this.data.user.firstName, [Validators.required]],
      lastName: [this.data.user.lastName, [Validators.required]],
      roles: [this.data.user.roles],
    });

    if (this.data.userDetailsType === UserDetailsType.CREATE) {
      this.userForm.addControl(
        'password',
        this.formBuilder.control('', [Validators.required, Validators.minLength(6), CustomValidators.passwordValidator]));
    }
  }

  protected onCancelClick(): void {
    this.dialogRef.close(null);
  }

  protected onApproveClick(): void {
    this.submitBtn.nativeElement.click();
  }

  protected onSubmit(): void {
    if (this.userForm.invalid) {
      return;
    }
    if (this.data.userDetailsType === UserDetailsType.CREATE) {
      // Putting password in id place, because there are no dedicated place for it
      this.userForm.value.id = this.userForm.value.password;
      this.dialogRef.close(this.userForm.value);
    } else if (this.data.userDetailsType === UserDetailsType.UPDATE) {
      this.userForm.value.id = this.data.user.id;
      this.userForm.value.uid = this.data.user.uid;
      this.dialogRef.close(this.userForm.value);
    } else {
      throw new Error("DetailsType " + this.data.userDetailsType + " is unsupported");
    }
  }

  getErrorMessage(formControlName: string): string {
    const control = this.formControls[formControlName];
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

  // convenience getter for easy access to form fields
  get formControls(): { [key: string]: AbstractControl; } {
    return this.userForm.controls;
  }

}
