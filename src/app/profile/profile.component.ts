import {Component, OnInit, ViewChild} from '@angular/core';
import {UserFormComponent} from '../_shared-components/user-form/user-form.component';
import {AuthService} from '../_services/auth/auth.service';
import {CustomUser} from '../_models/user/custom-user';
import {SnackbarService} from '../_services/util/snackbar.service';
import {CustomTranslateService} from '../_services/translate/custom-translate.service';
import {UserDbService} from '../_database/auth/user-db-service.service';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {ChangePasswordDialogComponent} from './change-password-dialog/change-password-dialog.component';

import {ImageCropperData, ImageCropperDialogComponent} from './image-cropper-dialog/image-cropper-dialog.component';
import {ImagePreviewData, ImagePreviewDialogComponent} from './image-preview-dialog/image-preview-dialog.component';
import {PublicSettingsService} from '../_database/settings/public-settings.service';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatIconModule} from '@angular/material/icon';

import {MatTooltipModule} from '@angular/material/tooltip';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    UserFormComponent,
    CommonModule,
    TranslateModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDialogModule,
    MatTooltipModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  @ViewChild('userFormComponent') userFormComponent!: UserFormComponent;
  user: CustomUser | null = null;
  isLoading = true;
  allowForProfilePictureChange = false;

  constructor(
    private authService: AuthService,
    private userDbService: UserDbService,
    private snackbarService: SnackbarService,
    private translateService: CustomTranslateService,
    private dialog: MatDialog,
    private publicSettingsService: PublicSettingsService
  ) {
  }

  async ngOnInit(): Promise<void> {
    try {
      this.user = await this.authService.loggedUserPromise();
      this.publicSettingsService.getDocument('general').subscribe({
        next: data => {
          if (data && data.allowForProfilePictureChange !== undefined) {
            this.allowForProfilePictureChange = data.allowForProfilePictureChange;
          } else {
            this.allowForProfilePictureChange = false;
          }
        },
        error: err => console.error('Failed to load public settings', err)
      });
    } catch (error) {
      console.error('Failed to load user', error);
      this.snackbarService.openLongSnackBar(this.translateService.get('profile.error.load'));
    } finally {
      this.isLoading = false;
    }
  }

  openChangePasswordDialog(): void {
    // Open the change password dialog
    this.dialog.open(ChangePasswordDialogComponent, {
      width: '450px'
    });
  }

  onFileSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0 && this.user) {
      const dialogRef = this.dialog.open(ImageCropperDialogComponent, {
        width: '600px',
        data: {
          imageChangedEvent: event,
          authUserUid: this.user.uid,
          userDocId: this.user.id
        } as ImageCropperData
      });

      dialogRef.afterClosed().subscribe((photoUrl: string | null) => {
        // Clear input to allow re-selection of the same file
        event.target.value = null;
        if (photoUrl && this.user) {
          this.user.photoUrl = photoUrl;
        }
      });
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
    if (!this.user) return;

    try {
      this.isLoading = true;
      await this.userDbService.update(this.user.id, {
        firstName: payload.firstName,
        lastName: payload.lastName
      });
      // Optionally update local context if needed, but standard auth stream might catch it
      this.user.firstName = payload.firstName;
      this.user.lastName = payload.lastName;

      this.snackbarService.openSnackBar(this.translateService.get('profile.success.update'));
    } catch (error) {
      console.error('Failed to update user', error);
      this.snackbarService.openLongSnackBar(this.translateService.get('profile.error.update'));
    } finally {
      this.isLoading = false;
    }
  }

}
