import {Component, effect, OnDestroy, OnInit, signal, inject} from '@angular/core';
import {PublicSettingsFacade} from '../../../../_database/settings/public-settings.facade';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {SnackbarService} from '../../../../_services/util/snackbar.service';
import {CustomTranslateService} from '../../../../_services/translate/custom-translate.service';
import {Subscription} from 'rxjs';
import {MatSlideToggle, MatSlideToggleModule} from '@angular/material/slide-toggle';
import {TranslatePipe} from '@ngx-translate/core';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {SkeletonComponent} from '../../../../_shared-components/skeleton/skeleton.component';

@Component({
  selector: 'app-public-settings',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatSlideToggle,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    SkeletonComponent,
    TranslatePipe
  ],
  templateUrl: './public-settings.component.html',
  styleUrl: './public-settings.component.scss'
})
export class PublicSettingsComponent implements OnInit, OnDestroy {
  settingsForm: FormGroup;
  loading = signal<boolean>(true);
  saving = signal<boolean>(false);
  private settingsSub?: Subscription;

  private formBuilder = inject(FormBuilder);
  private facade = inject(PublicSettingsFacade);
  private snackbarService = inject(SnackbarService);
  private translateService = inject(CustomTranslateService);

  constructor() {
    this.settingsForm = this.formBuilder.group({
      allowForRegistering: [false],
      allowForProfilePictureChange: [false],
      allowDarkMode: [false]
    });

    effect(() => {
      const settings = this.facade.settings();
      if (settings !== undefined) {  // Finished fetching
         this.settingsForm.patchValue(settings || {
            allowForRegistering: false,
            allowForProfilePictureChange: false,
            allowDarkMode: false
         });
         this.loading.set(false);
      }
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    if (this.settingsSub) {
      this.settingsSub.unsubscribe();
    }
  }

  async saveSettings(): Promise<void> {
    this.saving.set(true);
    this.settingsForm.disable();
    try {
      const payload = {
        allowForRegistering: this.settingsForm.getRawValue().allowForRegistering,
        allowForProfilePictureChange: this.settingsForm.getRawValue().allowForProfilePictureChange,
        allowDarkMode: this.settingsForm.getRawValue().allowDarkMode
      };

      await this.facade.saveSettings({
         id: 'general',
         allowForRegistering: payload.allowForRegistering ?? false,
         allowForProfilePictureChange: payload.allowForProfilePictureChange ?? false,
         allowDarkMode: payload.allowDarkMode ?? false
      });
      this.snackbarService.openSnackBar(this.translateService.get('admin.panel.settings.public.savedSuccessfully'));
    } catch (err) {
      console.error(err);
      this.snackbarService.openLongSnackBar('Failed to save settings.');
    } finally {
      this.saving.set(false);
      this.settingsForm.enable();
    }
  }
}

