import {ChangeDetectionStrategy, Component} from '@angular/core';
import {RouterModule} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {RedirectionEnum} from '../../../utils/redirection.enum';

@Component({
  selector: 'app-cookie-policy',
  standalone: true,
  imports: [RouterModule, TranslatePipe, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './cookie-policy.component.html',
  styleUrls: ['./cookie-policy.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CookiePolicyComponent {
  protected readonly rp = RedirectionEnum;
  readonly homeRoute = '/' + RedirectionEnum.HOME;
}
