import {Injectable} from '@angular/core';
import {DateTime, IANAZone} from 'luxon';

@Injectable({
  providedIn: 'root'
})
export class DateService {
  public static timeZone: string = 'Europe/Warsaw';

  constructor() {
  }

  public presentCurrentDateTime() : string {
    return this.getCurrentDateTime().toFormat('dd-MM-yyyy HH:mm:ss');
  }

  public presentCurrentDate() : string {
      return this.getCurrentDateTime().toFormat('dd-MM-yyyy');
  }

  public getCurrentDateTime(): DateTime {
    return DateTime.now().setZone(DateService.timeZone);
  }

  public presentDateTime(dateTime: DateTime) : string {
    return dateTime.toFormat('dd-MM-yyyy HH:mm:ss');
  }

  public presentDate(dateTime: DateTime) : string {
    return dateTime.toFormat('dd-MM-yyyy');
  }

  public presentCurrentDateTimeForFileName() : string {
    return this.getCurrentDateTime().toFormat('dd-MM-yyyy_HH-mm-ss');
  }

}
