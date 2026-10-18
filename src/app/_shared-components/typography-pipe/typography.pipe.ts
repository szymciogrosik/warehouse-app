import { Pipe, PipeTransform, inject } from '@angular/core';
import { CustomTranslateService } from '../../_services/translate/custom-translate.service';
import { LanguageEnum } from '../../_services/translate/language-enum';

@Pipe({
  name: 'typography',
  standalone: true
})
export class TypographyPipe implements PipeTransform {
  private readonly translateService = inject(CustomTranslateService);

  /**
   * List of words (orphans/widows) that should not be left alone at the end of a line.
   * For these words, the trailing space is replaced with a non-breaking space.
   */
  private readonly orphansConfig: Record<string, string[]> = {
    [LanguageEnum.POLISH]: [
      'i', 'a', 'o', 'u', 'w', 'z',
      'oraz', 'lecz', 'pod', 'nad', 'za', 'dla', 'przed', 'przy', 'po', 'od', 'do', 'na', 'ze', 'we', 'co', 'że'
    ],
    [LanguageEnum.ENGLISH]: [
      'a', 'an', 'the', 'and', 'or', 'in', 'on', 'at', 'to', 'by', 'of', 'with', 'for', 'is', 'it', 'as', 'if'
    ]
  };

  transform(value: string | null | undefined): string {
    if (!value) return '';

    // Detect language or fallback to Polish
    const lang = this.translateService.selectedLanguage() || LanguageEnum.POLISH;
    const orphans = this.orphansConfig[lang as string] || [];

    if (orphans.length === 0) return value;

    let result = value;

    /**
     * Regex explanation:
     * (^|\s) - Matches start of string or a whitespace character (Group 1)
     * (${word}) - Matches the orphan word itself (Group 2)
     * \s+ - Matches one or more whitespace characters following the word
     *
     * Replacement: $1$2\u00A0
     * Replaces the trailing space with a non-breaking space (\u00A0).
     */
    orphans.forEach(word => {
      // Use case-insensitive search to handle capitalized words at start of sentences
      const regex = new RegExp(`(^|\\s)(${word})\\s+`, 'gi');
      result = result.replace(regex, `$1$2\u00A0`);
    });

    return result;
  }
}
