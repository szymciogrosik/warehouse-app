import {DialogType} from "./dialog-type";

export interface DialogData {
  readonly title: string;
  readonly popupType: DialogType | null;
  readonly message: string;
  readonly cancelButtonText: string | null;
  readonly confirmButtonText: string;
  readonly icon?: string;
  readonly iconColor?: 'primary' | 'accent' | 'warn';
  readonly iconSize?: string;
}
