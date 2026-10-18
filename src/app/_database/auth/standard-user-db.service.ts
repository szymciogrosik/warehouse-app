import {Injectable, inject} from '@angular/core';
import {UserDbService} from './user-db-service.service';
import {CustomUser} from '../../_models/user/custom-user';
import {map, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StandardUserDbService {
  private userDbService = inject(UserDbService);

  constructor() {}

  public watchUser(uid: string, _email?: string | null): Observable<CustomUser | null> {
    return this.userDbService.getUser(uid).pipe(
      map(user => user ?? null)
    );
  }

  public async create(newUser: CustomUser): Promise<void> {
    return this.userDbService.create(newUser);
  }
}
