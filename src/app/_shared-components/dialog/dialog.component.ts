import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {DialogData} from "../../_models/dialog/dialog-data";
import {DialogType} from "../../_models/dialog/dialog-type";
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-confirmation',
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatDialogModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogComponent {

  public dialogRef = inject<MatDialogRef<DialogComponent>>(MatDialogRef);
  public data = inject<DialogData>(MAT_DIALOG_DATA);

  protected readonly DialogType = DialogType;

  protected onCancelClick(): void {
    this.dialogRef.close(false);
  }

  protected onApproveClick(): void {
    this.dialogRef.close(true);
  }

}
