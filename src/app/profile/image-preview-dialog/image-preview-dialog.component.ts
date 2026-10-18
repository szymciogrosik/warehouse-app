import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

export interface ImagePreviewData {
  imageUrl: string;
}

@Component({
  selector: 'app-image-preview-dialog',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './image-preview-dialog.component.html',
  styleUrls: ['./image-preview-dialog.component.scss']
})
export class ImagePreviewDialogComponent {
  public dialogRef = inject<MatDialogRef<ImagePreviewDialogComponent>>(MatDialogRef);
  public data = inject<ImagePreviewData>(MAT_DIALOG_DATA);

  onClose(): void {
    this.dialogRef.close();
  }
}
