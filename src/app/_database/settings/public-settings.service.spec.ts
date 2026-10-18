import { TestBed } from '@angular/core/testing';
import { PublicSettingsService } from './public-settings.service';
import { Firestore } from '@angular/fire/firestore';

describe('PublicSettingsService', () => {
  let service: PublicSettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PublicSettingsService,
        { provide: Firestore, useValue: {} }
      ]
    });

    service = TestBed.inject(PublicSettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
