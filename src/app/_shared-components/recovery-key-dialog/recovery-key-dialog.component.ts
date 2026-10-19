import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {SnackbarService} from '../../_services/util/snackbar.service';
import {CustomTranslateService} from '../../_services/translate/custom-translate.service';

export interface RecoveryKeyDialogData {
  recoveryKey: string;
}

@Component({
  selector: 'app-recovery-key-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    TranslatePipe
  ],
  templateUrl: './recovery-key-dialog.component.html',
  styleUrls: ['./recovery-key-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecoveryKeyDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<RecoveryKeyDialogComponent>);
  public readonly data = inject<RecoveryKeyDialogData>(MAT_DIALOG_DATA);
  private readonly snackbar = inject(SnackbarService);
  private readonly translate = inject(CustomTranslateService);

  readonly recoveryKey = signal<string>(this.data?.recoveryKey || '');

  copyToClipboard(): void {
    if (!this.recoveryKey()) return;
    navigator.clipboard.writeText(this.recoveryKey());
    this.snackbar.openSnackBar(this.translate.get('vault.recovery.copied'));
  }

  downloadKeyFile(): void {
    if (!this.recoveryKey()) return;
    const content = `=========================================================\n` +
      `WAREHOUSE APP - ZERO-KNOWLEDGE EMERGENCY RECOVERY KEY\n` +
      `=========================================================\n\n` +
      `Your Recovery Key:\n${this.recoveryKey()}\n\n` +
      `Generated: ${new Date().toISOString()}\n\n` +
      `IMPORTANT:\n` +
      `- Keep this file secure (e.g. in a safe location or password manager).\n` +
      `- The application administrators do NOT have this key.\n` +
      `- If you forget your password or PIN, this key is required to restore your vault.\n`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `warehouse-recovery-key-${Date.now()}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
    this.snackbar.openSnackBar(this.translate.get('vault.recovery.downloadSuccess'));
  }

  close(): void {
    this.dialogRef.close();
  }
}
