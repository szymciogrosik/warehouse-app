import {enableProdMode} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {provideFirebaseApp, initializeApp} from '@angular/fire/app';
import {getAuth, provideAuth} from '@angular/fire/auth';
import {provideFirestore, getFirestore} from '@angular/fire/firestore';
import {provideAnalytics, getAnalytics} from '@angular/fire/analytics';
import {importProvidersFrom} from '@angular/core';
import {provideTranslateService} from '@ngx-translate/core';
import {AppComponent} from './app/app.component';
import {routing} from './app/app-routing.module';
import {environment} from './environments/environment';
import {CustomCommonModule} from "./app/_imports/CustomCommon.module";
import {provideTranslateHttpLoader} from "@ngx-translate/http-loader";
import {AssetsService} from "./app/_services/util/assets.service";

if (environment.production) {
  enableProdMode();
}

const app = initializeApp(environment.firebase);

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: AssetsService.BASE_PATH + "i18n/",
        suffix: `.json?v=${environment.buildVersion}`
      }),
      fallbackLang: `${environment.default_language}`,
      lang: `${environment.default_language}`
    }),
    importProvidersFrom(CustomCommonModule),
    importProvidersFrom(routing),

    provideFirebaseApp(() => app),
    provideAuth(() => getAuth(app)),
    provideFirestore(() => getFirestore(app)),
    provideAnalytics(() => getAnalytics(app)),
  ]
}).catch(error => {
  console.error("Init failed: " + error)
});
