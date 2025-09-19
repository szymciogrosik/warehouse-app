import { Component, Inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef} from '@angular/material/dialog';
import {CustomCommonModule} from "../../_imports/CustomCommon.module";

export interface EditDialogData {
  title: string;
  name: string;
  description: string;
}

@Component({
  selector: 'edit-dialog',
  standalone: true,
  templateUrl: './edit-dialog.component.html',
  styleUrls: ['./edit-dialog.component.scss'],
  imports: [
    CustomCommonModule,
    MatDialogContent,
    MatDialogActions
  ]
})
export class EditDialogComponent {
  title: string;
  name: string;
  description: string;

  constructor(
    public dialogRef: MatDialogRef<EditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditDialogData
  ) {
    this.title = data.title;
    this.name = data.name;
    this.description = data.description;
  }

  save(): void {
    this.dialogRef.close({ name: this.name, description: this.description });
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
