import {ChangeDetectionStrategy, Component} from '@angular/core';
import {RouterModule} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {RedirectionEnum} from '../../../utils/redirection.enum';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [RouterModule, TranslatePipe, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivacyPolicyComponent {
  protected readonly rp = RedirectionEnum;
  readonly homeRoute = '/' + RedirectionEnum.HOME;
}
