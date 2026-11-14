import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {toSignal} from '@angular/core/rxjs-interop';
import {AuthService} from '../../_services/auth/auth.service';
import {ThemeService} from '../../_services/util/theme.service';
import {CustomTranslateService} from '../../_services/translate/custom-translate.service';
import {PublicSettingsFacade} from '../../_database/settings/public-settings.facade';
import {SnackbarService} from '../../_services/util/snackbar.service';
import {DialogService} from '../../_services/util/dialog.service';
import {DialogType} from '../../_models/dialog/dialog-type';
import {RedirectionEnum} from '../../../utils/redirection.enum';
import {LanguageEnum} from '../../_services/translate/language-enum';
import {APP_CONFIG} from '../../app.config.token';

export type ArchitectureNodeId = 'angular' | 'firebase' | 'cloudinary';
export type CompressionStage = 'raw' | 'cropped' | 'cdn';

interface ShowcaseCopy {
  readonly badge: string;
  readonly heroTitlePrefix: string;
  readonly heroTitleAccent: string;
  readonly heroSubtitle: string;
  readonly ctaLogin: string;
  readonly ctaProfile: string;
  readonly ctaAdmin: string;
  readonly ctaExplore: string;
  readonly welcomeBack: string;
  readonly guestMode: string;
  readonly metricZonelessLabel: string;
  readonly metricZonelessValue: string;
  readonly metricAuthLabel: string;
  readonly metricAuthValue: string;
  readonly metricCdnLabel: string;
  readonly metricCdnValue: string;

  readonly archTag: string;
  readonly archTitle: string;
  readonly archSubtitle: string;
  readonly archNodes: Record<
    ArchitectureNodeId,
    {
      readonly step: string;
      readonly title: string;
      readonly subtitle: string;
      readonly description: string;
      readonly specs: ReadonlyArray<{readonly label: string; readonly value: string}>;
    }
  >;

  readonly studioTag: string;
  readonly studioTitle: string;
  readonly studioSubtitle: string;
  readonly themeLabel: string;
  readonly themeLight: string;
  readonly themeDark: string;
  readonly themeDisabledHint: string;
  readonly langLabel: string;

  readonly sessionTag: string;
  readonly sessionTitle: string;
  readonly sessionLoggedAs: string;
  readonly sessionGuestTitle: string;
  readonly sessionGuestDesc: string;
  readonly flagRegister: string;
  readonly flagAvatar: string;
  readonly flagDark: string;
  readonly stateEnabled: string;
  readonly stateLocked: string;

  readonly labTag: string;
  readonly labTitle: string;
  readonly labSubtitle: string;
  readonly btnToast: string;
  readonly btnModal: string;
  readonly btnWarnModal: string;
  readonly toastDemoMsg: string;
  readonly modalDemoTitle: string;
  readonly modalDemoMsg: string;
  readonly modalWarnTitle: string;
  readonly modalWarnMsg: string;
  readonly modalConfirmBtn: string;
  readonly modalCancelBtn: string;

  readonly mediaTag: string;
  readonly mediaTitle: string;
  readonly mediaSubtitle: string;
  readonly stages: Record<
    CompressionStage,
    {
      readonly label: string;
      readonly size: string;
      readonly format: string;
      readonly dimensions: string;
      readonly savings: string;
      readonly detail: string;
    }
  >;

  readonly footerBarTitle: string;
  readonly footerBarSubtitle: string;
  readonly linkPrivacy: string;
  readonly linkTerms: string;
  readonly linkCookies: string;
  readonly linkStatus: string;
}

const SHOWCASE_DICTIONARY: Record<'pl' | 'en', ShowcaseCopy> = {
  pl: {
    badge: 'Angular 21 Zoneless • Firebase • Cloudinary CDN',
    heroTitlePrefix: 'Fundament nowej generacji dla',
    heroTitleAccent: 'aplikacji SaaS.',
    heroSubtitle:
      'Kompletny akcelerator produkcyjny łączący reaktywność Angular Signals, autoryzację i bazę Cloud Firestore oraz optymalizację obrazów WebP/AVIF.',
    ctaLogin: 'Zaloguj lub utwórz konto',
    ctaProfile: 'Twój profil',
    ctaAdmin: 'Panel administratora',
    ctaExplore: 'Przetestuj interaktywne moduły',
    welcomeBack: 'Aktywna sesja:',
    guestMode: 'Tryb podglądu (Gość)',
    metricZonelessLabel: 'Silnik renderowania',
    metricZonelessValue: '100% Zoneless Signals',
    metricAuthLabel: 'Bezpieczeństwo danych',
    metricAuthValue: 'RBAC + Firestore Rules',
    metricCdnLabel: 'Optymalizacja mediów',
    metricCdnValue: 'WebP 512px • f_auto,q_auto',

    archTag: '01 / ARCHITEKTURA',
    archTitle: 'Interaktywny potok danych',
    archSubtitle: 'Kliknij dowolny warstwowy węzeł, aby zbadać przepływ żądań i zabezpieczeń w czasie rzeczywistym.',
    archNodes: {
      angular: {
        step: 'WARSTWA 01',
        title: 'Angular 21 Zoneless UI',
        subtitle: 'Signals • OnPush • Material 3 Bento',
        description:
          'Aplikacja działa całkowicie bez narzutu biblioteki Zone.js. Każda zmiana stanu opiera się na precyzyjnych sygnałach (Signals), zapewniając natychmiastowe odświeżanie DOM i brak zbędnych cykli detekcji zmian.',
        specs: [
          {label: 'Detekcja zmian', value: 'provideZonelessChangeDetection()'},
          {label: 'Strategia komponentów', value: 'ChangeDetectionStrategy.OnPush'},
          {label: 'System wizualny', value: 'Bento CSS Variables + Dark Mode'}
        ]
      },
      firebase: {
        step: 'WARSTWA 02',
        title: 'Firebase Auth & Firestore',
        subtitle: 'SSO Google • Role RBAC • Real-time Sync',
        description:
          'Tożsamość użytkownika jest weryfikowana przez Firebase Authentication i synchronizowana strumieniowo z kolekcją users w Cloud Firestore. Reguły bezpieczeństwa blokują eskalację uprawnień po stronie klienta.',
        specs: [
          {label: 'Dostawcy tożsamości', value: 'Email/Hasło + Google OAuth 2.0'},
          {label: 'Kontrola dostępu', value: 'ADMIN_PAGE_ACCESS / CORE_SETTINGS'},
          {label: 'Konfiguracja na żywo', value: 'PublicSettingsFacade (Signals)'}
        ]
      },
      cloudinary: {
        step: 'WARSTWA 03',
        title: 'Cloudinary Edge Media CDN',
        subtitle: 'Unsigned Preset • 512px WebP • f_auto,q_auto',
        description:
          'Zdjęcia profilowe są walidowane (MIME + limit 5 MB), przycinane w przeglądarce do formatu WebP 512×512 i wysyłane bezpośrednio do Cloudinary z automatyczną transformacją f_auto,q_auto.',
        specs: [
          {label: 'Tryb wysyłania', value: 'Unsigned Upload + Disallow Public ID'},
          {label: 'Transformacja wejściowa', value: 'c_limit,w_512,h_512/f_webp,q_auto'},
          {label: 'Koszt utrzymania', value: '0 PLN (100% Free Tier CDN)'}
        ]
      }
    },

    studioTag: '02 / PERSONALIZACJA NA ŻYWO',
    studioTitle: 'Ustawienia motywu i języka',
    studioSubtitle: 'Przełączaj motyw oraz język interfejsu bezpośrednio z karty — cały starter reaguje natychmiast.',
    themeLabel: 'Motyw kolorystyczny',
    themeLight: 'Jasny',
    themeDark: 'Ciemny',
    themeDisabledHint: 'Tryb ciemny jest obecnie wyłączony w ustawieniach globalnych Firestore.',
    langLabel: 'Język aplikacji (i18n)',

    sessionTag: '03 / TELEMETRIA SESJI',
    sessionTitle: 'Inspektor autoryzacji i flag',
    sessionLoggedAs: 'Zalogowany użytkownik',
    sessionGuestTitle: 'Brak aktywnej sesji',
    sessionGuestDesc: 'Zaloguj się, aby zobaczyć swój profil, role RBAC oraz awatar serwowany z Cloudinary CDN.',
    flagRegister: 'Otwarta rejestracja',
    flagAvatar: 'Zmiana zdjęcia profilowego',
    flagDark: 'Obsługa trybu ciemnego',
    stateEnabled: 'AKTYWNE',
    stateLocked: 'ZABLOKOWANE',

    labTag: '04 / PIASKOWNICA UI',
    labTitle: 'Mikro-interakcje i powiadomienia',
    labSubtitle: 'Przetestuj wbudowane serwisy dialogów potwierdzających oraz pasków powiadomień (Snackbar).',
    btnToast: 'Wywołaj Snackbar',
    btnModal: 'Otwórz modal info',
    btnWarnModal: 'Modal ostrzegawczy',
    toastDemoMsg: '⚡ Powiadomienie Snackbar działa! Architektura Zoneless odświeża widok w mniej niż 1 ms.',
    modalDemoTitle: 'Generyczny System Dialogów',
    modalDemoMsg:
      'Ten popup korzysta z pojedynczego, reużywalnego komponentu DialogComponent z dynamiczną ikoną, kolorami motywu i pełną responsywnością.',
    modalWarnTitle: 'Symulacja ostrzeżenia bezpieczeństwa',
    modalWarnMsg:
      'W ten sposób aplikacja prosi o potwierdzenie przed wrażliwymi operacjami (np. archiwizacją konta lub usunięciem zdjęcia profilowego).',
    modalConfirmBtn: 'Rozumiem',
    modalCancelBtn: 'Zamknij',

    mediaTag: '05 / SYMULATOR KOMPRESJI',
    mediaTitle: 'Potok optymalizacji zdjęć',
    mediaSubtitle: 'Zobacz, jak surowe zdjęcie z telefonu jest odchudzane o 99% przed zapisem w chmurze.',
    stages: {
      raw: {
        label: '1. Plik wejściowy',
        size: '4.80 MB',
        format: 'JPEG / PNG (Z aparatu)',
        dimensions: '4032 × 3024 px',
        savings: 'Walidacja: max 5 MB',
        detail: 'Wstępny filtr w ProfileComponent odrzuca nieobsługiwane formaty MIME oraz pliki przekraczające 5 MB.'
      },
      cropped: {
        label: '2. Cropper WebP',
        size: '42 KB',
        format: 'WebP (w przeglądarce)',
        dimensions: '512 × 512 px (1:1)',
        savings: '-99.1% rozmiaru',
        detail: 'Komponent ngx-image-cropper skaluje wycinek 1:1 i kompresuje go lokalnie do lekkiego kontenera WebP.'
      },
      cdn: {
        label: '3. Cloudinary CDN',
        size: '24 KB',
        format: 'AVIF / WebP (f_auto,q_auto)',
        dimensions: '512 × 512 px (Edge)',
        savings: '-99.5% + Globalny Cache',
        detail: 'Cloudinary zapisuje plik pod nieodgadnionym public_id i serwuje go w locie z parametrami f_auto,q_auto.'
      }
    },

    footerBarTitle: 'Gotowość produkcyjna, RODO i potoki CI/CD',
    footerBarSubtitle:
      'Wbudowane dokumenty prawne (Polityka Prywatności, Regulamin, Cookies) oraz automatyczne wdrożenia GitHub Actions na Firebase Hosting i GitHub Pages.',
    linkPrivacy: 'Polityka prywatności',
    linkTerms: 'Regulamin',
    linkCookies: 'Polityka cookies',
    linkStatus: 'Status wdrożenia'
  },
  en: {
    badge: 'Angular 21 Zoneless • Firebase • Cloudinary CDN',
    heroTitlePrefix: 'Next-generation foundation for',
    heroTitleAccent: 'SaaS applications.',
    heroSubtitle:
      'A production-ready accelerator combining Angular Signals reactivity, Firebase Authentication & Cloud Firestore, and WebP/AVIF image optimization.',
    ctaLogin: 'Sign in or create account',
    ctaProfile: 'Your profile',
    ctaAdmin: 'Admin panel',
    ctaExplore: 'Explore interactive modules',
    welcomeBack: 'Active session:',
    guestMode: 'Preview mode (Guest)',
    metricZonelessLabel: 'Rendering engine',
    metricZonelessValue: '100% Zoneless Signals',
    metricAuthLabel: 'Data security',
    metricAuthValue: 'RBAC + Firestore Rules',
    metricCdnLabel: 'Media optimization',
    metricCdnValue: 'WebP 512px • f_auto,q_auto',

    archTag: '01 / ARCHITECTURE',
    archTitle: 'Interactive data pipeline',
    archSubtitle: 'Click any architectural node below to inspect how requests and security rules flow in real time.',
    archNodes: {
      angular: {
        step: 'LAYER 01',
        title: 'Angular 21 Zoneless UI',
        subtitle: 'Signals • OnPush • Material 3 Bento',
        description:
          'Runs completely free of Zone.js overhead. Every state transition is driven by fine-grained Angular Signals, guaranteeing surgical DOM updates and zero unnecessary change-detection cycles.',
        specs: [
          {label: 'Change detection', value: 'provideZonelessChangeDetection()'},
          {label: 'Component strategy', value: 'ChangeDetectionStrategy.OnPush'},
          {label: 'Design system', value: 'Bento CSS Variables + Dark Mode'}
        ]
      },
      firebase: {
        step: 'LAYER 02',
        title: 'Firebase Auth & Firestore',
        subtitle: 'Google SSO • RBAC Roles • Real-time Sync',
        description:
          'User identity is verified by Firebase Authentication and streamed live from the Cloud Firestore users collection. Strict security rules prevent client-side privilege escalation.',
        specs: [
          {label: 'Identity providers', value: 'Email/Password + Google OAuth 2.0'},
          {label: 'Access control', value: 'ADMIN_PAGE_ACCESS / CORE_SETTINGS'},
          {label: 'Live configuration', value: 'PublicSettingsFacade (Signals)'}
        ]
      },
      cloudinary: {
        step: 'LAYER 03',
        title: 'Cloudinary Edge Media CDN',
        subtitle: 'Unsigned Preset • 512px WebP • f_auto,q_auto',
        description:
          'Profile pictures are validated client-side (MIME + 5 MB cap), cropped in-browser to 512×512 WebP, and uploaded directly to Cloudinary with automatic f_auto,q_auto edge transformations.',
        specs: [
          {label: 'Upload mode', value: 'Unsigned Upload + Disallow Public ID'},
          {label: 'Incoming transform', value: 'c_limit,w_512,h_512/f_webp,q_auto'},
          {label: 'Hosting cost', value: '$0 / month (100% Free Tier CDN)'}
        ]
      }
    },

    studioTag: '02 / LIVE CUSTOMIZATION',
    studioTitle: 'Theme & locale settings',
    studioSubtitle: 'Switch the color theme and interface language right from this card — the entire starter reacts immediately.',
    themeLabel: 'Color theme',
    themeLight: 'Light',
    themeDark: 'Dark',
    themeDisabledHint: 'Dark mode is currently disabled in global Firestore public settings.',
    langLabel: 'Application language (i18n)',

    sessionTag: '03 / SESSION TELEMETRY',
    sessionTitle: 'Auth & feature flags inspector',
    sessionLoggedAs: 'Authenticated user',
    sessionGuestTitle: 'No active session',
    sessionGuestDesc: 'Sign in to inspect your live profile data, RBAC roles, and Cloudinary CDN avatar.',
    flagRegister: 'Open registration',
    flagAvatar: 'Profile photo upload',
    flagDark: 'Dark mode support',
    stateEnabled: 'ACTIVE',
    stateLocked: 'LOCKED',

    labTag: '04 / UI SANDBOX',
    labTitle: 'Micro-interactions & dialogs',
    labSubtitle: 'Trigger the built-in confirmation dialog service and snackbar notifications with a single click.',
    btnToast: 'Trigger Snackbar',
    btnModal: 'Open info modal',
    btnWarnModal: 'Warning modal',
    toastDemoMsg: '⚡ Snackbar notification triggered! Zoneless Signals keep the UI responsive in under 1 ms.',
    modalDemoTitle: 'Unified Dialog System',
    modalDemoMsg:
      'This modal uses the single reusable DialogComponent with custom Material icons, theme-aware colors, and mobile-first sizing.',
    modalWarnTitle: 'Security Confirmation Simulation',
    modalWarnMsg:
      'This is how the application asks for confirmation before sensitive operations (such as archiving a user or removing a profile picture).',
    modalConfirmBtn: 'Got it',
    modalCancelBtn: 'Close',

    mediaTag: '05 / COMPRESSION SIMULATOR',
    mediaTitle: 'Image optimization pipeline',
    mediaSubtitle: 'See how a raw smartphone photo is reduced by over 99% before being stored and served.',
    stages: {
      raw: {
        label: '1. Raw Input',
        size: '4.80 MB',
        format: 'JPEG / PNG (Camera)',
        dimensions: '4032 × 3024 px',
        savings: 'Guard: max 5 MB',
        detail: 'The entry guard in ProfileComponent rejects unsupported MIME types and files exceeding 5 MB.'
      },
      cropped: {
        label: '2. WebP Cropper',
        size: '42 KB',
        format: 'WebP (In-browser)',
        dimensions: '512 × 512 px (1:1)',
        savings: '-99.1% file size',
        detail: 'ngx-image-cropper scales the 1:1 square selection and encodes it locally into a compact WebP Blob.'
      },
      cdn: {
        label: '3. Cloudinary CDN',
        size: '24 KB',
        format: 'AVIF / WebP (f_auto,q_auto)',
        dimensions: '512 × 512 px (Edge)',
        savings: '-99.5% + Global Cache',
        detail: 'Cloudinary stores the file under an unguessable public_id and delivers it with f_auto,q_auto transformations.'
      }
    },

    footerBarTitle: 'Production readiness, GDPR compliance & CI/CD pipelines',
    footerBarSubtitle:
      'Built-in legal pages (Privacy Policy, Terms of Service, Cookie Policy) and automated GitHub Actions deployment to Firebase Hosting & GitHub Pages.',
    linkPrivacy: 'Privacy Policy',
    linkTerms: 'Terms of Service',
    linkCookies: 'Cookie Policy',
    linkStatus: 'Deployment Status'
  }
};

@Component({
  selector: 'app-starter-showcase',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './starter-showcase.component.html',
  styleUrls: ['./starter-showcase.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StarterShowcaseComponent {
  private readonly authService = inject(AuthService);
  private readonly themeService = inject(ThemeService);
  private readonly translateService = inject(CustomTranslateService);
  private readonly publicSettings = inject(PublicSettingsFacade);
  private readonly snackbarService = inject(SnackbarService);
  private readonly dialogService = inject(DialogService);
  private readonly appConfig = inject(APP_CONFIG);

  protected readonly rp = RedirectionEnum;
  protected readonly LanguageEnum = LanguageEnum;

  protected readonly user = this.authService.currentUser;
  protected readonly isLoggedIn = this.authService.isLoggedIn;
  protected readonly allowForRegistering = this.publicSettings.allowForRegistering;
  protected readonly allowForProfilePictureChange = this.publicSettings.allowForProfilePictureChange;
  protected readonly allowDarkMode = this.publicSettings.allowDarkMode;

  protected readonly isDarkTheme = toSignal(this.themeService.isDarkTheme$, {initialValue: false});

  protected readonly activeNode = signal<ArchitectureNodeId>('angular');
  protected readonly activeStage = signal<CompressionStage>('cdn');

  protected readonly currentLang = computed<'pl' | 'en'>(() => {
    const selected = this.translateService.selectedLanguage() || this.appConfig.default_language;
    return selected === LanguageEnum.ENGLISH ? 'en' : 'pl';
  });

  protected readonly copy = computed<ShowcaseCopy>(() => SHOWCASE_DICTIONARY[this.currentLang()]);

  protected readonly currentNodeDetails = computed(() => {
    return this.copy().archNodes[this.activeNode()];
  });

  protected readonly currentStageDetails = computed(() => {
    return this.copy().stages[this.activeStage()];
  });

  protected selectNode(node: ArchitectureNodeId): void {
    this.activeNode.set(node);
  }

  protected selectStage(stage: CompressionStage): void {
    this.activeStage.set(stage);
  }

  protected setTheme(wantDark: boolean): void {
    if (!this.allowDarkMode()) return;
    if (this.isDarkTheme() !== wantDark) {
      this.themeService.toggleTheme();
    }
  }

  protected setLanguage(lang: LanguageEnum): void {
    if (this.currentLang() !== lang) {
      this.translateService.setLanguage(lang);
    }
  }

  protected scrollToPlayground(): void {
    const el = document.getElementById('bento-playground');
    el?.scrollIntoView({behavior: 'smooth', block: 'start'});
  }

  protected triggerDemoToast(): void {
    this.snackbarService.openSnackBar(this.copy().toastDemoMsg);
  }

  protected triggerInfoModal(): void {
    const c = this.copy();
    this.dialogService.openConfirmDialogWithData({
      title: c.modalDemoTitle,
      popupType: DialogType.CONFIRMATION,
      message: c.modalDemoMsg,
      cancelButtonText: null,
      confirmButtonText: c.modalConfirmBtn,
      icon: 'auto_awesome',
      iconColor: 'primary'
    });
  }

  protected triggerWarningModal(): void {
    const c = this.copy();
    this.dialogService.openConfirmDialogWithData({
      title: c.modalWarnTitle,
      popupType: DialogType.WARNING,
      message: c.modalWarnMsg,
      cancelButtonText: c.modalCancelBtn,
      confirmButtonText: c.modalConfirmBtn,
      icon: 'verified_user',
      iconColor: 'accent'
    });
  }
}
