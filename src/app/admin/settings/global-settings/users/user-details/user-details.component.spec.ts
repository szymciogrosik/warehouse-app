import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserDetailsComponent } from './user-details.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserDetailsPopupData } from '../../../../../_models/dialog/user-details/user-details-popup-data';
import { UserDetailsType } from '../../../../../_models/dialog/user-details/user-details-type';
import { CustomTranslateService } from '../../../../../_services/translate/custom-translate.service';
import { AuthService } from '../../../../../_services/auth/auth.service';
import { SnackbarService } from '../../../../../_services/util/snackbar.service';
import { DialogService } from '../../../../../_services/util/dialog.service';
import { provideTranslateService } from '@ngx-translate/core';
import { provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';
import { AccessRole } from '../../../../../_models/user/access-role';

describe('UserDetailsComponent', () => {
  let component: UserDetailsComponent;
  let fixture: ComponentFixture<UserDetailsComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<UserDetailsComponent>>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockSnackbarService: jasmine.SpyObj<SnackbarService>;
  let mockDialogService: jasmine.SpyObj<DialogService>;
  let mockTranslateService: jasmine.SpyObj<CustomTranslateService>;

  const mockData = new UserDetailsPopupData({
    id: 'user123',
    uid: 'user123',
    email: 'test@example.com',
    firstName: 'Jan',
    lastName: 'Kowalski',
    roles: [AccessRole.ADMIN_PAGE_ACCESS],
    isDeleted: false
  }, UserDetailsType.UPDATE);

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['sendPasswordResetLink']);
    mockSnackbarService = jasmine.createSpyObj('SnackbarService', ['openSnackBar', 'openLongSnackBar']);
    mockDialogService = jasmine.createSpyObj('DialogService', ['openConfirmDialogWithData']);
    mockTranslateService = jasmine.createSpyObj('CustomTranslateService', ['get']);
    mockTranslateService.get.and.callFake((k: string) => k);

    await TestBed.configureTestingModule({
      imports: [UserDetailsComponent],
      providers: [
        provideTranslateService(),
        provideZonelessChangeDetection(),
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockData },
        { provide: AuthService, useValue: mockAuthService },
        { provide: SnackbarService, useValue: mockSnackbarService },
        { provide: DialogService, useValue: mockDialogService },
        { provide: CustomTranslateService, useValue: mockTranslateService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should close dialog with null on cancel click', () => {
    (component as any).onCancelClick();
    expect(mockDialogRef.close).toHaveBeenCalledWith(null);
  });

  it('should close dialog with payload on form submit', () => {
    const payload = { email: 'updated@example.com', firstName: 'Jan' };
    (component as any).onFormSubmit(payload);
    expect(mockDialogRef.close).toHaveBeenCalledWith(payload);
  });

  it('should send password reset link when confirmed', async () => {
    const dialogRefMock = {
      afterClosed: () => of(true)
    };
    mockDialogService.openConfirmDialogWithData.and.returnValue(dialogRefMock as any);
    mockAuthService.sendPasswordResetLink.and.resolveTo();

    await (component as any).onSendResetEmail();

    expect(mockDialogService.openConfirmDialogWithData).toHaveBeenCalled();
    expect(mockAuthService.sendPasswordResetLink).toHaveBeenCalledWith('test@example.com');
  });

  it('should not send password reset link when user cancels confirmation', async () => {
    const dialogRefMock = {
      afterClosed: () => of(false)
    };
    mockDialogService.openConfirmDialogWithData.and.returnValue(dialogRefMock as any);

    await (component as any).onSendResetEmail();

    expect(mockDialogService.openConfirmDialogWithData).toHaveBeenCalled();
    expect(mockAuthService.sendPasswordResetLink).not.toHaveBeenCalled();
  });
});
