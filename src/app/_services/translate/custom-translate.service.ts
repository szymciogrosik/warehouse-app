import {Injectable} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {environment} from '../../../environments/environment';
import {DateAdapter} from "@angular/material/core";
import {registerLocaleData} from "@angular/common";
import localePl from '@angular/common/locales/pl';
import localeEn from '@angular/common/locales/en';
import {LanguageEnum} from "./language-enum";
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CustomTranslateService {

  private selectedLanguage : BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  selectedLanguageObservable = this.selectedLanguage.asObservable();

  constructor(
    private translateService: TranslateService,
    private dateAdapter: DateAdapter<any>
  ) {
  }

  public setLoadedOrDefaultLanguage(): void {
    const savedLanguage: string | null = localStorage.getItem(environment.selected_language_key);
    const language: string = savedLanguage !== null && savedLanguage !== 'null' ? savedLanguage : environment.default_language;

    this.translateService.setDefaultLang(language);
    this.setLanguage(language);
  }

  public setLanguage(language: string): void {
    this.translateService.use(language);
    this.dateAdapter.setLocale(language);
    registerLocaleData(this.findApplicationLocalLanguage(language));
    localStorage.setItem(environment.selected_language_key, language);

    this.selectedLanguage.next(language);
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

}
