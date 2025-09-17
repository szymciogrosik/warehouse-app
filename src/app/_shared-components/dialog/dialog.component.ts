import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {DialogData} from "../../_models/dialog/dialog-data";
import {DialogType} from "../../_models/dialog/dialog-type";
import {CustomCommonModule} from "../../_imports/CustomCommon.module";

@Component({
  selector: 'app-confirmation',
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
  standalone: true,
  imports: [CustomCommonModule],
})
export class DialogComponent {

  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  protected readonly DialogType = DialogType;

  protected onCancelClick(): void {
    this.dialogRef.close(false);
  }

  protected onApproveClick(): void {
    this.dialogRef.close(true);
  }

}
