import {ChangeDetectionStrategy, Component, OnInit, signal} from '@angular/core';
import {RouterModule} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';
import {MatButtonModule} from '@angular/material/button';
import {RedirectionEnum} from '../../../utils/redirection.enum';

const CONSENT_KEY = 'cookie_consent';

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [RouterModule, TranslatePipe, MatButtonModule],
  templateUrl: './cookie-consent.component.html',
  styleUrls: ['./cookie-consent.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CookieConsentComponent implements OnInit {
  readonly visible = signal(false);
  readonly privacyRoute = '/' + RedirectionEnum.PRIVACY_POLICY;
  readonly cookiesRoute = '/' + RedirectionEnum.COOKIES;

  ngOnInit(): void {
    const alreadyAccepted = localStorage.getItem(CONSENT_KEY);
    if (!alreadyAccepted) {
      setTimeout(() => this.visible.set(true), 800);
    }
  }

  accept(): void {
    localStorage.setItem(CONSENT_KEY, 'essential');
    this.visible.set(false);
  }
}
