import {Injectable} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {CustomTranslateService} from "../translate/custom-translate.service";

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {

  static SHORT_DURATION: number = 5000;
  static MEDIUM_DURATION: number = 7500;
  static LONG_DURATION: number = 20000;

  static DISMISS_ACTION: string = "snackbar.default.dismiss";

  constructor(
    private snackBar: MatSnackBar,
    private translateService: CustomTranslateService
  ) {
  }

  public openCustomSnackBar(message: string, action: string, duration: number): void {
    this.snackBar.open(message, action, {duration});
  }

  public openDefaultSnackBar(message: string): void {
    this.snackBar.open(message, this.translateService.get(SnackbarService.DISMISS_ACTION), {
      duration: SnackbarService.MEDIUM_DURATION
    });
  }

  public openLongSnackBar(message: string): void {
    this.snackBar.open(message, this.translateService.get(SnackbarService.DISMISS_ACTION));
  }

  public openForeverSnackBar(message: string): void {
    this.snackBar.open(message, this.translateService.get(SnackbarService.DISMISS_ACTION));
  }

}
