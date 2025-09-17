import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PromiseTimoutService {

  public timoutMessage: string = 'Timout error occurred';

  constructor() { }

  public promiseTimeout(ms: number, promise: Promise<any>): Promise<any> {
    // Create a promise that rejects in <ms> milliseconds
    let timeout = new Promise((_, reject) => {
      let id = setTimeout(() => {
        clearTimeout(id);
        reject(new Error(this.timoutMessage));
      }, ms);
    });

    // Returns a race between our timeout and the passed in promise
    return Promise.race([
      promise,
      timeout
    ]);
  }

}
