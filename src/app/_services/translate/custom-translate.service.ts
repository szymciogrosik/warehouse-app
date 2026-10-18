import {Injectable, inject} from '@angular/core';
import {TranslateService, Translation} from '@ngx-translate/core';
import {APP_CONFIG} from '../../app.config.token';
import {DateAdapter} from '@angular/material/core';
import {registerLocaleData} from '@angular/common';
import localePl from '@angular/common/locales/pl';
import localeEn from '@angular/common/locales/en';
import {LanguageEnum} from './language-enum';
import {BehaviorSubject, firstValueFrom} from 'rxjs';
import {toSignal} from '@angular/core/rxjs-interop';
import {Settings} from 'luxon';

@Injectable({
  providedIn: 'root'
})
export class CustomTranslateService {
  private readonly appConfig = inject(APP_CONFIG);
  private readonly translateService = inject(TranslateService);
  private readonly dateAdapter = inject(DateAdapter<any>);

  private readonly selectedLanguageSubject = new BehaviorSubject<string | null>(null);
  public readonly selectedLanguage = toSignal(this.selectedLanguageSubject);

  public setLanguage(language: string): void {
    const localeData = this.findApplicationLocalLanguage(language);
    this.translateService.use(language);
    this.dateAdapter.setLocale(language);
    Settings.defaultLocale = language;
    registerLocaleData(localeData);
    localStorage.setItem(this.appConfig.selected_language_key, language);

    this.selectedLanguageSubject.next(language);
  }

  private findApplicationLocalLanguage(language: string): any {
    switch (language) {
      case LanguageEnum.POLISH:
        return localePl;
      case LanguageEnum.ENGLISH:
        return localeEn;
      default:
        throw new Error("Language '" + language + "' is not supported");
    }
  }

  public get(key: string): string {
    return this.translateService.instant(key);
  }

  public getPromise(key: string): Promise<Translation> {
    return firstValueFrom(this.translateService.get(key));
  }

}
