import { TestBed } from '@angular/core/testing';
import { UserDbService } from './user-db-service.service';
import { Firestore } from '@angular/fire/firestore';

describe('UserDbService', () => {
  let service: UserDbService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserDbService,
        { provide: Firestore, useValue: {} }
      ]
    });

    service = TestBed.inject(UserDbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
