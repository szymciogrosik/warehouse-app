import {Injectable, effect, inject} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {PublicSettingsFacade} from '../../_database/settings/public-settings.facade';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme';
  private readonly DARK_THEME_CLASS = 'dark-theme';

  private allowDarkMode = new BehaviorSubject<boolean>(false);
  public allowDarkMode$ = this.allowDarkMode.asObservable();

  private isDarkTheme = new BehaviorSubject<boolean>(false);
  public isDarkTheme$ = this.isDarkTheme.asObservable();

  private facade = inject(PublicSettingsFacade);

  constructor() {
    // Always start in light mode immediately
    this.applyTheme(false);

    effect(() => {
      const settings = this.facade.settings();
      if (settings !== undefined) {
        const allow = settings ? settings.allowDarkMode : false;
        this.allowDarkMode.next(allow);

        if (allow) {
          const savedTheme = localStorage.getItem(this.THEME_KEY);
          const isDark = savedTheme !== null ? JSON.parse(savedTheme) : false;
          this.isDarkTheme.next(isDark);
          this.applyTheme(isDark);
        } else {
          this.isDarkTheme.next(false);
          this.applyTheme(false);
        }
      }
    });
  }

  public toggleTheme(): void {
    if (!this.allowDarkMode.value) return;
    const isDark = !this.isDarkTheme.value;
    this.isDarkTheme.next(isDark);
    localStorage.setItem(this.THEME_KEY, JSON.stringify(isDark));
    this.applyTheme(isDark);
  }

  private applyTheme(isDark: boolean): void {
    if (isDark) {
      document.body.classList.add(this.DARK_THEME_CLASS);
    } else {
      document.body.classList.remove(this.DARK_THEME_CLASS);
    }
  }
}
