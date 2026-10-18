import { TestBed } from '@angular/core/testing';
import { SnackbarService } from './snackbar.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomTranslateService } from '../translate/custom-translate.service';

describe('SnackbarService', () => {
  let service: SnackbarService;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;
  let mockTranslateService: jasmine.SpyObj<CustomTranslateService>;

  beforeEach(() => {
    mockSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);
    mockTranslateService = jasmine.createSpyObj('CustomTranslateService', ['get']);
    mockTranslateService.get.and.returnValue('Dismiss');

    TestBed.configureTestingModule({
      providers: [
        SnackbarService,
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: CustomTranslateService, useValue: mockTranslateService }
      ]
    });

    service = TestBed.inject(SnackbarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should open custom snackbar with specified parameters', () => {
    service.openCustomSnackBar('Custom message', 'OK', 1234);
    expect(mockSnackBar.open).toHaveBeenCalledWith('Custom message', 'OK', { duration: 1234 });
  });

  it('should open standard snackbar with medium duration', () => {
    service.openSnackBar('Standard message');
    expect(mockTranslateService.get).toHaveBeenCalledWith(SnackbarService.DISMISS_ACTION);
    expect(mockSnackBar.open).toHaveBeenCalledWith('Standard message', 'Dismiss', {
      duration: SnackbarService.MEDIUM_DURATION
    });
  });

  it('should open short snackbar with short duration', () => {
    service.openShortSnackBar('Short message');
    expect(mockSnackBar.open).toHaveBeenCalledWith('Short message', 'Dismiss', {
      duration: SnackbarService.SHORT_DURATION
    });
  });

  it('should open long snackbar with long duration', () => {
    service.openLongSnackBar('Long message');
    expect(mockSnackBar.open).toHaveBeenCalledWith('Long message', 'Dismiss', {
      duration: SnackbarService.LONG_DURATION
    });
  });

  it('should open forever snackbar without duration', () => {
    service.openForeverSnackBar('Forever message');
    expect(mockSnackBar.open).toHaveBeenCalledWith('Forever message', 'Dismiss');
  });
});
