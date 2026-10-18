import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PublicSettingsComponent } from './public-settings.component';
import { PublicSettingsFacade } from '../../../../_database/settings/public-settings.facade';
import { SnackbarService } from '../../../../_services/util/snackbar.service';
import { CustomTranslateService } from '../../../../_services/translate/custom-translate.service';
import { provideTranslateService } from '@ngx-translate/core';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { PublicSettings } from '../../../../_models/settings/public-settings';

describe('PublicSettingsComponent', () => {
  let component: PublicSettingsComponent;
  let fixture: ComponentFixture<PublicSettingsComponent>;
  let mockFacade: any;
  let mockSnackbarService: jasmine.SpyObj<SnackbarService>;
  let mockTranslateService: jasmine.SpyObj<CustomTranslateService>;
  const settingsSignal = signal<PublicSettings | undefined | null>(undefined);

  beforeEach(async () => {
    settingsSignal.set({
      id: 'general',
      allowForRegistering: true,
      allowForProfilePictureChange: false,
      allowDarkMode: true
    });

    mockFacade = {
      settings: settingsSignal,
      saveSettings: jasmine.createSpy('saveSettings').and.resolveTo()
    };

    mockSnackbarService = jasmine.createSpyObj('SnackbarService', ['openSnackBar', 'openLongSnackBar']);
    mockTranslateService = jasmine.createSpyObj('CustomTranslateService', ['get']);
    mockTranslateService.get.and.callFake((k: string) => k);

    await TestBed.configureTestingModule({
      imports: [PublicSettingsComponent],
      providers: [
        provideTranslateService(),
        provideZonelessChangeDetection(),
        { provide: PublicSettingsFacade, useValue: mockFacade },
        { provide: SnackbarService, useValue: mockSnackbarService },
        { provide: CustomTranslateService, useValue: mockTranslateService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PublicSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created and patch settings form from facade', () => {
    expect(component).toBeTruthy();
    expect(component.settingsForm.get('allowForRegistering')?.value).toBe(true);
    expect(component.settingsForm.get('allowForProfilePictureChange')?.value).toBe(false);
    expect(component.settingsForm.get('allowDarkMode')?.value).toBe(true);
  });

  it('should save settings and display success snackbar', async () => {
    component.settingsForm.patchValue({
      allowForRegistering: false,
      allowForProfilePictureChange: true,
      allowDarkMode: false
    });

    await component.saveSettings();

    expect(mockFacade.saveSettings).toHaveBeenCalledWith({
      id: 'general',
      allowForRegistering: false,
      allowForProfilePictureChange: true,
      allowDarkMode: false
    });
    expect(mockSnackbarService.openSnackBar).toHaveBeenCalled();
  });

  it('should handle save error and display error snackbar', async () => {
    mockFacade.saveSettings.and.rejectWith(new Error('Network error'));

    await component.saveSettings();

    expect(mockSnackbarService.openLongSnackBar).toHaveBeenCalledWith('Failed to save settings.');
    expect(component.saving()).toBe(false);
    expect(component.settingsForm.enabled).toBe(true);
  });
});
