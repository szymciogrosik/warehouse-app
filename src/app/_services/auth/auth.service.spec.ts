import {TestBed} from '@angular/core/testing';
import {AuthService} from './auth.service';
import {Auth} from '@angular/fire/auth';
import {Router} from '@angular/router';
import {SnackbarService} from '../util/snackbar.service';
import {StandardUserDbService} from '../../_database/auth/standard-user-db.service';
import {CustomTranslateService} from '../translate/custom-translate.service';
import {of, firstValueFrom} from 'rxjs';
import {CustomUser} from '../../_models/user/custom-user';
import {AccessRole} from '../../_models/user/access-role';
import {provideZonelessChangeDetection} from '@angular/core';
import {VaultService} from '../security/vault.service';
import {VaultMetaDbService} from '../../_database/security/vault-meta-db.service';

describe('AuthService', () => {
  let service: AuthService;
  let mockAuth: any;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockSnackbarService: jasmine.SpyObj<SnackbarService>;
  let mockStandardUserDbService: jasmine.SpyObj<StandardUserDbService>;
  let mockTranslateService: jasmine.SpyObj<CustomTranslateService>;

  const sampleUser: CustomUser = {
    id: 'uid100',
    uid: 'uid100',
    email: 'test@example.com',
    firstName: 'Jan',
    lastName: 'Kowalski',
    roles: [AccessRole.ADMIN_PAGE_ACCESS],
    isDeleted: false
  };

  beforeEach(() => {
    mockAuth = {
      app: {options: {}},
      currentUser: null,
      signOut: jasmine.createSpy('signOut').and.returnValue(Promise.resolve()),
      onAuthStateChanged: jasmine.createSpy('onAuthStateChanged').and.callFake((cb: any) => {
        return () => {
        };
      })
    };

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockSnackbarService = jasmine.createSpyObj('SnackbarService', ['openLongSnackBar', 'openSnackBar']);
    mockStandardUserDbService = jasmine.createSpyObj('StandardUserDbService', ['watchUser', 'create']);
    mockStandardUserDbService.watchUser.and.returnValue(of(sampleUser));
    mockTranslateService = jasmine.createSpyObj('CustomTranslateService', ['get']);
    mockTranslateService.get.and.callFake((k: string) => `translated_${k}`);

    const mockVaultService = jasmine.createSpyObj('VaultService', [
      'initForUser',
      'clearSession',
      'unlockWithPassword',
      'setupVaultWithPassword',
      'rewrapWithPassword',
      'isUnlocked'
    ]);
    mockVaultService.isUnlocked.and.returnValue(false);
    mockVaultService.unlockWithPassword.and.returnValue(Promise.resolve(true));
    mockVaultService.setupVaultWithPassword.and.returnValue(Promise.resolve({recoveryKey: 'WMS-1234-5678-9012-3456'}));

    const mockVaultMetaDbService = jasmine.createSpyObj('VaultMetaDbService', ['getMetadata']);
    mockVaultMetaDbService.getMetadata.and.returnValue(Promise.resolve(null));

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideZonelessChangeDetection(),
        {provide: Auth, useValue: mockAuth},
        {provide: Router, useValue: mockRouter},
        {provide: SnackbarService, useValue: mockSnackbarService},
        {provide: StandardUserDbService, useValue: mockStandardUserDbService},
        {provide: CustomTranslateService, useValue: mockTranslateService},
        {provide: VaultService, useValue: mockVaultService},
        {provide: VaultMetaDbService, useValue: mockVaultMetaDbService}
      ]
    });

    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return observable from loggedUser()', async () => {
    const user = await firstValueFrom(service.loggedUser());
    expect(user).toBeNull();
  });

  it('should update local user and signal when updateLocalUser() is called', () => {
    (service as any).userSubject.next(sampleUser);
    expect(service.currentUser()?.firstName).toBe('Jan');

    service.updateLocalUser({firstName: 'Adam'});
    expect(service.currentUser()?.firstName).toBe('Adam');
    expect(service.currentUser()?.email).toBe('test@example.com');
  });

  it('should not update local user when current user is null', () => {
    (service as any).userSubject.next(null);
    service.updateLocalUser({firstName: 'Adam'});
    expect(service.currentUser()).toBeNull();
  });

  it('should reflect authentication state through isAuthenticated()', async () => {
    expect(await firstValueFrom(service.isAuthenticated())).toBe(false);

    (service as any).userSubject.next(sampleUser);
    expect(await firstValueFrom(service.isAuthenticated())).toBe(true);

    (service as any).userSubject.next(null);
    expect(await firstValueFrom(service.isAuthenticated())).toBe(false);
  });

  it('should clean up subscription and set user to null on unsubscribe()', () => {
    (service as any).userSubject.next(sampleUser);
    expect(service.currentUser()).not.toBeNull();

    (service as any).unsubscribe();
    expect(service.currentUser()).toBeNull();
  });

  it('should emit on authErrorLogoutSubject', (done) => {
    service.getAuthErrorLogout().subscribe(() => {
      expect(true).toBe(true);
      done();
    });

    (service as any).authErrorLogoutSubject.next();
  });

  describe('updateAuthPassword', () => {
    it('should throw error if no user is currently logged in', async () => {
      mockAuth.currentUser = null;
      try {
        await service.updateAuthPassword('NewPassword123!');
        fail('Expected updateAuthPassword to throw');
      } catch (err: any) {
        expect(err.message).toBe('No user currently logged in.');
      }
    });
  });

  describe('logout', () => {
    it('should unsubscribe and reset user on logout', async () => {
      (service as any).userSubject.next(sampleUser);
      service.logout(false);
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(service.currentUser()).toBeNull();
    });
  });
});
