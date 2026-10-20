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
import {DialogService} from '../_services/util/dialog.service';
import {DialogType} from '../_models/dialog/dialog-type';
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
import {StorageService} from '../_services/storage/storage.service';
import {VaultService} from '../_services/security/vault.service';
import {PinDialogComponent} from '../_shared-components/pin-dialog/pin-dialog.component';
import {RawInspectorDialogComponent} from '../_shared-components/raw-inspector-dialog/raw-inspector-dialog.component';
import {RecoveryKeyDialogComponent} from '../_shared-components/recovery-key-dialog/recovery-key-dialog.component';
import {WarehouseDbService} from '../_database/warehouse/warehouse.service';
import {VaultMetaDbService} from '../_database/security/vault-meta-db.service';

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
  readonly allowedImageAccept = StorageService.ALLOWED_IMAGE_ACCEPT;

  readonly userFormComponent = viewChild(UserFormComponent);

  private readonly authService = inject(AuthService);
  private readonly userDbService = inject(UserDbService);
  private readonly snackbarService = inject(SnackbarService);
  private readonly translateService = inject(CustomTranslateService);
  private readonly dialog = inject(MatDialog);
  private readonly dialogService = inject(DialogService);
  private readonly facade = inject(PublicSettingsFacade);
  private readonly storageService = inject(StorageService);
  private readonly vaultService = inject(VaultService);
  private readonly warehouseDb = inject(WarehouseDbService);
  private readonly vaultMetaDb = inject(VaultMetaDbService);

  readonly user = this.authService.currentUser;
  readonly isLoading = this.authService.isLoading;
  readonly allowForProfilePictureChange = this.facade.allowForProfilePictureChange;

  readonly vaultStatus = this.vaultService.status;
  readonly isVaultUnlocked = this.vaultService.isUnlocked;
  readonly hasVaultPin = this.vaultService.hasPin;

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

  async onFileSelected(event: Event): Promise<void> {
    const currentUser = this.user();
    if (!currentUser) {
      return;
    }

    const file = this.storageService.extractAndValidateFile(event);
    if (!file) {
      return;
    }

    const input = event.target as HTMLInputElement;
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
    input.value = '';
    if (photoUrl && currentUser) {
      this.authService.updateLocalUser({ photoUrl });
    }
  }

  async onRemovePhoto(): Promise<void> {
    const currentUser = this.user();
    if (!currentUser || !currentUser.photoUrl) return;

    const dialogRef = this.dialogService.openConfirmDialogWithData({
      title: this.translateService.get('profile.photo.removeConfirmTitle'),
      popupType: DialogType.WARNING,
      message: this.translateService.get('profile.photo.removeConfirmMessage'),
      cancelButtonText: this.translateService.get('dialog.cancel'),
      confirmButtonText: this.translateService.get('registeredUsers.details.confirm'),
      icon: 'delete_outline',
      iconColor: 'warn'
    });

    const confirmed = await firstValueFrom(dialogRef.afterClosed());
    if (!confirmed) return;

    try {
      this.isLoading.set(true);
      await this.userDbService.update(currentUser.id, { photoUrl: null });
      this.authService.updateLocalUser({ photoUrl: null });
      this.snackbarService.openSnackBar(this.translateService.get('profile.photo.removeSuccess'));
    } catch (error) {
      console.error('Failed to remove profile picture', error);
      this.snackbarService.openLongSnackBar(this.translateService.get('profile.photo.removeError'));
    } finally {
      this.isLoading.set(false);
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

  openSetPinDialog(): void {
    this.dialog.open(PinDialogComponent, {
      width: '400px',
      data: { mode: 'SET' }
    });
  }

  openUnlockPinDialog(): void {
    this.dialog.open(PinDialogComponent, {
      width: '400px',
      data: { mode: 'UNLOCK' }
    });
  }

  openRawInspectorDialog(): void {
    this.dialog.open(RawInspectorDialogComponent, {
      width: '600px',
      maxWidth: '92vw'
    });
  }

  onLockVault(): void {
    this.vaultService.lockVault();
    this.snackbarService.openSnackBar(this.translateService.get('vault.lockedState.title'));
  }

  async onResetAllVaultAndWarehouseData(): Promise<void> {
    const dialogRef = this.dialogService.openConfirmDialogWithData({
      title: this.translateService.get('vault.resetAll.confirmTitle'),
      popupType: DialogType.WARNING,
      message: this.translateService.get('vault.resetAll.confirmMessage'),
      cancelButtonText: this.translateService.get('wh.button.cancel'),
      confirmButtonText: this.translateService.get('vault.resetAll.confirmButton'),
      icon: 'delete_forever',
      iconColor: 'warn'
    });

    const confirmed = await firstValueFrom(dialogRef.afterClosed());
    if (!confirmed) return;

    const currentUser = this.user();
    if (!currentUser?.uid) return;

    try {
      this.isLoading.set(true);
      await this.warehouseDb.delete(currentUser.uid);
      await this.vaultMetaDb.deleteMetadata(currentUser.uid);
      this.vaultService.clearSession();
      this.vaultService.initForUser(currentUser.uid);
      this.snackbarService.openSnackBar(this.translateService.get('vault.resetAll.success'));
    } catch (error) {
      console.error('Failed to reset all vault and warehouse data', error);
      this.snackbarService.openLongSnackBar(this.translateService.get('login.error.internal'));
    } finally {
      this.isLoading.set(false);
    }
  }

  async openRecoveryKeyDialog(): Promise<void> {
    if (!this.vaultService.isUnlocked()) {
      const unlocked = await firstValueFrom(
        this.dialog.open(PinDialogComponent, {
          width: '400px',
          data: { mode: 'UNLOCK' }
        }).afterClosed()
      );
      if (!unlocked) return;
    }

    try {
      const recoveryKey = await this.vaultService.refreshRecoveryKey();
      this.dialog.open(RecoveryKeyDialogComponent, {
        width: '500px',
        maxWidth: '92vw',
        data: { recoveryKey }
      });
    } catch (err: any) {
      this.snackbarService.openLongSnackBar(err?.message || this.translateService.get('login.error.internal'));
    }
  }
}


