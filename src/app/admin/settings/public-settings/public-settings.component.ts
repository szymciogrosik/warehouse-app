import {Component, OnDestroy, OnInit} from '@angular/core';
import {PublicSettingsService} from '../../../_database/settings/public-settings.service';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {SnackbarService} from '../../../_services/util/snackbar.service';
import {CustomTranslateService} from '../../../_services/translate/custom-translate.service';
import {Subscription} from 'rxjs';
import {MatSlideToggle, MatSlideToggleModule} from '@angular/material/slide-toggle';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-public-settings',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatSlideToggle,
    CommonModule,
    TranslateModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule
  ],
  templateUrl: './public-settings.component.html',
  styleUrl: './public-settings.component.scss'
})
export class PublicSettingsComponent implements OnInit, OnDestroy {
  settingsForm: FormGroup;
  loading: boolean = true;
  saving: boolean = false;
  private settingsSub?: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private publicSettingsService: PublicSettingsService,
    private snackbarService: SnackbarService,
    private translateService: CustomTranslateService
  ) {
    this.settingsForm = this.formBuilder.group({
      allowForRegistering: [false],
      allowForProfilePictureChange: [false],
      allowDarkMode: [false]
    });
  }

  ngOnInit(): void {
    this.settingsSub = this.publicSettingsService.getDocument('general').subscribe({
      next: data => {
        if (data && data.allowForRegistering !== undefined) {
          this.settingsForm.patchValue({allowForRegistering: data.allowForRegistering});
        } else {
          this.settingsForm.patchValue({allowForRegistering: false});
        }
        if (data && data.allowForProfilePictureChange !== undefined) {
          this.settingsForm.patchValue({allowForProfilePictureChange: data.allowForProfilePictureChange});
        } else {
          this.settingsForm.patchValue({allowForProfilePictureChange: false});
        }
        if (data && data.allowDarkMode !== undefined) {
          this.settingsForm.patchValue({allowDarkMode: data.allowDarkMode});
        } else {
          this.settingsForm.patchValue({allowDarkMode: false});
        }
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.settingsSub) {
      this.settingsSub.unsubscribe();
    }
  }

  async saveSettings(): Promise<void> {
    this.saving = true;
    this.settingsForm.disable();
    try {
      const payload = {
        allowForRegistering: this.settingsForm.getRawValue().allowForRegistering,
        allowForProfilePictureChange: this.settingsForm.getRawValue().allowForProfilePictureChange,
        allowDarkMode: this.settingsForm.getRawValue().allowDarkMode
      };

      await this.publicSettingsService.update('general', payload).catch(async e => {
        if (e.code === 'not-found') {
          await this.publicSettingsService.setDocument('general', payload);
        } else {
          throw e;
        }
      });
      this.snackbarService.openSnackBar(this.translateService.get('admin.panel.settings.public.savedSuccessfully'));
    } catch (err) {
      console.error(err);
      this.snackbarService.openLongSnackBar('Failed to save settings.');
    } finally {
      this.saving = false;
      this.settingsForm.enable();
    }
  }
}
