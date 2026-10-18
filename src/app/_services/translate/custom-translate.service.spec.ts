import { TestBed } from '@angular/core/testing';
import { CustomTranslateService } from './custom-translate.service';
import { TranslateService } from '@ngx-translate/core';
import { APP_CONFIG } from '../../app.config.token';
import { DateAdapter } from '@angular/material/core';
import { of } from 'rxjs';
import { LanguageEnum } from './language-enum';

describe('CustomTranslateService', () => {
  let service: CustomTranslateService;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;
  let mockDateAdapter: jasmine.SpyObj<DateAdapter<any>>;

  const mockAppConfig = {
    selected_language_key: 'app_selected_lang',
    default_language: 'pl'
  };

  beforeEach(() => {
    mockTranslateService = jasmine.createSpyObj('TranslateService', ['use', 'instant', 'get']);
    mockDateAdapter = jasmine.createSpyObj('DateAdapter', ['setLocale']);

    TestBed.configureTestingModule({
      providers: [
        CustomTranslateService,
        { provide: APP_CONFIG, useValue: mockAppConfig },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: DateAdapter, useValue: mockDateAdapter }
      ]
    });

    service = TestBed.inject(CustomTranslateService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return instant translation from get()', () => {
    mockTranslateService.instant.and.returnValue('Translated Text');
    const result = service.get('test.key');
    expect(mockTranslateService.instant).toHaveBeenCalledWith('test.key');
    expect(result).toBe('Translated Text');
  });

  it('should return translation promise from getPromise()', async () => {
    mockTranslateService.get.and.returnValue(of('Promise Translated'));
    const result = await service.getPromise('test.promiseKey');
    expect(mockTranslateService.get).toHaveBeenCalledWith('test.promiseKey');
    expect(result).toBe('Promise Translated');
  });

  it('should set supported language correctly', () => {
    service.setLanguage(LanguageEnum.POLISH);
    expect(mockTranslateService.use).toHaveBeenCalledWith(LanguageEnum.POLISH);
    expect(mockDateAdapter.setLocale).toHaveBeenCalledWith(LanguageEnum.POLISH);
    expect(localStorage.getItem(mockAppConfig.selected_language_key)).toBe(LanguageEnum.POLISH);
    expect(service.selectedLanguage()).toBe(LanguageEnum.POLISH);
  });

  it('should throw error for unsupported language', () => {
    expect(() => service.setLanguage('unsupported_lang')).toThrowError(
      "Language 'unsupported_lang' is not supported"
    );
  });
});
