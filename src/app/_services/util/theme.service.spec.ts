import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';
import { PublicSettingsFacade } from '../../_database/settings/public-settings.facade';
import { signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

describe('ThemeService', () => {
  let service: ThemeService;
  let settingsSignal: any;

  beforeEach(() => {
    settingsSignal = signal<any>({ allowDarkMode: true });
    const mockFacade = {
      settings: settingsSignal
    };

    localStorage.clear();
    document.body.classList.remove('dark-theme');

    TestBed.configureTestingModule({
      providers: [
        ThemeService,
        { provide: PublicSettingsFacade, useValue: mockFacade }
      ]
    });

    service = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    localStorage.clear();
    document.body.classList.remove('dark-theme');
  });

  it('should be created and start without dark-theme class', () => {
    expect(service).toBeTruthy();
    expect(document.body.classList.contains('dark-theme')).toBe(false);
  });

  it('should toggle theme when allowDarkMode is true', async () => {
    TestBed.flushEffects();

    service.toggleTheme();
    expect(await firstValueFrom(service.isDarkTheme$)).toBe(true);
    expect(document.body.classList.contains('dark-theme')).toBe(true);
    expect(localStorage.getItem('app-theme')).toBe('true');

    service.toggleTheme();
    expect(await firstValueFrom(service.isDarkTheme$)).toBe(false);
    expect(document.body.classList.contains('dark-theme')).toBe(false);
    expect(localStorage.getItem('app-theme')).toBe('false');
  });

  it('should not toggle theme when allowDarkMode is false', async () => {
    settingsSignal.set({ allowDarkMode: false });
    TestBed.flushEffects();

    service.toggleTheme();
    expect(await firstValueFrom(service.isDarkTheme$)).toBe(false);
    expect(document.body.classList.contains('dark-theme')).toBe(false);
  });
});
