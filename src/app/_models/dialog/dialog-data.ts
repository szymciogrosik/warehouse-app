import {DialogType} from "./dialog-type";

export class DialogData {
  title: string;
  popupType: DialogType | null;
  message: string;
  cancelButtonText: string | null;
  confirmButtonText: string;

  constructor(
    title: string,
    popupType: DialogType | null,
    message: string,
    cancelButtonText: string | null,
    confirmButtonText: string
  ) {
    this.title = title;
    this.popupType = popupType;
    this.message = message;
    this.cancelButtonText = cancelButtonText;
    this.confirmButtonText = confirmButtonText;
  }

}
