import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {VaultService} from '../../_services/security/vault.service';
import {AuthService} from '../../_services/auth/auth.service';
import {SkeletonComponent} from '../skeleton/skeleton.component';

@Component({
  selector: 'app-raw-inspector-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    TranslatePipe,
    SkeletonComponent
  ],
  templateUrl: './raw-inspector-dialog.component.html',
  styleUrls: ['./raw-inspector-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RawInspectorDialogComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<RawInspectorDialogComponent>);
  private readonly vaultService = inject(VaultService);
  private readonly authService = inject(AuthService);

  readonly isLoading = signal<boolean>(true);
  readonly rawJson = signal<string>('');
  readonly isEncrypted = signal<boolean>(false);

  async ngOnInit(): Promise<void> {
    const user = this.authService.currentUser();
    if (!user) {
      this.isLoading.set(false);
      return;
    }

    try {
      const data = await this.vaultService.getRawServerDocument(user.uid);
      if (data) {
        this.rawJson.set(JSON.stringify(data, null, 2));
        this.isEncrypted.set(data['isEncrypted'] === true);
      } else {
        this.rawJson.set('// No warehouse data document found on server yet.');
      }
    } catch (err: any) {
      this.rawJson.set('// Error retrieving server document: ' + (err?.message || err));
    } finally {
      this.isLoading.set(false);
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
