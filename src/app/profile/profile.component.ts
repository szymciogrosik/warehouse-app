import {ChangeDetectionStrategy, Component, inject, viewChild} from '@angular/core';
import {UserFormComponent} from '../_shared-components/user-form/user-form.component';
import {AuthService} from '../_services/auth/auth.service';
import {SnackbarService} from '../_services/util/snackbar.service';
import {CustomTranslateService} from '../_services/translate/custom-translate.service';
import {UserDbService} from '../_database/auth/user-db-service.service';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {ChangePasswordDialogComponent} from './change-password-dialog/change-password-dialog.component';

import {ImageCropperData, ImageCropperDialogComponent} from './image-cropper-dialog/image-cropper-dialog.component';
import {ImagePreviewData, ImagePreviewDialogComponent} from './image-preview-dialog/image-preview-dialog.component';
import {PublicSettingsFacade} from '../_database/settings/public-settings.facade';
import {TranslatePipe} from '@ngx-translate/core';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatIconModule} from '@angular/material/icon';

import {MatTooltipModule} from '@angular/material/tooltip';
import {SkeletonComponent} from '../_shared-components/skeleton/skeleton.component';
import {firstValueFrom} from 'rxjs';
import {MatTabsModule} from '@angular/material/tabs';
import {select_roles} from '../_models/registration/select/select-roles';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    UserFormComponent,
    TranslatePipe,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDialogModule,
    MatTooltipModule,
    SkeletonComponent,
    MatTabsModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent {
  readonly userFormComponent = viewChild(UserFormComponent);

  private readonly authService = inject(AuthService);
  private readonly userDbService = inject(UserDbService);
  private readonly snackbarService = inject(SnackbarService);
  private readonly translateService = inject(CustomTranslateService);
  private readonly dialog = inject(MatDialog);
  private readonly facade = inject(PublicSettingsFacade);

  readonly user = this.authService.currentUser;
  readonly isLoading = this.authService.isLoading;
  readonly allowForProfilePictureChange = this.facade.allowForProfilePictureChange;

  get currentUserRoles() {
    const roles = this.user()?.roles || [];
    return roles.map(r => select_roles.find(sr => sr.value === r)).filter(r => r !== undefined);
  }

  openChangePasswordDialog(): void {
    // Open the change password dialog
    this.dialog.open(ChangePasswordDialogComponent, {
      width: '450px'
    });
  }

  async onFileSelected(event: any): Promise<void> {
    const currentUser = this.user();
    if (event.target.files && event.target.files.length > 0 && currentUser) {
      const dialogRef = this.dialog.open(ImageCropperDialogComponent, {
        width: '600px',
        data: {
          imageChangedEvent: event,
          authUserUid: currentUser.uid,
          userDocId: currentUser.id
        } as ImageCropperData
      });

      const photoUrl = await firstValueFrom(dialogRef.afterClosed());
      // Clear input to allow re-selection of the same file
      event.target.value = null;
      if (photoUrl && currentUser) {
        this.authService.updateLocalUser({ photoUrl });
      }
    }
  }

  openPreviewDialog(imageUrl: string): void {
    this.dialog.open(ImagePreviewDialogComponent, {
      panelClass: 'image-preview-dialog-panel',
      data: {
        imageUrl: imageUrl
      } as ImagePreviewData
    });
  }

  async onFormSubmit(payload: any): Promise<void> {
    const currentUser = this.user();
    if (!currentUser) return;

    try {
      this.isLoading.set(true);
      await this.userDbService.update(currentUser.id, {
        firstName: payload.firstName,
        lastName: payload.lastName
      });

      this.authService.updateLocalUser({
        firstName: payload.firstName,
        lastName: payload.lastName
      });

      this.snackbarService.openSnackBar(this.translateService.get('profile.success.update'));
    } catch (error) {
      console.error('Failed to update user', error);
      this.snackbarService.openLongSnackBar(this.translateService.get('profile.error.update'));
    } finally {
      this.isLoading.set(false);
    }
  }

}

