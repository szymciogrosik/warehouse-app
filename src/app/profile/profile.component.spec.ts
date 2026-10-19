import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ProfileComponent} from './profile.component';
import {AuthService} from '../_services/auth/auth.service';
import {UserDbService} from '../_database/auth/user-db-service.service';
import {SnackbarService} from '../_services/util/snackbar.service';
import {CustomTranslateService} from '../_services/translate/custom-translate.service';
import {MatDialog} from '@angular/material/dialog';
import {DialogService} from '../_services/util/dialog.service';
import {PublicSettingsFacade} from '../_database/settings/public-settings.facade';
import {StorageService} from '../_services/storage/storage.service';
import {VaultService} from '../_services/security/vault.service';
import {provideTranslateService} from '@ngx-translate/core';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {provideZonelessChangeDetection, signal} from '@angular/core';
import {of} from 'rxjs';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockVaultService: any;

  beforeEach(async () => {
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockDialog.open.and.returnValue({
      afterClosed: () => of(true)
    } as any);

    mockVaultService = {
      status: signal('UNLOCKED'),
      isUnlocked: signal(true),
      hasPin: signal(true),
      isConfigured: signal(true),
      lockVault: jasmine.createSpy('lockVault'),
      removePin: jasmine.createSpy('removePin').and.returnValue(Promise.resolve()),
      refreshRecoveryKey: jasmine.createSpy('refreshRecoveryKey').and.returnValue(Promise.resolve('WMS-1234-5678-9012-3456'))
    };

    const mockAuthService = {
      currentUser: signal({
        id: 'user_1',
        uid: 'user_1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        roles: []
      }),
      isLoading: signal(false),
      updateLocalUser: jasmine.createSpy('updateLocalUser')
    };

    const mockUserDb = jasmine.createSpyObj('UserDbService', ['update']);
    mockUserDb.update.and.returnValue(Promise.resolve());

    const mockSnackbar = jasmine.createSpyObj('SnackbarService', ['openSnackBar', 'openLongSnackBar']);
    const mockDialogService = jasmine.createSpyObj('DialogService', ['openConfirmDialogWithData']);
    mockDialogService.openConfirmDialogWithData.and.returnValue({
      afterClosed: () => of(true)
    } as any);

    const mockFacade = {
      allowForProfilePictureChange: signal(true)
    };

    await TestBed.configureTestingModule({
      imports: [ProfileComponent, NoopAnimationsModule],
      providers: [
        provideZonelessChangeDetection(),
        provideTranslateService(),
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserDbService, useValue: mockUserDb },
        { provide: SnackbarService, useValue: mockSnackbar },
        { provide: CustomTranslateService, useValue: { get: (k: string) => k } },
        { provide: MatDialog, useValue: mockDialog },
        { provide: DialogService, useValue: mockDialogService },
        { provide: PublicSettingsFacade, useValue: mockFacade },
        { provide: StorageService, useValue: jasmine.createSpyObj('StorageService', ['extractAndValidateFile']) },
        { provide: VaultService, useValue: mockVaultService }
      ]
    })
      .overrideComponent(ProfileComponent, {
        add: { providers: [{ provide: MatDialog, useValue: mockDialog }] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open PIN dialogs', () => {
    component.openSetPinDialog();
    expect(mockDialog.open).toHaveBeenCalled();

    component.openUnlockPinDialog();
    expect(mockDialog.open).toHaveBeenCalled();
  });

  it('should lock vault when onLockVault is called', () => {
    component.onLockVault();
    expect(mockVaultService.lockVault).toHaveBeenCalled();
  });

  it('should open raw inspector dialog', () => {
    component.openRawInspectorDialog();
    expect(mockDialog.open).toHaveBeenCalled();
  });

  it('should refresh and open recovery key dialog', async () => {
    await component.openRecoveryKeyDialog();
    expect(mockVaultService.refreshRecoveryKey).toHaveBeenCalled();
    expect(mockDialog.open).toHaveBeenCalled();
  });
});
