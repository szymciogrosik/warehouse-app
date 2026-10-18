import { TestBed } from '@angular/core/testing';
import { DialogService } from './dialog.service';
import { MatDialog } from '@angular/material/dialog';
import { CustomTranslateService } from '../translate/custom-translate.service';
import { DialogComponent } from '../../_shared-components/dialog/dialog.component';

describe('DialogService', () => {
  let service: DialogService;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockTranslateService: jasmine.SpyObj<CustomTranslateService>;

  beforeEach(() => {
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockTranslateService = jasmine.createSpyObj('CustomTranslateService', ['get']);
    mockTranslateService.get.and.callFake((k: string) => `translated_${k}`);

    TestBed.configureTestingModule({
      providers: [
        DialogService,
        { provide: MatDialog, useValue: mockDialog },
        { provide: CustomTranslateService, useValue: mockTranslateService }
      ]
    });

    service = TestBed.inject(DialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should open confirmation dialog with translated message and default labels', () => {
    service.openConfirmDialog('my.warning.key');

    expect(mockDialog.open).toHaveBeenCalledWith(
      DialogComponent,
      jasmine.objectContaining({
        disableClose: true,
        data: jasmine.objectContaining({
          message: 'translated_my.warning.key',
          title: 'translated_admin.panel.settings.warning.popupWarning'
        })
      })
    );
  });

  it('should open confirmation dialog with custom DialogData', () => {
    const customData = {
      title: 'Custom Title',
      message: 'Custom Message',
      cancelButtonText: 'No',
      confirmButtonText: 'Yes',
      popupType: null
    };

    service.openConfirmDialogWithData(customData);

    expect(mockDialog.open).toHaveBeenCalledWith(
      DialogComponent,
      jasmine.objectContaining({
        disableClose: true,
        data: customData
      })
    );
  });
});
