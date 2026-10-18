import {Injectable, inject, effect} from '@angular/core';
import {MatDatepickerIntl} from '@angular/material/datepicker';
import {TranslateService} from '@ngx-translate/core';
import {toSignal} from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class CustomDatepickerIntl extends MatDatepickerIntl {
  private readonly translateService = inject(TranslateService);
  private readonly langChange = toSignal(this.translateService.onLangChange);

  constructor() {
    super();

    effect(() => {
      this.langChange();
      this.getTranslations();
      this.changes.next();
    });

    this.getTranslations();
  }

  override formatYearRange(start: string, end: string): string {
    return `${start} – ${end}`;
  }

  override formatYearRangeLabel(start: string, end: string): string {
    return `${start} do ${end}`;
  }

  private getTranslations(): void {
    this.calendarLabel = this.translateService.instant('datePicker.intl.calendarLabel');
    this.openCalendarLabel = this.translateService.instant('datePicker.intl.openCalendarLabel');
    this.closeCalendarLabel = this.translateService.instant('datePicker.intl.closeCalendarLabel');
    this.prevMonthLabel = this.translateService.instant('datePicker.intl.prevMonthLabel');
    this.nextMonthLabel = this.translateService.instant('datePicker.intl.nextMonthLabel');
    this.prevYearLabel = this.translateService.instant('datePicker.intl.prevYearLabel');
    this.nextYearLabel = this.translateService.instant('datePicker.intl.nextYearLabel');
    this.prevMultiYearLabel = this.translateService.instant('datePicker.intl.prevMultiYearLabel');
    this.nextMultiYearLabel = this.translateService.instant('datePicker.intl.nextMultiYearLabel');
    this.switchToMonthViewLabel = this.translateService.instant('datePicker.intl.switchToMonthViewLabel');
    this.switchToMultiYearViewLabel = this.translateService.instant('datePicker.intl.switchToMultiYearLabel');
  }
}
