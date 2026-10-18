import {ChangeDetectionStrategy, Component, inject, viewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef, MatDialogModule} from '@angular/material/dialog';
import {UserDetailsPopupData} from '../../../../../_models/dialog/user-details/user-details-popup-data';
import {UserDetailsType} from '../../../../../_models/dialog/user-details/user-details-type';
import {CustomTranslateService} from '../../../../../_services/translate/custom-translate.service';
import {UserFormComponent} from '../../../../../_shared-components/user-form/user-form.component';
import {AuthService} from '../../../../../_services/auth/auth.service';
import {SnackbarService} from '../../../../../_services/util/snackbar.service';
import {TranslatePipe} from '@ngx-translate/core';
import {MatButtonModule} from '@angular/material/button';
import {DialogService} from '../../../../../_services/util/dialog.service';
import {DialogType} from '../../../../../_models/dialog/dialog-type';
import {firstValueFrom} from 'rxjs';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.scss',
  standalone: true,
  imports: [UserFormComponent, TranslatePipe, MatButtonModule, MatDialogModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserDetailsComponent {
  readonly userFormComponent = viewChild(UserFormComponent);
  protected readonly UserDetailsType = UserDetailsType;

  public dialogRef = inject<MatDialogRef<UserDetailsComponent>>(MatDialogRef);
  public data = inject<UserDetailsPopupData>(MAT_DIALOG_DATA);
  private translateService = inject(CustomTranslateService);
  private authService = inject(AuthService);
  private snackbarService = inject(SnackbarService);
  private dialogService = inject(DialogService);

  protected onCancelClick(): void {
    this.dialogRef.close(null);
  }

  protected onApproveClick(): void {
    this.userFormComponent()?.triggerSubmit();
  }

  protected onFormSubmit(payload: any): void {
    this.dialogRef.close(payload);
  }

  protected async onSendResetEmail(): Promise<void> {
    if (this.data.user && this.data.user.email) {
      const email = this.data.user.email;
      const message = `${this.translateService.get('admin.panel.users.sendResetEmail.confirmMessage')} ${email}?`;
      
      const confirmPopup = this.dialogService.openConfirmDialogWithData({
          title: this.translateService.get('admin.panel.users.sendResetEmail.confirmTitle'),
          popupType: null,
          icon: 'mail',
          iconColor: 'primary',
          message: message,
          cancelButtonText: this.translateService.get('registeredUsers.details.cancel'),
          confirmButtonText: this.translateService.get('registeredUsers.details.confirm')
      });

      const result = await firstValueFrom(confirmPopup.afterClosed());
      if (result) {
        this.authService.sendPasswordResetLink(email).then(() => {
          this.snackbarService.openSnackBar(this.translateService.get('admin.panel.users.sendResetEmail.success'));
        }).catch(err => {
          console.error(err);
          this.snackbarService.openLongSnackBar(this.translateService.get('login.error.internal'));
        });
      }
    }
  }

}

