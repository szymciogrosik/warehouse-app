import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {provideRouter} from '@angular/router';
import {signal} from '@angular/core';
import {of} from 'rxjs';
import {provideTranslateService} from '@ngx-translate/core';
import {HomeComponent} from './home.component';
import {AuthService} from '../_services/auth/auth.service';
import {CustomTranslateService} from '../_services/translate/custom-translate.service';
import {SnackbarService} from '../_services/util/snackbar.service';
import {DialogService} from '../_services/util/dialog.service';
import {WarehouseDbService} from '../_database/warehouse/warehouse.service';
import {DateService} from '../_services/util/date.service';
import {APP_CONFIG} from '../app.config.token';
import {LanguageEnum} from '../_services/translate/language-enum';
import {VaultService} from '../_services/security/vault.service';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let isLoggedInSignal: ReturnType<typeof signal<boolean>>;
  let isLoadingSignal: ReturnType<typeof signal<boolean>>;

  beforeEach(async () => {
    isLoggedInSignal = signal(false);
    isLoadingSignal = signal(false);

    const mockAuthService = {
      currentUser: signal(null),
      isLoggedIn: isLoggedInSignal,
      isLoading: isLoadingSignal,
      loggedUser: () => of(null)
    };

    const mockTranslateService = {
      selectedLanguage: signal(LanguageEnum.POLISH),
      get: (k: string) => k
    };

    const mockWarehouseDb = {
      getByUser: () => of(null)
    };

    await TestBed.configureTestingModule({
      imports: [HomeComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        provideTranslateService(),
        {provide: AuthService, useValue: mockAuthService},
        {provide: CustomTranslateService, useValue: mockTranslateService},
        {provide: SnackbarService, useValue: jasmine.createSpyObj('SnackbarService', ['openShortSnackBar', 'openSnackBar'])},
        {provide: DialogService, useValue: jasmine.createSpyObj('DialogService', ['openConfirmDialogWithData'])},
        {provide: WarehouseDbService, useValue: mockWarehouseDb},
        {provide: DateService, useValue: {presentDateTime: () => ''}},
        {provide: APP_CONFIG, useValue: {default_language: LanguageEnum.POLISH}},
        {
          provide: VaultService,
          useValue: {
            status: signal('UNLOCKED'),
            isUnlocked: signal(true),
            hasPin: signal(true),
            isConfigured: signal(true),
            metadataLoaded$: of(true),
            onVaultStateChanged$: of(false),
            isAutoUnlocking: signal(false),
            shouldPromptUnlock: () => false,
            shouldPromptPinSetup: () => false,
            consumePendingRecoveryKey: () => null,
            markPinPrompted: () => {},
            markUnlockPrompted: () => {}
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render StarterShowcaseComponent when user is not logged in', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-starter-showcase')).not.toBeNull();
    expect(compiled.querySelector('warehouse-view')).toBeNull();
  });

  it('should render SkeletonComponent while auth state is loading', () => {
    isLoadingSignal.set(true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-skeleton')).not.toBeNull();
    expect(compiled.querySelector('app-starter-showcase')).toBeNull();
  });

  it('should render WarehouseViewComponent when user is logged in', () => {
    isLoggedInSignal.set(true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('warehouse-view')).not.toBeNull();
    expect(compiled.querySelector('app-starter-showcase')).toBeNull();
  });
});
