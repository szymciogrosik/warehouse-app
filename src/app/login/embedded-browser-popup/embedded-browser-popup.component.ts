import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {EmbeddedBrowserWarningData} from "../../_models/dialog/embedded-browser-warning/embedded-browser-warning-data";
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-embedded-browser-popup',
  templateUrl: './embedded-browser-popup.component.html',
  styleUrl: './embedded-browser-popup.component.scss',
  standalone: true,
  imports: [CommonModule, TranslateModule, MatButtonModule, MatIconModule, MatDialogModule],
})
export class EmbeddedBrowserPopupComponent {
  constructor(
    public dialogRef: MatDialogRef<EmbeddedBrowserPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EmbeddedBrowserWarningData
  ) {
  }

  protected onCancelClick(): void {
    this.dialogRef.close(false);
  }

  protected onApproveClick(): void {
    this.dialogRef.close(true);
  }

}
