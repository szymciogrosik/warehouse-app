import {ComponentFixture, TestBed} from '@angular/core/testing';
import {RawInspectorDialogComponent} from './raw-inspector-dialog.component';
import {MatDialogRef} from '@angular/material/dialog';
import {VaultService} from '../../_services/security/vault.service';
import {AuthService} from '../../_services/auth/auth.service';
import {CustomTranslateService} from '../../_services/translate/custom-translate.service';
import {provideZonelessChangeDetection, signal} from '@angular/core';
import {provideTranslateService} from '@ngx-translate/core';

describe('RawInspectorDialogComponent', () => {
  let component: RawInspectorDialogComponent;
  let fixture: ComponentFixture<RawInspectorDialogComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<RawInspectorDialogComponent>>;
  let mockVaultService: jasmine.SpyObj<VaultService>;
  let mockAuthService: any;

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockVaultService = jasmine.createSpyObj('VaultService', ['getRawServerDocument']);
    mockVaultService.getRawServerDocument.and.returnValue(
      Promise.resolve({
        isEncrypted: true,
        encryptedData: 'abc123xyz',
        iv: 'iv123',
        updatedAt: '2026-10-19T10:00:00.000Z'
      })
    );

    mockAuthService = {
      currentUser: signal({ uid: 'user_123', email: 'test@example.com' })
    };

    const mockTranslate = jasmine.createSpyObj('CustomTranslateService', ['get']);
    mockTranslate.get.and.callFake((k: string) => `trans_${k}`);

    await TestBed.configureTestingModule({
      imports: [RawInspectorDialogComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideTranslateService(),
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: VaultService, useValue: mockVaultService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: CustomTranslateService, useValue: mockTranslate }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RawInspectorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load server document', async () => {
    expect(component).toBeTruthy();
    await component.ngOnInit();
    expect(component.isEncrypted()).toBeTrue();
    expect(component.rawJson()).toContain('abc123xyz');
    expect(component.isLoading()).toBeFalse();
  });

  it('should close dialog when close() is called', () => {
    component.close();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });
});
