import {ChangeDetectionStrategy, Component, HostListener, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {VaultService} from '../../_services/security/vault.service';
import {SnackbarService} from '../../_services/util/snackbar.service';
import {CustomTranslateService} from '../../_services/translate/custom-translate.service';
import {FormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';

export type PinDialogMode = 'UNLOCK' | 'SET' | 'RECOVERY';

export interface PinDialogData {
  mode?: PinDialogMode;
}

@Component({
  selector: 'app-pin-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    TranslatePipe,
    FormsModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './pin-dialog.component.html',
  styleUrls: ['./pin-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PinDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<PinDialogComponent>);
  public readonly data = inject<PinDialogData>(MAT_DIALOG_DATA, { optional: true }) ?? { mode: 'UNLOCK' };
  private readonly vaultService = inject(VaultService);
  private readonly snackbar = inject(SnackbarService);
  private readonly translate = inject(CustomTranslateService);

  readonly mode = signal<PinDialogMode>(this.data.mode || 'UNLOCK');
  readonly pin = signal<string>('');
  readonly confirmPin = signal<string>('');
  readonly isConfirmingStep = signal<boolean>(false);
  readonly recoveryKeyInput = signal<string>('');
  readonly errorMessage = signal<string>('');
  readonly isBusy = signal<boolean>(false);

  readonly digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'backspace'];

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (this.mode() === 'RECOVERY') {
      return;
    }
    if (event.key >= '0' && event.key <= '9') {
      this.onDigitClick(event.key);
    } else if (event.key === 'Backspace') {
      this.onBackspace();
    }
  }

  onDigitClick(digit: string): void {
    if (this.isBusy()) return;
    this.errorMessage.set('');

    if (this.mode() === 'SET' && this.isConfirmingStep()) {
      if (this.confirmPin().length < 4) {
        const next = this.confirmPin() + digit;
        this.confirmPin.set(next);
        if (next.length === 4) {
          this.executeSetPin();
        }
      }
      return;
    }

    if (this.pin().length < 4) {
      const next = this.pin() + digit;
      this.pin.set(next);
      if (next.length === 4) {
        if (this.mode() === 'UNLOCK') {
          this.executeUnlock();
        } else if (this.mode() === 'SET') {
          this.isConfirmingStep.set(true);
        }
      }
    }
  }

  onBackspace(): void {
    if (this.isBusy()) return;
    this.errorMessage.set('');

    if (this.mode() === 'SET' && this.isConfirmingStep()) {
      if (this.confirmPin().length > 0) {
        this.confirmPin.set(this.confirmPin().slice(0, -1));
      } else {
        this.isConfirmingStep.set(false);
        this.pin.set('');
      }
      return;
    }

    if (this.pin().length > 0) {
      this.pin.set(this.pin().slice(0, -1));
    }
  }

  onClear(): void {
    if (this.isBusy()) return;
    this.pin.set('');
    this.confirmPin.set('');
    this.isConfirmingStep.set(false);
    this.errorMessage.set('');
  }

  async executeUnlock(): Promise<void> {
    this.isBusy.set(true);
    const pinVal = this.pin();
    try {
      const success = await this.vaultService.unlockWithPin(pinVal);
      if (success) {
        this.snackbar.openSnackBar(this.translate.get('vault.pinDialog.unlockedSuccess'));
        this.dialogRef.close(true);
      } else {
        this.errorMessage.set(this.translate.get('vault.pinDialog.invalidPin'));
        this.pin.set('');
      }
    } catch {
      this.errorMessage.set(this.translate.get('vault.pinDialog.invalidPin'));
      this.pin.set('');
    } finally {
      this.isBusy.set(false);
    }
  }

  async executeSetPin(): Promise<void> {
    if (this.pin() !== this.confirmPin()) {
      this.errorMessage.set(this.translate.get('vault.pinDialog.mismatchPin'));
      this.confirmPin.set('');
      this.pin.set('');
      this.isConfirmingStep.set(false);
      return;
    }

    this.isBusy.set(true);
    try {
      if (!this.vaultService.isConfigured()) {
        await this.vaultService.setupVaultWithPinOnly(this.pin());
      } else {
        await this.vaultService.setPin(this.pin());
      }
      this.snackbar.openSnackBar(this.translate.get('vault.pinDialog.pinSetSuccess'));
      this.dialogRef.close(true);
    } catch (err: any) {
      this.errorMessage.set(err?.message || this.translate.get('login.error.internal'));
      this.onClear();
    } finally {
      this.isBusy.set(false);
    }
  }

  switchToRecovery(): void {
    this.mode.set('RECOVERY');
    this.errorMessage.set('');
  }

  switchToPin(): void {
    this.mode.set(this.data.mode || 'UNLOCK');
    this.onClear();
  }

  async executeRecoveryUnlock(): Promise<void> {
    const key = this.recoveryKeyInput().trim();
    if (!key) return;

    this.isBusy.set(true);
    this.errorMessage.set('');
    try {
      const success = await this.vaultService.unlockWithRecoveryKey(key);
      if (success) {
        this.snackbar.openSnackBar(this.translate.get('vault.pinDialog.unlockedSuccess'));
        this.dialogRef.close(true);
      } else {
        this.errorMessage.set(this.translate.get('vault.pinDialog.invalidRecovery'));
      }
    } catch {
      this.errorMessage.set(this.translate.get('vault.pinDialog.invalidRecovery'));
    } finally {
      this.isBusy.set(false);
    }
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
