import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {ImageCroppedEvent, ImageCropperComponent} from 'ngx-image-cropper';
import {StorageService} from '../../_services/storage/storage.service';
import {UserDbService} from '../../_database/auth/user-db-service.service';
import {SnackbarService} from '../../_services/util/snackbar.service';
import {CustomTranslateService} from '../../_services/translate/custom-translate.service';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

export interface ImageCropperData {
  imageChangedEvent: Event;
  authUserUid: string;
  userDocId: string;
}

@Component({
  selector: 'app-image-cropper-dialog',
  standalone: true,
  imports: [ImageCropperComponent, CommonModule, TranslateModule, MatButtonModule, MatProgressSpinnerModule, MatDialogModule],
  templateUrl: './image-cropper-dialog.component.html',
  styleUrls: ['./image-cropper-dialog.component.scss']
})
export class ImageCropperDialogComponent {
  croppedImageBlob: Blob | null | undefined = null;
  isSaving = false;

  constructor(
    public dialogRef: MatDialogRef<ImageCropperDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ImageCropperData,
    private storageService: StorageService,
    private userDbService: UserDbService,
    private snackbarService: SnackbarService,
    private translateService: CustomTranslateService
  ) {
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImageBlob = event.blob;
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  async onSave(): Promise<void> {
    if (!this.croppedImageBlob) return;
    this.isSaving = true;

    try {
      // 1. Upload to Firebase Storage
      const path = `users/${this.data.authUserUid}/profile.webp`;
      const photoUrl = await this.storageService.uploadFile(path, this.croppedImageBlob);

      // 2. Update Firestore User Document
      await this.userDbService.update(this.data.userDocId, {photoUrl});

      // 3. Inform the user and close dialog returns the photoUrl
      this.snackbarService.openSnackBar(this.translateService.get('profile.cropper.success'));
      this.dialogRef.close(photoUrl);

    } catch (error) {
      console.error('Failed to save profile picture', error);
      this.snackbarService.openLongSnackBar(this.translateService.get('profile.cropper.error'));
    } finally {
      this.isSaving = false;
    }
  }
}
