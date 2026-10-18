import { TestBed } from '@angular/core/testing';
import { PublicSettingsFacade } from './public-settings.facade';
import { PublicSettingsService } from './public-settings.service';
import { of } from 'rxjs';
import { PublicSettings } from '../../_models/settings/public-settings';

describe('PublicSettingsFacade', () => {
  let facade: PublicSettingsFacade;
  let mockSettingsDb: jasmine.SpyObj<PublicSettingsService>;

  const sampleSettings: PublicSettings = {
    id: 'general',
    allowForRegistering: true,
    allowForProfilePictureChange: true,
    allowDarkMode: false
  };

  beforeEach(() => {
    mockSettingsDb = jasmine.createSpyObj('PublicSettingsService', ['getDocument', 'update', 'setDocument']);
    mockSettingsDb.getDocument.and.returnValue(of(sampleSettings));

    TestBed.configureTestingModule({
      providers: [
        PublicSettingsFacade,
        { provide: PublicSettingsService, useValue: mockSettingsDb }
      ]
    });

    facade = TestBed.inject(PublicSettingsFacade);
  });

  it('should be created', () => {
    expect(facade).toBeTruthy();
  });

  it('should correctly expose computed signals from settings', () => {
    expect(facade.allowForRegistering()).toBe(true);
    expect(facade.allowForProfilePictureChange()).toBe(true);
    expect(facade.allowDarkMode()).toBe(false);
  });

  it('should update settings successfully', async () => {
    mockSettingsDb.update.and.returnValue(Promise.resolve());

    await facade.saveSettings(sampleSettings);
    expect(mockSettingsDb.update).toHaveBeenCalledWith('general', sampleSettings);
  });

  it('should fallback to setDocument if document is not-found', async () => {
    mockSettingsDb.update.and.returnValue(Promise.reject({ code: 'not-found' }));
    mockSettingsDb.setDocument.and.returnValue(Promise.resolve());

    await facade.saveSettings(sampleSettings);
    expect(mockSettingsDb.setDocument).toHaveBeenCalledWith('general', sampleSettings);
  });

  it('should rethrow any other errors', async () => {
    mockSettingsDb.update.and.returnValue(Promise.reject({ code: 'permission-denied' }));

    await expectAsync(facade.saveSettings(sampleSettings)).toBeRejectedWith({ code: 'permission-denied' });
  });
});
