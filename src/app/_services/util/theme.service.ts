import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {PublicSettingsService} from '../../_database/settings/public-settings.service';

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

  constructor(private publicSettingsService: PublicSettingsService) {
    // Always start in light mode immediately — before Firebase responds
    this.applyTheme(false);

    // Load the Firebase setting and then decide theme
    this.publicSettingsService.getDocument('general').subscribe({
      next: data => {
        const allow = data?.allowDarkMode === true;
        this.allowDarkMode.next(allow);

        if (allow) {
          // Only restore user's saved preference when dark mode is allowed
          const savedTheme = localStorage.getItem(this.THEME_KEY);
          const isDark = savedTheme !== null ? JSON.parse(savedTheme) : false;
          this.isDarkTheme.next(isDark);
          this.applyTheme(isDark);
        } else {
          // Dark mode disabled — always light
          this.isDarkTheme.next(false);
          this.applyTheme(false);
        }
      },
      error: () => {
        // On error, fall back to light theme
        this.allowDarkMode.next(false);
        this.isDarkTheme.next(false);
        this.applyTheme(false);
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
