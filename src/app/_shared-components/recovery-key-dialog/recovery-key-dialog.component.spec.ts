import {ComponentFixture, TestBed} from '@angular/core/testing';
import {RecoveryKeyDialogComponent} from './recovery-key-dialog.component';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {SnackbarService} from '../../_services/util/snackbar.service';
import {CustomTranslateService} from '../../_services/translate/custom-translate.service';
import {provideZonelessChangeDetection} from '@angular/core';
import {provideTranslateService} from '@ngx-translate/core';

describe('RecoveryKeyDialogComponent', () => {
  let component: RecoveryKeyDialogComponent;
  let fixture: ComponentFixture<RecoveryKeyDialogComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<RecoveryKeyDialogComponent>>;
  let mockSnackbar: jasmine.SpyObj<SnackbarService>;
  let mockTranslate: jasmine.SpyObj<CustomTranslateService>;

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockSnackbar = jasmine.createSpyObj('SnackbarService', ['openSnackBar']);
    mockTranslate = jasmine.createSpyObj('CustomTranslateService', ['get']);
    mockTranslate.get.and.callFake((k: string) => `trans_${k}`);

    await TestBed.configureTestingModule({
      imports: [RecoveryKeyDialogComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideTranslateService(),
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { recoveryKey: 'WMS-ABCD-EFGH-1234-5678' } },
        { provide: SnackbarService, useValue: mockSnackbar },
        { provide: CustomTranslateService, useValue: mockTranslate }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RecoveryKeyDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and display recovery key', () => {
    expect(component).toBeTruthy();
    expect(component.recoveryKey()).toBe('WMS-ABCD-EFGH-1234-5678');
  });

  it('should copy key to clipboard', () => {
    spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());
    component.copyToClipboard();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('WMS-ABCD-EFGH-1234-5678');
    expect(mockSnackbar.openSnackBar).toHaveBeenCalled();
  });

  it('should close dialog when close() is called', () => {
    component.close();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });
});
