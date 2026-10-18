import {TestBed} from '@angular/core/testing';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {provideHttpClient} from '@angular/common/http';
import {StorageService} from './storage.service';
import {APP_CONFIG, AppConfig} from '../../app.config.token';
import {SnackbarService} from '../util/snackbar.service';
import {CustomTranslateService} from '../translate/custom-translate.service';

describe('StorageService', () => {
  let service: StorageService;
  let httpMock: HttpTestingController;
  let snackbarSpy: jasmine.SpyObj<SnackbarService>;
  let translateSpy: jasmine.SpyObj<CustomTranslateService>;

  const mockConfig: AppConfig = {
    production: false,
    buildVersion: '1.0.0',
    default_language: 'pl',
    selected_language_key: 'Language',
    firebase: {
      apiKey: 'test-key',
      authDomain: 'test.firebaseapp.com',
      projectId: 'test-project',
      messagingSenderId: '123',
      appId: '1:123:web:abc',
      measurementId: 'G-TEST'
    },
    cloudinary: {
      cloudName: 'demo-cloud',
      uploadPreset: 'unsigned_avatars'
    }
  };

  const setupTestBed = (config: AppConfig = mockConfig) => {
    snackbarSpy = jasmine.createSpyObj('SnackbarService', ['openLongSnackBar']);
    translateSpy = jasmine.createSpyObj('CustomTranslateService', ['get']);
    translateSpy.get.and.callFake((key: string) => key);

    TestBed.configureTestingModule({
      providers: [
        StorageService,
        provideHttpClient(),
        provideHttpClientTesting(),
        {provide: APP_CONFIG, useValue: config},
        {provide: SnackbarService, useValue: snackbarSpy},
        {provide: CustomTranslateService, useValue: translateSpy}
      ]
    });
    service = TestBed.inject(StorageService);
    httpMock = TestBed.inject(HttpTestingController);
  };

  afterEach(() => {
    httpMock?.verify();
  });

  it('should upload a Blob to Cloudinary and inject f_auto,q_auto delivery transformations', async () => {
    setupTestBed();
    const blob = new Blob(['test-image-bytes'], {type: 'image/webp'});

    const uploadPromise = service.uploadFile('users/uid-123', blob);

    const req = httpMock.expectOne('https://api.cloudinary.com/v1_1/demo-cloud/image/upload');
    expect(req.request.method).toBe('POST');

    const body = req.request.body as FormData;
    expect(body.get('upload_preset')).toBe('unsigned_avatars');
    expect(body.get('folder')).toBe('users/uid-123');
    expect(body.get('file')).toBeTruthy();

    req.flush({
      secure_url: 'https://res.cloudinary.com/demo-cloud/image/upload/v1700000000/users/uid-123/abc.webp',
      public_id: 'users/uid-123/abc',
      format: 'webp',
      bytes: 1024,
      width: 512,
      height: 512,
      created_at: '2026-10-18T18:00:00Z'
    });

    const resultUrl = await uploadPromise;
    expect(resultUrl).toBe(
      'https://res.cloudinary.com/demo-cloud/image/upload/f_auto,q_auto/v1700000000/users/uid-123/abc.webp'
    );
  });

  it('should throw an error if Cloudinary config uses placeholder values', async () => {
    setupTestBed({
      ...mockConfig,
      cloudinary: {
        cloudName: 'CLOUDINARY_CLOUD_NAME',
        uploadPreset: 'CLOUDINARY_UPLOAD_PRESET'
      }
    });

    const blob = new Blob(['test'], {type: 'image/webp'});
    await expectAsync(service.uploadFile('users/1', blob)).toBeRejectedWithError(
      /Cloudinary is not configured/
    );
  });

  it('should validate allowed image MIME types and file size', () => {
    setupTestBed();

    const validFile = new File(['valid-image'], 'avatar.png', {type: 'image/png'});
    expect(service.validateFile(validFile)).toBeTrue();
    expect(snackbarSpy.openLongSnackBar).not.toHaveBeenCalled();

    const invalidTypeFile = new File(['bad-type'], 'doc.pdf', {type: 'application/pdf'});
    expect(service.validateFile(invalidTypeFile)).toBeFalse();
    expect(snackbarSpy.openLongSnackBar).toHaveBeenCalledWith('profile.photo.error.invalidFormat');

    const oversizedFile = new File([new ArrayBuffer(StorageService.MAX_FILE_SIZE_BYTES + 1)], 'huge.jpg', {
      type: 'image/jpeg'
    });
    expect(service.validateFile(oversizedFile)).toBeFalse();
    expect(snackbarSpy.openLongSnackBar).toHaveBeenCalledWith('profile.photo.error.fileTooLarge');
  });
});
