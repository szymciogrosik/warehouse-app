import {Component} from '@angular/core';
import {CustomTranslateService} from './_services/translate/custom-translate.service';
import {CustomCommonModule} from "./_imports/CustomCommon.module";
import {FooterComponent} from "./footer/footer.component";
import {NavbarComponent} from "./navbar/navbar.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [CustomCommonModule, FooterComponent, NavbarComponent],
})
export class AppComponent {
  title = 'angular';

  constructor(
    private translateService: CustomTranslateService,
  ) {
    this.translateService.setLoadedOrDefaultLanguage();
  }

}
