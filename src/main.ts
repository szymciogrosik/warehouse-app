import {enableProdMode, importProvidersFrom, provideZonelessChangeDetection} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {getAuth, provideAuth} from '@angular/fire/auth';
import {getFirestore, provideFirestore} from '@angular/fire/firestore';
import {getStorage, provideStorage} from '@angular/fire/storage';
import {getAnalytics, provideAnalytics} from '@angular/fire/analytics';
import {provideTranslateService} from '@ngx-translate/core';
import {AppComponent} from './app/app.component';
import {routing} from './app/app-routing.module';
import {environment} from './environments/environment';
import {provideTranslateHttpLoader} from "@ngx-translate/http-loader";
import {AssetsService} from "./app/_services/util/assets.service";
import {provideLuxonDateAdapter} from '@angular/material-luxon-adapter';
import {MatPaginatorIntl} from '@angular/material/paginator';
import {CustomPaginatorIntl} from './app/_services/util/custom-paginator-intl.service';

import {APP_CONFIG} from './app/app.config.token';

const CUSTOM_DATE_FORMATS = {
  parse: {
    dateInput: 'dd.MM.yyyy',
    timeInput: 'HH:mm:ss',
  },
  display: {
    dateInput: 'dd.MM.yyyy',
    monthYearLabel: 'LLLL yyyy',
    dateA11yLabel: 'dd LLLL yyyy',
    monthYearA11yLabel: 'LLLL yyyy',
    timeInput: 'HH:mm:ss',
    timeOptionLabel: 'HH:mm:ss',
  },
};

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptorsFromDi()),
    {provide: APP_CONFIG, useValue: environment},
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: AssetsService.BASE_PATH + "i18n/",
        suffix: `.json?v=${environment.buildVersion}`
      }),
      fallbackLang: `${environment.default_language}`,
      lang: `${environment.default_language}`
    }),
    importProvidersFrom(routing),
    provideLuxonDateAdapter(CUSTOM_DATE_FORMATS),

    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    provideAnalytics(() => getAnalytics()),
    {provide: MatPaginatorIntl, useClass: CustomPaginatorIntl},
  ]
}).catch(error => {
  console.error("Init failed: " + error)
});
