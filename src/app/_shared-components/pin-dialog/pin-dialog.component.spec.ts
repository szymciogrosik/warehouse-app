import {ComponentFixture, TestBed} from '@angular/core/testing';
import {PinDialogComponent} from './pin-dialog.component';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {VaultService} from '../../_services/security/vault.service';
import {SnackbarService} from '../../_services/util/snackbar.service';
import {CustomTranslateService} from '../../_services/translate/custom-translate.service';
import {provideZonelessChangeDetection} from '@angular/core';
import {provideTranslateService} from '@ngx-translate/core';

describe('PinDialogComponent', () => {
  let component: PinDialogComponent;
  let fixture: ComponentFixture<PinDialogComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<PinDialogComponent>>;
  let mockVaultService: jasmine.SpyObj<VaultService>;
  let mockSnackbar: jasmine.SpyObj<SnackbarService>;
  let mockTranslate: jasmine.SpyObj<CustomTranslateService>;

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockVaultService = jasmine.createSpyObj('VaultService', [
      'unlockWithPin',
      'unlockWithRecoveryKey',
      'setPin',
      'setupVaultWithPinOnly',
      'isConfigured'
    ]);
    mockVaultService.unlockWithPin.and.returnValue(Promise.resolve(true));
    mockVaultService.unlockWithRecoveryKey.and.returnValue(Promise.resolve(true));
    mockVaultService.setPin.and.returnValue(Promise.resolve());
    mockVaultService.setupVaultWithPinOnly.and.returnValue(Promise.resolve({ recoveryKey: 'WMS-KEY' }));
    mockVaultService.isConfigured.and.returnValue(true);

    mockSnackbar = jasmine.createSpyObj('SnackbarService', ['openSnackBar']);
    mockTranslate = jasmine.createSpyObj('CustomTranslateService', ['get']);
    mockTranslate.get.and.callFake((k: string) => `trans_${k}`);

    await TestBed.configureTestingModule({
      imports: [PinDialogComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideTranslateService(),
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { mode: 'UNLOCK' } },
        { provide: VaultService, useValue: mockVaultService },
        { provide: SnackbarService, useValue: mockSnackbar },
        { provide: CustomTranslateService, useValue: mockTranslate }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PinDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should append digits when clicked in UNLOCK mode and trigger unlock on 4 digits', async () => {
    component.onDigitClick('1');
    component.onDigitClick('2');
    component.onDigitClick('3');
    expect(component.pin()).toBe('123');

    component.onDigitClick('4');
    expect(component.pin()).toBe('1234');
    expect(mockVaultService.unlockWithPin).toHaveBeenCalledWith('1234');
  });

  it('should handle backspace correctly', () => {
    component.onDigitClick('1');
    component.onDigitClick('2');
    expect(component.pin()).toBe('12');

    component.onBackspace();
    expect(component.pin()).toBe('1');
  });

  it('should switch to recovery mode and back', () => {
    component.switchToRecovery();
    expect(component.mode()).toBe('RECOVERY');

    component.switchToPin();
    expect(component.mode()).toBe('UNLOCK');
  });

  it('should close dialog with false on close()', () => {
    component.close();
    expect(mockDialogRef.close).toHaveBeenCalledWith(false);
  });
});
