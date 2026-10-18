import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';
import {RouterModule} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';
import {RedirectionEnum} from '../../utils/redirection.enum';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatToolbarModule, RouterModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {
  protected readonly rp = RedirectionEnum;

  protected openLink(link: string) {
    window.open(link, '_blank');
  }

}
