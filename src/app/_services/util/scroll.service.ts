import {EventEmitter, Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScrollService {

  public scrollRequest: EventEmitter<string> = new EventEmitter();

  constructor() { }

  requestScrollTo(elementId: string): void {
    this.scrollRequest.emit(elementId);
  }

}
