import {ChangeDetectionStrategy, Component, inject, ViewChild, ElementRef, OnInit} from '@angular/core';
import {CustomTranslateService} from './_services/translate/custom-translate.service';
import {FooterComponent} from './footer/footer.component';
import {NavbarComponent} from './navbar/navbar.component';
import {Title} from '@angular/platform-browser';
import {RouterModule, Router, NavigationEnd} from '@angular/router';
import {APP_CONFIG} from './app.config.token';
import {MatDatepickerIntl} from '@angular/material/datepicker';
import {CustomDatepickerIntl} from './_services/util/custom-datepicker-intl.service';
import {filter} from 'rxjs/operators';
import {CookieConsentComponent} from './_shared-components/cookie-consent/cookie-consent.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [FooterComponent, NavbarComponent, RouterModule, CookieConsentComponent],
  providers: [
    {provide: MatDatepickerIntl, useClass: CustomDatepickerIntl}
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  private readonly translateService = inject(CustomTranslateService);
  private readonly titleService = inject(Title);
  private readonly appConfig = inject(APP_CONFIG);
  private readonly router = inject(Router);

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  constructor() {
    const savedLang = localStorage.getItem(this.appConfig.selected_language_key) || this.appConfig.default_language;
    this.translateService.setLanguage(savedLang);

    this.translateService.getPromise('page.title')
      .then(value => this.titleService.setTitle(value))
      .catch(err => console.error(err));
  }

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.scrollContainer && this.scrollContainer.nativeElement) {
        this.scrollContainer.nativeElement.scrollTop = 0;
      }
    });
  }

}

