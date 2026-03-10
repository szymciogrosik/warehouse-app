import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {UserDetailsPopupData} from "../../../../_models/dialog/user-details/user-details-popup-data";
import {UserDetailsType} from "../../../../_models/dialog/user-details/user-details-type";
import {CustomTranslateService} from "../../../../_services/translate/custom-translate.service";
import {UserFormComponent} from "../../../../_shared-components/user-form/user-form.component";
import {AuthService} from "../../../../_services/auth/auth.service";
import {SnackbarService} from "../../../../_services/util/snackbar.service";
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.scss',
  standalone: true,
  imports: [UserFormComponent, CommonModule, TranslateModule, MatButtonModule, MatDialogModule],
})
export class UserDetailsComponent implements OnInit {
  @ViewChild('userFormComponent') userFormComponent!: UserFormComponent;
  protected readonly UserDetailsType = UserDetailsType;

  constructor(
    public dialogRef: MatDialogRef<UserDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserDetailsPopupData,
    private translateService: CustomTranslateService,
    private authService: AuthService,
    private snackbarService: SnackbarService
  ) {
  }

  ngOnInit(): void {
  }

  protected onCancelClick(): void {
    this.dialogRef.close(null);
  }

  protected onApproveClick(): void {
    this.userFormComponent.triggerSubmit();
  }

  protected onFormSubmit(payload: any): void {
    this.dialogRef.close(payload);
  }

  protected onSendResetEmail(): void {
    if (this.data.user && this.data.user.email) {
      this.authService.sendPasswordResetLink(this.data.user.email).then(() => {
        this.snackbarService.openSnackBar(this.translateService.get('admin.panel.users.sendResetEmail.success'));
      }).catch(err => {
        console.error(err);
        this.snackbarService.openLongSnackBar(this.translateService.get('login.error.internal'));
      });
    }
  }

}
