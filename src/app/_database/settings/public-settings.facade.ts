import {computed, inject, Injectable} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {PublicSettingsService} from './public-settings.service';
import {PublicSettings} from '../../_models/settings/public-settings';
import {map} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PublicSettingsFacade {
  private settingsDb = inject(PublicSettingsService);

  public readonly settings = toSignal(
    this.settingsDb.getDocument('general').pipe(
      map(val => val === undefined ? null : val)
    )
  );

  public readonly allowForRegistering = computed(() => this.settings()?.allowForRegistering ?? false);
  public readonly allowForProfilePictureChange = computed(() => this.settings()?.allowForProfilePictureChange ?? false);
  public readonly allowDarkMode = computed(() => this.settings()?.allowDarkMode ?? false);

  public async saveSettings(payload: PublicSettings): Promise<void> {
    try {
      await this.settingsDb.update('general', payload);
    } catch (e: any) {
      if (e.code === 'not-found') {
        await this.settingsDb.setDocument('general', payload);
      } else {
        throw e;
      }
    }
  }
}
