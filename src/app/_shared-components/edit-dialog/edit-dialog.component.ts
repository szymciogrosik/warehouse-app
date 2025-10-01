import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CustomCommonModule} from '../../_imports/CustomCommon.module';
import {AutoResizeDirective} from "../auto-resize-directive.directive";
import {EditDialogData} from "../../_models/dialog/warehouse/edit-dialog-data";
import {EditDialogType} from "../../_models/dialog/warehouse/edit-dialog-type";

@Component({
  selector: 'edit-dialog',
  standalone: true,
  templateUrl: './edit-dialog.component.html',
  styleUrls: ['./edit-dialog.component.scss'],
  imports: [
    CustomCommonModule,
    ReactiveFormsModule,
    AutoResizeDirective
  ]
})
export class EditDialogComponent implements OnInit {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditDialogData
  ) {
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [this.data.name || '', Validators.required],
      description: [this.data.description || '']
    });

    if (this.data.editType === EditDialogType.ITEM) {
      this.form.addControl('targetBoxIndex', this.fb.control(this.data.selectedBoxIndex));
    }
    if (this.data.editType === EditDialogType.BOX) {
      this.form.addControl('targetRoomIndex', this.fb.control(this.data.selectedRoomIndex));
    }
  }

  save(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  get title(): string {
    return this.data.title;
  }

  protected readonly EditDialogType = EditDialogType;
}
