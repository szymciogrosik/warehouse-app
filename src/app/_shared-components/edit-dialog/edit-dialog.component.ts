import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomCommonModule } from '../../_imports/CustomCommon.module';

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
    ReactiveFormsModule
  ]
})
export class EditDialogComponent implements OnInit {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditDialogData
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [this.data.name || '', Validators.required],
      description: [this.data.description || '']
    });
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
}
