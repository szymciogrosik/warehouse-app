import {Injectable, inject} from '@angular/core';
import {DialogComponent} from "../../_shared-components/dialog/dialog.component";
import {DialogData} from "../../_models/dialog/dialog-data";
import {MatDialog} from "@angular/material/dialog";
import {CustomTranslateService} from "../translate/custom-translate.service";

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  private dialog = inject(MatDialog);
  private translateService = inject(CustomTranslateService);
  
  constructor() {}

  public openConfirmDialog(messageKey: string) {
    return this.dialog.open(
      DialogComponent,
      {
        maxWidth: '600px',
        width: '400px',
        disableClose: true,
        data: {
          title: this.translateService.get('admin.panel.settings.warning.popupWarning'),
          popupType: null,
          message: this.translateService.get(messageKey),
          cancelButtonText: this.translateService.get('registeredUsers.details.cancel'),
          confirmButtonText: this.translateService.get('registeredUsers.details.confirm')
        }
      }
    );
  }

  public openConfirmDialogWithData(dialogData: DialogData) {
    return this.dialog.open(
      DialogComponent,
      {
        maxWidth: '600px',
        width: '400px',
        disableClose: true,
        data: dialogData
      }
    );
  }

}
