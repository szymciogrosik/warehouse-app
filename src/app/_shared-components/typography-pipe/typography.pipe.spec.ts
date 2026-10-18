import { TestBed } from '@angular/core/testing';
import { TypographyPipe } from './typography.pipe';
import { CustomTranslateService } from '../../_services/translate/custom-translate.service';
import { LanguageEnum } from '../../_services/translate/language-enum';
import { signal } from '@angular/core';

describe('TypographyPipe', () => {
  let pipe: TypographyPipe;
  let mockTranslateService: any;
  const currentLangSignal = signal<string>(LanguageEnum.POLISH);

  beforeEach(() => {
    currentLangSignal.set(LanguageEnum.POLISH);
    mockTranslateService = {
      selectedLanguage: currentLangSignal
    };

    TestBed.configureTestingModule({
      providers: [
        TypographyPipe,
        { provide: CustomTranslateService, useValue: mockTranslateService }
      ]
    });

    pipe = TestBed.inject(TypographyPipe);
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });

  describe('Edge Cases', () => {
    it('should return empty string when value is null', () => {
      expect(pipe.transform(null)).toBe('');
    });

    it('should return empty string when value is undefined', () => {
      expect(pipe.transform(undefined)).toBe('');
    });

    it('should return empty string when value is empty string', () => {
      expect(pipe.transform('')).toBe('');
    });

    it('should return original value if language has no configured orphans', () => {
      currentLangSignal.set('unknown-lang');
      const text = 'Tekst w domu i na ulicy';
      expect(pipe.transform(text)).toBe(text);
    });
  });

  describe('Polish Typography Rules', () => {
    beforeEach(() => {
      currentLangSignal.set(LanguageEnum.POLISH);
    });

    it('should replace trailing space with non-breaking space for single-letter Polish prepositions', () => {
      const input = 'Poszedłem w stronę lasu i zobaczyłem sarnę.';
      const output = pipe.transform(input);
      expect(output).toContain('w\u00A0stronę');
      expect(output).toContain('i\u00A0zobaczyłem');
    });

    it('should handle capitalized Polish orphans at start of sentences', () => {
      const input = 'W domu było cicho. I nikt nie odpowiadał.';
      const output = pipe.transform(input);
      expect(output).toContain('W\u00A0domu');
      expect(output).toContain('I\u00A0nikt');
    });

    it('should handle multi-letter Polish conjunctions and prepositions', () => {
      const input = 'Książka dla dzieci oraz zabawki od Mikołaja.';
      const output = pipe.transform(input);
      expect(output).toContain('dla\u00A0dzieci');
      expect(output).toContain('oraz\u00A0zabawki');
      expect(output).toContain('od\u00A0Mikołaja');
    });
  });

  describe('English Typography Rules', () => {
    beforeEach(() => {
      currentLangSignal.set(LanguageEnum.ENGLISH);
    });

    it('should replace trailing space for English articles and prepositions', () => {
      const input = 'This is a test of the emergency broadcast system in case of an issue.';
      const output = pipe.transform(input);
      expect(output).toContain('a\u00A0test');
      expect(output).toContain('the\u00A0emergency');
      expect(output).toContain('in\u00A0case');
      expect(output).toContain('an\u00A0issue');
    });

    it('should handle capitalized English words at start of string', () => {
      const input = 'The quick brown fox';
      const output = pipe.transform(input);
      expect(output).toContain('The\u00A0quick');
    });
  });
});
