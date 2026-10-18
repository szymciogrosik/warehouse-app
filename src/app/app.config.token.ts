import {InjectionToken} from '@angular/core';

export interface AppConfig {
  readonly production: boolean;
  readonly buildVersion: string;
  readonly default_language: string;
  readonly selected_language_key: string;
  readonly firebase: {
    readonly apiKey: string;
    readonly authDomain: string;
    readonly projectId: string;
    readonly storageBucket: string;
    readonly messagingSenderId: string;
    readonly appId: string;
    readonly measurementId: string;
  };
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');
