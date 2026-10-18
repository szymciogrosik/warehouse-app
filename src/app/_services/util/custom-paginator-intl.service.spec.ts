import { TestBed } from '@angular/core/testing';
import { CustomPaginatorIntl } from './custom-paginator-intl.service';
import { CustomTranslateService } from '../translate/custom-translate.service';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import { provideZonelessChangeDetection } from '@angular/core';

describe('CustomPaginatorIntl', () => {
  let paginatorIntl: CustomPaginatorIntl;
  let mockCustomTranslateService: jasmine.SpyObj<CustomTranslateService>;

  beforeEach(() => {
    mockCustomTranslateService = jasmine.createSpyObj('CustomTranslateService', ['get']);
    mockCustomTranslateService.get.and.callFake((key: string) => {
      const dict: Record<string, string> = {
        'admin.panel.table.paginator.itemsPerPageLabel': 'Pozycji na stronę:',
        'admin.panel.table.paginator.nextPageLabel': 'Następna strona',
        'admin.panel.table.paginator.previousPageLabel': 'Poprzednia strona',
        'admin.panel.table.paginator.firstPageLabel': 'Pierwsza strona',
        'admin.panel.table.paginator.lastPageLabel': 'Ostatnia strona',
        'admin.panel.table.paginator.of': 'z'
      };
      return dict[key] || key;
    });

    TestBed.configureTestingModule({
      providers: [
        CustomPaginatorIntl,
        provideTranslateService(),
        provideZonelessChangeDetection(),
        { provide: CustomTranslateService, useValue: mockCustomTranslateService }
      ]
    });

    paginatorIntl = TestBed.inject(CustomPaginatorIntl);
  });

  it('should be created and have initial labels populated', () => {
    expect(paginatorIntl).toBeTruthy();
    expect(paginatorIntl.itemsPerPageLabel).toBe('Pozycji na stronę:');
    expect(paginatorIntl.nextPageLabel).toBe('Następna strona');
    expect(paginatorIntl.previousPageLabel).toBe('Poprzednia strona');
  });

  describe('getRangeLabel edge cases', () => {
    it('should return 0 z 0 when length is 0', () => {
      expect(paginatorIntl.getRangeLabel(0, 10, 0)).toBe('0 z 0');
    });

    it('should return 0 z 50 when pageSize is 0', () => {
      expect(paginatorIntl.getRangeLabel(0, 0, 50)).toBe('0 z 50');
    });

    it('should format range for first page properly', () => {
      expect(paginatorIntl.getRangeLabel(0, 10, 25)).toBe('1 - 10 z 25');
    });

    it('should format range for middle page properly', () => {
      expect(paginatorIntl.getRangeLabel(1, 10, 25)).toBe('11 - 20 z 25');
    });

    it('should format range for last partial page capped at total length', () => {
      expect(paginatorIntl.getRangeLabel(2, 10, 25)).toBe('21 - 25 z 25');
    });

    it('should fallback to "of" if translation returns empty', () => {
      mockCustomTranslateService.get.and.returnValue('');
      expect(paginatorIntl.getRangeLabel(0, 10, 5)).toBe('1 - 5 of 5');
    });
  });
});
