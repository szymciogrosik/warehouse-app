import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AssetsService {
  public static BASE_PATH: string = './assets/';

  constructor(private httpClient: HttpClient) {
  }

  public getResource(resourcePath: string): Observable<any> {
    return this.httpClient.get(AssetsService.BASE_PATH + resourcePath);
  }

}
