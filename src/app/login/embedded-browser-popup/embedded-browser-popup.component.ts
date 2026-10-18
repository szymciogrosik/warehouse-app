import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {EmbeddedBrowserWarningData} from "../../_models/dialog/embedded-browser-warning/embedded-browser-warning-data";
import {TranslatePipe} from '@ngx-translate/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-embedded-browser-popup',
  templateUrl: './embedded-browser-popup.component.html',
  styleUrl: './embedded-browser-popup.component.scss',
  standalone: true,
  imports: [TranslatePipe, MatButtonModule, MatIconModule, MatDialogModule],
})
export class EmbeddedBrowserPopupComponent {
  public dialogRef = inject<MatDialogRef<EmbeddedBrowserPopupComponent>>(MatDialogRef);
  public data = inject<EmbeddedBrowserWarningData>(MAT_DIALOG_DATA);

  protected onCancelClick(): void {
    this.dialogRef.close(false);
  }

  protected onApproveClick(): void {
    this.dialogRef.close(true);
  }

}

