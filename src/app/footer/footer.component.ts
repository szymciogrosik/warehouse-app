import {Component} from '@angular/core';
import {CustomCommonModule} from "../_imports/CustomCommon.module";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone: true,
  imports: [CustomCommonModule],
})
export class FooterComponent {
  constructor(
  ) {
  }

  protected openLink(link: string) {
    window.open(link, '_blank');
  }

}
