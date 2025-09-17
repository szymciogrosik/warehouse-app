import {Injectable} from '@angular/core';
import {DialogComponent} from "../../_shared-components/dialog/dialog.component";
import {DialogData} from "../../_models/dialog/dialog-data";
import {MatDialog} from "@angular/material/dialog";
import {CustomTranslateService} from "../translate/custom-translate.service";

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(
    private dialog: MatDialog,
    private translateService: CustomTranslateService,
  ) { }

  public openConfirmDialog(messageKey: string) {
    return this.dialog.open(
      DialogComponent,
      {
        maxWidth: '600px',
        width: '400px',
        disableClose: true,
        data: new DialogData(
          this.translateService.get('admin.panel.settings.warning.popupWarning'),
          null,
          this.translateService.get(messageKey),
          this.translateService.get('registeredUsers.details.cancel'),
          this.translateService.get('registeredUsers.details.confirm')
        )
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
