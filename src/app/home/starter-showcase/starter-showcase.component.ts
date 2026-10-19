import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {AuthService} from '../../_services/auth/auth.service';
import {CustomTranslateService} from '../../_services/translate/custom-translate.service';
import {SnackbarService} from '../../_services/util/snackbar.service';
import {DialogService} from '../../_services/util/dialog.service';
import {DialogType} from '../../_models/dialog/dialog-type';
import {RedirectionEnum} from '../../../utils/redirection.enum';
import {LanguageEnum} from '../../_services/translate/language-enum';
import {APP_CONFIG} from '../../app.config.token';
import {firstValueFrom} from 'rxjs';

export type WorkflowStepId = 'security' | 'hierarchy' | 'catalog' | 'search';

export interface DemoItem {
  id: string;
  namePl: string;
  nameEn: string;
  descPl: string;
  descEn: string;
  warehousePl: string;
  warehouseEn: string;
  roomPl: string;
  roomEn: string;
  boxPl: string;
  boxEn: string;
  roomKey: 'garage' | 'basement' | 'office';
  updatedAt: string;
}

interface WorkflowStepDetail {
  stepBadge: string;
  title: string;
  subtitle: string;
  description: string;
  pathPreview: string;
  highlights: {label: string; value: string}[];
}

interface ShowcaseCopy {
  badge: string;
  guestMode: string;
  welcomeBack: string;
  heroTitlePrefix: string;
  heroTitleAccent: string;
  heroSubtitle: string;
  ctaLogin: string;
  ctaExplore: string;
  ctaProfile: string;

  metricHierarchyLabel: string;
  metricHierarchyValue: string;
  metricSecurityLabel: string;
  metricSecurityValue: string;
  metricSearchLabel: string;
  metricSearchValue: string;
  metricSyncLabel: string;
  metricSyncValue: string;

  compareTag: string;
  compareTitle: string;
  compareSubtitle: string;
  guestColBadge: string;
  guestColTitle: string;
  guestColDesc: string;
  guestPoints: string[];
  memberColBadge: string;
  memberColTitle: string;
  memberColDesc: string;
  memberPoints: string[];
  compareCta: string;

  securityTag: string;
  securityTitle: string;
  securitySubtitle: string;
  securityToggleUser: string;
  securityToggleAdmin: string;
  securityUserBadge: string;
  securityUserHeading: string;
  securityUserDesc: string;
  securityAdminBadge: string;
  securityAdminHeading: string;
  securityAdminDesc: string;
  securityInspectPayloadBtn: string;
  securityPillar1Title: string;
  securityPillar1Desc: string;
  securityPillar2Title: string;
  securityPillar2Desc: string;
  securityPillar3Title: string;
  securityPillar3Desc: string;
  dialogSecurityTitle: string;
  dialogSecurityConfirm: string;
  dialogSecurityMessage: string;

  workflowTag: string;
  workflowTitle: string;
  workflowSubtitle: string;
  workflowSteps: Record<WorkflowStepId, WorkflowStepDetail>;

  sandboxTag: string;
  sandboxTitle: string;
  sandboxSubtitle: string;
  sandboxSearchLabel: string;
  sandboxSearchPlaceholder: string;
  roomFilterAll: string;
  roomFilterGarage: string;
  roomFilterBasement: string;
  roomFilterOffice: string;
  sandboxQuickAddBtn: string;
  sandboxResetBtn: string;
  sandboxNoResults: string;
  sandboxInspectBtn: string;
  sandboxMoveBtn: string;
  sandboxDeleteBtn: string;

  workspaceTag: string;
  workspaceTitle: string;
  workspaceSubtitle: string;
  workspaceWarehousesLabel: string;
  workspaceBoxesLabel: string;
  workspaceItemsLabel: string;
  workspaceTreeTitle: string;
  workspaceProfileBadge: string;
  workspaceProfileTitle: string;
  workspaceProfileDesc: string;
  workspaceCta: string;

  toastAddedMsg: string;
  toastMovedMsg: string;
  toastDeletedMsg: string;
  toastResetMsg: string;
  dialogInspectTitle: string;
  dialogInspectConfirm: string;
  dialogDeleteTitle: string;
  dialogDeleteMessage: string;
  dialogDeleteConfirm: string;
  dialogDeleteCancel: string;

  footerBarTitle: string;
  footerBarSubtitle: string;
  linkPrivacy: string;
  linkTerms: string;
  linkCookies: string;
  linkStatus: string;
}

const INITIAL_DEMO_ITEMS: DemoItem[] = [
  {
    id: 'item-1',
    namePl: 'Wkrętarka udarowa DeWalt 18V',
    nameEn: 'DeWalt 18V Impact Driver',
    descPl: 'Z walizką, 2 akumulatory 5Ah i ładowarka',
    descEn: 'With case, 2x 5Ah batteries and charger',
    warehousePl: 'Dom',
    warehouseEn: 'Home',
    roomPl: 'Garaż',
    roomEn: 'Garage',
    boxPl: 'Regał A • Pudełko #1 (Elektronarzędzia)',
    boxEn: 'Rack A • Box #1 (Power Tools)',
    roomKey: 'garage',
    updatedAt: '2026-10-15 18:20'
  },
  {
    id: 'item-2',
    namePl: 'Multimetr cyfrowy Fluke 115',
    nameEn: 'Fluke 115 Digital Multimeter',
    descPl: 'Przewody pomiarowe + zapasowa bateria 9V',
    descEn: 'Test leads + spare 9V battery',
    warehousePl: 'Dom',
    warehouseEn: 'Home',
    roomPl: 'Garaż',
    roomEn: 'Garage',
    boxPl: 'Regał A • Pudełko #2 (Pomiary)',
    boxEn: 'Rack A • Box #2 (Diagnostics)',
    roomKey: 'garage',
    updatedAt: '2026-10-16 11:05'
  },
  {
    id: 'item-3',
    namePl: 'Lampki choinkowe LED (ciepły biały)',
    nameEn: 'Christmas LED String Lights (Warm White)',
    descPl: '300 LED, zewnętrzne IP44, przedłużacz 5m',
    descEn: '300 LED, outdoor IP44, 5m extension cord',
    warehousePl: 'Dom',
    warehouseEn: 'Home',
    roomPl: 'Piwnica',
    roomEn: 'Basement',
    boxPl: 'Pudełko #4 (Dekoracje zimowe)',
    boxEn: 'Box #4 (Winter Decorations)',
    roomKey: 'basement',
    updatedAt: '2026-10-12 09:40'
  },
  {
    id: 'item-4',
    namePl: 'Kabel Thunderbolt 4 / USB-C (2m)',
    nameEn: 'Thunderbolt 4 / USB-C Cable (2m)',
    descPl: 'Obsługa 100W PD oraz monitora 8K 60Hz',
    descEn: 'Supports 100W PD and 8K 60Hz display',
    warehousePl: 'Dom',
    warehouseEn: 'Home',
    roomPl: 'Domowe Biuro',
    roomEn: 'Home Office',
    boxPl: 'Organizer #1 (Kable i adaptery)',
    boxEn: 'Organizer #1 (Cables & Adapters)',
    roomKey: 'office',
    updatedAt: '2026-10-18 14:15'
  }
];

const SHOWCASE_DICTIONARY: Record<'pl' | 'en', ShowcaseCopy> = {
  pl: {
    badge: 'INTELIGENTNA INWENTARYZACJA DOMU I WARSZTATU',
    guestMode: 'Tryb podglądu (Gość)',
    welcomeBack: 'Witaj ponownie,',
    heroTitlePrefix: 'Zapanuj nad każdym przedmiotem.',
    heroTitleAccent: 'Magazyny, pokoje i pudełka w jednym miejscu.',
    heroSubtitle:
      'Mój magazyn to przejrzysta aplikacja do katalogowania rzeczy w domu, garażu, piwnicy czy firmowym schowku. Zbuduj strukturę lokalizacji i znajdź dowolny przedmiot w mniej niż sekundę.',
    ctaLogin: 'Zaloguj się lub załóż konto',
    ctaExplore: 'Zobacz jak to działa',
    ctaProfile: 'Twój profil',

    metricHierarchyLabel: 'Struktura 4 poziomów',
    metricHierarchyValue: 'Magazyn → Pokój → Pudełko → Przedmiot',
    metricSecurityLabel: 'Szyfrowanie Zero-Knowledge',
    metricSecurityValue: 'AES-256-GCM bezpośrednio w Twojej przeglądarce',
    metricSearchLabel: 'Błyskawiczna wyszukiwarka',
    metricSearchValue: 'Filtrowanie po nazwie, opisie i pokoju',
    metricSyncLabel: 'Synchronizacja w chmurze',
    metricSyncValue: 'Dostęp z telefonu i komputera 24/7',

    compareTag: '01 / CO ZYSKUJESZ PO ZALOGOWANIU',
    compareTitle: 'Tryb Gościa vs. Konto Użytkownika',
    compareSubtitle:
      'Przetestuj interaktywne przykłady na tej stronie bez zakładania konta, a gdy będziesz gotowy — zaloguj się, aby stworzyć własną bazę przedmiotów w chmurze.',
    guestColBadge: 'BEZ LOGOWANIA (TERAZ)',
    guestColTitle: 'Interaktywne Demo Gościa',
    guestColDesc: 'Poznaj możliwości aplikacji na przygotowanych danych przykładowych:',
    guestPoints: [
      'Przeklikanie kroków przepływu organizacji i architektury bezpieczeństwa',
      'Wyszukiwanie i filtrowanie przykładowych przedmiotów na żywo',
      'Symulacja dodawania, przenoszenia i usuwania rzeczy w demo',
      'Dostęp do stron informacyjnych, statusu i dokumentów prawnych'
    ],
    memberColBadge: 'PO ZALOGOWANIU (STANDARDOWY UŻYTKOWNIK)',
    memberColTitle: 'Twój Osobisty Magazyn w Chmurze',
    memberColDesc: 'Pełna funkcjonalność biznesowa z trwałym zapisem w Cloud Firestore:',
    memberPoints: [
      'Pełne szyfrowanie Zero-Knowledge AES-256-GCM — nikt poza Tobą nie ma wglądu w Twoje rzeczy',
      'Tworzenie własnych magazynów, pokoi, pudełek i przedmiotów bez limitów',
      'Przenoszenie przedmiotów między pudełkami oraz pudełek między pokojami',
      'Globalna wyszukiwarka wszystkich Twoich rzeczy z bezpośrednim skokiem do pudełka',
      'Automatyczne znaczniki czasu utworzenia i modyfikacji, awatar i praca na wielu urządzeniach'
    ],
    compareCta: 'Przejdź do logowania i zacznij katalogować',

    securityTag: '02 / ARCHITEKTURA BEZPIECZEŃSTWA ZERO-KNOWLEDGE',
    securityTitle: 'Twoje przedmioty są widoczne tylko i wyłącznie dla Ciebie',
    securitySubtitle:
      'Stosujemy kryptografię po stronie klienta (Client-Side Encryption). Cała zawartość Twoich magazynów jest szyfrowana zanim opuści Twoje urządzenie. Ani administratorzy bazy, ani dostawcy chmury nie mają możliwości odczytania Twoich danych.',
    securityToggleUser: 'Twój widok (Twoje urządzenie)',
    securityToggleAdmin: 'Widok administratora (Baza Firestore)',
    securityUserBadge: 'ODSZYFROWANE LOKALNIE • KLUCZ TYLKO W RAM TWOJEGO URZĄDZENIA',
    securityUserHeading: 'Przejrzysta struktura Twojego magazynu',
    securityUserDesc:
      'Na Twoim komputerze lub telefonie wpisujesz swój 4-cyfrowy PIN, który odblokowuje klucz AES-256-GCM. Dane są odszyfrowywane wyłącznie w pamięci operacyjnej przeglądarki podczas Twojej sesji.',
    securityAdminBadge: 'CO WIDZI BAZA DANYCH FIRESTORE • ZASZYFROWANY CIĄG BAJTÓW',
    securityAdminHeading: 'Kryptograficzna czarna skrzynka',
    securityAdminDesc:
      'Nawet w przypadku bezpośredniego wglądu w bazę danych, administrator widzi wyłącznie losowy ciąg zaszyfrowanych bajtów (AES-256-GCM). Brak hasła, PIN-u lub klucza odzyskiwania uniemożliwia odczytanie choćby jednej nazwy przedmiotu.',
    securityInspectPayloadBtn: 'Sprawdź surowy rekord bazy (JSON)',
    securityPillar1Title: 'Klucz nigdy nie opuszcza urządzenia',
    securityPillar1Desc:
      'Klucz kryptograficzny jest generowany lokalnie za pomocą PBKDF2 (100 000 powtórzeń SHA-256) z Twojego hasła i 4-cyfrowego PIN-u. Serwery aplikacji nigdy go nie widzą.',
    securityPillar2Title: 'Standard AES-256-GCM',
    securityPillar2Desc:
      'Wojskowy standard szyfrowania z wbudowanym tagiem uwierzytelniającym (GCM). Chroni nie tylko przed podejrzeniem zawartości, ale też przed jakąkolwiek manipulacją danymi.',
    securityPillar3Title: 'Klucz odzyskiwania & Zero Backdoor',
    securityPillar3Desc:
      'Nie posiadamy "tylnych drzwi" ani możliwości resetu hasła z podglądem danych. Jeśli zapomnisz hasła lub PIN-u, jedynym ratunkiem jest Twój osobisty klucz odzyskiwania wygenerowany przy konfiguracji.',
    dialogSecurityTitle: 'Surowy dokument Firestore (Widok Bazy / Administratora)',
    dialogSecurityConfirm: 'Rozumiem, dane są w 100% bezpieczne',
    dialogSecurityMessage:
      'Poniżej znajduje się rzeczywisty format danych zapisywany w Cloud Firestore. Zero czytelnych nazw, brak nazw pokoi i pudełek — wyłącznie kryptogram AES-256-GCM:',

    workflowTag: '03 / GŁÓWNY PRZEPŁYW PRACY',
    workflowTitle: 'Jak działa organizacja w 4 prostych krokach',
    workflowSubtitle: 'Kliknij dowolny krok poniżej, aby zobaczyć jak aplikacja porządkuje Twoje przedmioty.',
    workflowSteps: {
      security: {
        stepBadge: 'KROK 01 • SZYFROWANIE ZERO-KNOWLEDGE',
        title: 'Zabezpiecz magazyn swoim PIN-em',
        subtitle: 'Lokalny klucz AES-256-GCM i klucz odzyskiwania',
        description:
          'Przy pierwszym logowaniu konfigurujesz 4-cyfrowy PIN, który natychmiast szyfruje Twój magazyn. Otrzymujesz także 32-znakowy awaryjny klucz odzyskiwania na wypadek utraty hasła. Wszystkie operacje kryptograficzne wykonuje Twoja przeglądarka.',
        pathPreview: 'PIN (4 cyfry)  ➔  PBKDF2 (100k)  ➔  Klucz AES-256-GCM w pamięci RAM',
        highlights: [
          {label: 'Zero-Knowledge', value: 'Serwer nie zna Twojego PIN-u ani klucza deszyfrującego'},
          {label: 'Algorytm', value: 'AES-256-GCM z unikalnym wektorem inicjalizacyjnym IV'},
          {label: 'Klucz awaryjny', value: 'Kryptograficzny token odzyskiwania zapisywany offline'}
        ]
      },
      hierarchy: {
        stepBadge: 'KROK 02 • STRUKTURA',
        title: 'Zbuduj hierarchię swoich miejsc',
        subtitle: 'Magazyny → Pokoje → Pudełka',
        description:
          'Zamiast jednej chaotycznej listy, odwzorowujesz rzeczywisty układ swoich przestrzeni. Tworzysz magazyn (np. Dom, Warsztat, Działka), dzielisz go na pokoje lub strefy, a wewnątrz umieszczasz opisane pudełka i regały.',
        pathPreview: 'Dom  →  Garaż  →  Regał A • Pudełko #1',
        highlights: [
          {label: 'Nawigacja kafelkowa', value: 'Szybkie wchodzenie w głąb jednym kliknięciem'},
          {label: 'Auto-start', value: 'Automatyczne otwarcie, gdy masz 1 magazyn'},
          {label: 'Śledzenie zmian', value: 'Data modyfikacji aktualizowana dla całego drzewa'}
        ]
      },
      catalog: {
        stepBadge: 'KROK 03 • KATALOGOWANIE I RUCH',
        title: 'Dodawaj i przenoś przedmioty oraz pudełka',
        subtitle: 'Elastyczna edycja i zmiana lokalizacji',
        description:
          'W każdym pudełku zapisujesz przedmioty wraz z dokładnym opisem (np. parametry, zapasowe części). Przekładasz rzecz do innego kartonu albo przenosisz całe pudełko z garażu do piwnicy? Zmieniasz lokalizację z listy rozwijanej bez ponownego wpisywania.',
        pathPreview: 'Przenieś: Regał A • Pudełko #1  ➔  Piwnica • Pudełko #4',
        highlights: [
          {label: 'Przenoszenie przedmiotu', value: 'Wybór docelowego magazynu, pokoju i pudełka'},
          {label: 'Przenoszenie pudełka', value: 'Relokacja całego kartonu wraz z zawartością'},
          {label: 'Bezpieczeństwo', value: 'Okno potwierdzenia przed każdym usunięciem'}
        ]
      },
      search: {
        stepBadge: 'KROK 04 • WYSZUKIWANIE',
        title: 'Znajdź dowolną rzecz w ułamku sekundy',
        subtitle: 'Globalny filtr tekstowy i zawężanie do pokoi',
        description:
          'Nie pamiętasz, w którym kartonie schowałeś lampki świąteczne lub multimetr? Wpisz fragment nazwy lub opisu w zakładce Wyszukaj, zawęź wyniki do wybranych pokoi i jednym kliknięciem otwórz dokładnie to pudełko, w którym leży przedmiot.',
        pathPreview: 'Szukaj: „multimetr”  ➔  Znaleziono w: Garaż → Regał A • Pudełko #2',
        highlights: [
          {label: 'Pełny tekst', value: 'Przeszukuje nazwy, opisy oraz ścieżki lokalizacji'},
          {label: 'Filtr wielokrotny', value: 'Wybór konkretnych pokoi z grup magazynów'},
          {label: 'Skok do pudełka', value: 'Przycisk otwiera od razu docelowe pudełko'}
        ]
      }
    },

    sandboxTag: '04 / INTERAKTYWNE DEMO NA ŻYWO',
    sandboxTitle: 'Przetestuj wyszukiwarkę i operacje na przedmiotach',
    sandboxSubtitle:
      'Poniżej znajduje się działająca miniatura Twojego przyszłego magazynu. Filtruj przedmioty po frazie lub pokoju, dodaj przykładowy element albo przetestuj podgląd lokalizacji.',
    sandboxSearchLabel: 'Szukaj przedmiotu (nazwa, opis, pudełko)',
    sandboxSearchPlaceholder: 'Np. wkrętarka, kabel, LED...',
    roomFilterAll: 'Wszystkie pokoje',
    roomFilterGarage: 'Garaż',
    roomFilterBasement: 'Piwnica',
    roomFilterOffice: 'Domowe Biuro',
    sandboxQuickAddBtn: 'Dodaj przykładowy przedmiot',
    sandboxResetBtn: 'Przywróć domyślne',
    sandboxNoResults: 'Brak przedmiotów pasujących do wybranego filtra.',
    sandboxInspectBtn: 'Szczegóły ścieżki',
    sandboxMoveBtn: 'Symuluj przeniesienie',
    sandboxDeleteBtn: 'Usuń z podglądu',

    workspaceTag: '05 / PODGLĄD KONTA PO ZALOGOWANIU',
    workspaceTitle: 'Twoja przestrzeń robocza i profil',
    workspaceSubtitle:
      'Po zalogowaniu w miejsce tej strony startowej od razu otwiera się Twój interaktywny widok magazynów.',
    workspaceWarehousesLabel: 'Magazyny',
    workspaceBoxesLabel: 'Pudełka',
    workspaceItemsLabel: 'Przedmioty w bazie',
    workspaceTreeTitle: 'Przykładowe drzewo Twojego konta',
    workspaceProfileBadge: 'KONTO STANDARDOWEGO UŻYTKOWNIKA',
    workspaceProfileTitle: 'Spersonalizowany profil i szybki dostęp',
    workspaceProfileDesc:
      'Zarządzaj swoimi danymi, ustaw własne zdjęcie profilowe (automatycznie przycinane i optymalizowane) i korzystaj z wygodnego przełącznika języka oraz motywu.',
    workspaceCta: 'Załóż darmowe konto lub zaloguj się',

    toastAddedMsg: 'Dodano przykładowy przedmiot do pudełka w aplikacji demo! Po zalogowaniu zmiany zapisują się w chmurze.',
    toastMovedMsg: 'Przeniesiono przedmiot do innego pokoju i zaktualizowano datę modyfikacji!',
    toastDeletedMsg: 'Przedmiot został usunięty z podglądu demo.',
    toastResetMsg: 'Przywrócono początkową listę przykładowych przedmiotów.',
    dialogInspectTitle: 'Pełna ścieżka lokalizacji w magazynie',
    dialogInspectConfirm: 'Zamknij podgląd',
    dialogDeleteTitle: 'Potwierdź usunięcie (Symulacja)',
    dialogDeleteMessage: 'Czy na pewno chcesz usunąć ten przedmiot z przykładowego pudełka? W pełnej wersji chroni to przed przypadkową utratą danych.',
    dialogDeleteConfirm: 'Usuń z demo',
    dialogDeleteCancel: 'Anuluj',

    footerBarTitle: 'Przejrzyste zasady, prywatność RODO i status usługi',
    footerBarSubtitle:
      'Twoje dane magazynowe należą wyłącznie do Ciebie. Zapoznaj się z dokumentacją prawną oraz statusem wdrożenia aplikacji.',
    linkPrivacy: 'Polityka prywatności',
    linkTerms: 'Regulamin',
    linkCookies: 'Polityka cookies',
    linkStatus: 'Status systemu'
  },
  en: {
    badge: 'SMART HOME & WORKSHOP INVENTORY',
    guestMode: 'Preview mode (Guest)',
    welcomeBack: 'Welcome back,',
    heroTitlePrefix: 'Keep track of every single item.',
    heroTitleAccent: 'Warehouses, rooms, and boxes in one place.',
    heroSubtitle:
      'My warehouse is a clean, intuitive application for cataloging items across your home, garage, basement, or storage unit. Build a clear location hierarchy and find anything in under a second.',
    ctaLogin: 'Sign in or create account',
    ctaExplore: 'See how it works',
    ctaProfile: 'Your profile',

    metricHierarchyLabel: '4-level hierarchy',
    metricHierarchyValue: 'Warehouse → Room → Box → Item',
    metricSecurityLabel: 'Zero-Knowledge Encryption',
    metricSecurityValue: 'Client-side AES-256-GCM in your browser',
    metricSearchLabel: 'Instant global search',
    metricSearchValue: 'Filter by name, description & room',
    metricSyncLabel: 'Real-time cloud sync',
    metricSyncValue: 'Access on phone & desktop 24/7',

    compareTag: '01 / WHAT UNLOCKS AFTER SIGN-IN',
    compareTitle: 'Guest Preview vs. Standard User Account',
    compareSubtitle:
      'Explore interactive examples right here without an account, and when you are ready — sign in to build your own personal cloud inventory.',
    guestColBadge: 'WITHOUT LOGIN (RIGHT NOW)',
    guestColTitle: 'Interactive Guest Demo',
    guestColDesc: 'Explore how the application works using pre-populated sample data:',
    guestPoints: [
      'Click through the organization workflow and security architecture steps',
      'Search and filter sample inventory items in real time',
      'Simulate adding, moving, and deleting items in the live sandbox',
      'Browse service overview, system status, and legal documentation'
    ],
    memberColBadge: 'WITH LOGIN (STANDARD USER)',
    memberColTitle: 'Your Personal Cloud Inventory',
    memberColDesc: 'Full business functionality backed by persistent Cloud Firestore storage:',
    memberPoints: [
      'Full Zero-Knowledge AES-256-GCM encryption — absolutely no one else can read your items',
      'Create unlimited custom warehouses, rooms, boxes, and items',
      'Move items between boxes or relocate entire boxes across rooms',
      'Global search across all your items with one-click jump into the target box',
      'Automatic creation and modification timestamps, avatar cropper, and multi-device sync'
    ],
    compareCta: 'Go to sign in and start cataloging',

    securityTag: '02 / ZERO-KNOWLEDGE SECURITY ARCHITECTURE',
    securityTitle: 'Your items are visible only and exclusively to you',
    securitySubtitle:
      'We use end-to-end client-side encryption. The entire contents of your storage are encrypted before leaving your device. Neither database administrators nor cloud providers hold the key to read your data.',
    securityToggleUser: 'Your view (Your device)',
    securityToggleAdmin: 'Admin view (Firestore database)',
    securityUserBadge: 'LOCALLY DECRYPTED • KEY RESIDES ONLY IN DEVICE RAM',
    securityUserHeading: 'Clear view of your organized inventory',
    securityUserDesc:
      'On your phone or desktop, your 4-digit PIN unlocks the AES-256-GCM key. Data is decrypted strictly in the browser\'s volatile memory for the duration of your session.',
    securityAdminBadge: 'WHAT FIRESTORE SEES • ENCRYPTED CIPHERTEXT BYTES',
    securityAdminHeading: 'Cryptographic black box',
    securityAdminDesc:
      'Even with full database access, an administrator sees only a random stream of encrypted ciphertext bytes (AES-256-GCM). Without your login password, PIN, or Emergency Recovery Key, it is mathematically impossible to read a single item name.',
    securityInspectPayloadBtn: 'Inspect raw database record (JSON)',
    securityPillar1Title: 'Key never leaves your device',
    securityPillar1Desc:
      'Your cryptographic key is derived locally via PBKDF2 (100,000 SHA-256 iterations) from your password and 4-digit PIN. The servers never receive or store it.',
    securityPillar2Title: 'Military-grade AES-256-GCM',
    securityPillar2Desc:
      'Authenticated encryption standard with built-in integrity verification (GCM). Guarantees both absolute secrecy and tamper resistance against unauthorized modifications.',
    securityPillar3Title: 'Emergency Recovery & Zero Backdoors',
    securityPillar3Desc:
      'There are no administrative backdoors or master passwords. If you ever forget your PIN or password, your personal offline Emergency Recovery Key is the only way to restore access.',
    dialogSecurityTitle: 'Raw Firestore Document (Database / Admin View)',
    dialogSecurityConfirm: 'Understood, my data is 100% private',
    dialogSecurityMessage:
      'Below is the exact data layout stored in Cloud Firestore. Zero readable item titles, no room or box names — strictly AES-256-GCM ciphertext:',

    workflowTag: '03 / CORE BUSINESS WORKFLOW',
    workflowTitle: 'How organization works in 4 simple steps',
    workflowSubtitle: 'Click any step below to see how the application keeps your storage structured.',
    workflowSteps: {
      security: {
        stepBadge: 'STEP 01 • ZERO-KNOWLEDGE ENCRYPTION',
        title: 'Secure your vault with a 4-digit PIN',
        subtitle: 'Local AES-256-GCM key & recovery certificate',
        description:
          'On your first sign-in, you choose a 4-digit PIN that instantly encrypts your vault. You are also issued a 32-character Emergency Recovery Key in case you ever lose your credentials. All cryptographic operations run inside your browser.',
        pathPreview: 'PIN (4 digits)  ➔  PBKDF2 (100k)  ➔  AES-256-GCM in RAM memory',
        highlights: [
          {label: 'Zero-Knowledge', value: 'Server never knows your PIN or decryption key'},
          {label: 'Algorithm', value: 'AES-256-GCM with unique 12-byte initialization vector'},
          {label: 'Emergency key', value: 'Cryptographic offline recovery token for disaster restore'}
        ]
      },
      hierarchy: {
        stepBadge: 'STEP 02 • STRUCTURE',
        title: 'Build your location hierarchy',
        subtitle: 'Warehouses → Rooms → Boxes',
        description:
          'Instead of one messy flat list, mirror the real layout of your spaces. Create a warehouse (e.g., Home, Workshop, Storage Unit), divide it into rooms or zones, and place labeled boxes or shelves inside.',
        pathPreview: 'Home  →  Garage  →  Rack A • Box #1',
        highlights: [
          {label: 'Tile navigation', value: 'Drill down into rooms and boxes with a click'},
          {label: 'Smart auto-entry', value: 'Automatically opens your box if you have 1 path'},
          {label: 'Activity roll-up', value: 'Latest modification date bubbles up the tree'}
        ]
      },
      catalog: {
        stepBadge: 'STEP 03 • CATALOG & RELOCATE',
        title: 'Add and move items or entire boxes',
        subtitle: 'Flexible editing and location transfer',
        description:
          'Inside each box, record items with detailed descriptions (specs, spare parts, notes). Moving an item to another bin or relocating a whole box from the garage to the basement? Pick the new destination from a dropdown without retyping.',
        pathPreview: 'Relocate: Rack A • Box #1  ➔  Basement • Box #4',
        highlights: [
          {label: 'Item relocation', value: 'Select target warehouse, room, and box'},
          {label: 'Box relocation', value: 'Move an entire box with all its items intact'},
          {label: 'Safety prompts', value: 'Confirmation dialog before any deletion'}
        ]
      },
      search: {
        stepBadge: 'STEP 04 • INSTANT SEARCH',
        title: 'Locate any item in a split second',
        subtitle: 'Global text filter and multi-room selector',
        description:
          'Forgot which bin holds the holiday lights or digital multimeter? Type any keyword from the name or description in the Search tab, narrow down by rooms, and jump straight into the exact box with one click.',
        pathPreview: 'Search: "multimeter"  ➔  Found in: Garage → Rack A • Box #2',
        highlights: [
          {label: 'Full-text match', value: 'Matches item names, descriptions & location paths'},
          {label: 'Room multi-select', value: 'Filter by specific rooms grouped by warehouse'},
          {label: 'Direct box jump', value: 'Opens the exact target box view immediately'}
        ]
      }
    },

    sandboxTag: '04 / LIVE INTERACTIVE SANDBOX',
    sandboxTitle: 'Test item search & box operations right now',
    sandboxSubtitle:
      'Below is a live miniature version of the warehouse engine. Filter sample items by keyword or room, add a demo item, or inspect its location path.',
    sandboxSearchLabel: 'Search items (name, description, box)',
    sandboxSearchPlaceholder: 'E.g. driver, cable, LED...',
    roomFilterAll: 'All rooms',
    roomFilterGarage: 'Garage',
    roomFilterBasement: 'Basement',
    roomFilterOffice: 'Home Office',
    sandboxQuickAddBtn: 'Add sample item',
    sandboxResetBtn: 'Reset sample data',
    sandboxNoResults: 'No items match the current filter criteria.',
    sandboxInspectBtn: 'Inspect path',
    sandboxMoveBtn: 'Simulate move',
    sandboxDeleteBtn: 'Remove from demo',

    workspaceTag: '05 / POST-LOGIN WORKSPACE PREVIEW',
    workspaceTitle: 'Your personal workspace & profile',
    workspaceSubtitle:
      'Once signed in, this landing page is replaced directly by your live interactive warehouse manager.',
    workspaceWarehousesLabel: 'Warehouses',
    workspaceBoxesLabel: 'Boxes',
    workspaceItemsLabel: 'Cataloged items',
    workspaceTreeTitle: 'Sample account hierarchy preview',
    workspaceProfileBadge: 'STANDARD USER ACCOUNT',
    workspaceProfileTitle: 'Personalized profile & preferences',
    workspaceProfileDesc:
      'Manage your personal details, upload a custom profile picture (with built-in square cropper), and switch seamlessly between Polish/English and Light/Dark themes.',
    workspaceCta: 'Create free account or sign in',

    toastAddedMsg: 'Sample item added to the sandbox box! After login, all changes are saved to Cloud Firestore.',
    toastMovedMsg: 'Item relocated to another room and modification timestamp updated!',
    toastDeletedMsg: 'Item removed from the guest sandbox preview.',
    toastResetMsg: 'Sample inventory list restored to default state.',
    dialogInspectTitle: 'Full Warehouse Location Path',
    dialogInspectConfirm: 'Close preview',
    dialogDeleteTitle: 'Confirm Deletion (Simulation)',
    dialogDeleteMessage: 'Are you sure you want to remove this item from the sample box? When logged in, this confirmation prevents accidental data loss.',
    dialogDeleteConfirm: 'Remove from demo',
    dialogDeleteCancel: 'Cancel',

    footerBarTitle: 'Transparent terms, GDPR privacy & service status',
    footerBarSubtitle:
      'Your inventory data belongs strictly to you. Review our legal policies and live deployment status at any time.',
    linkPrivacy: 'Privacy Policy',
    linkTerms: 'Terms of Service',
    linkCookies: 'Cookie Policy',
    linkStatus: 'System Status'
  }
};

@Component({
  selector: 'app-starter-showcase',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule],
  templateUrl: './starter-showcase.component.html',
  styleUrls: ['./starter-showcase.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StarterShowcaseComponent {
  private readonly authService = inject(AuthService);
  private readonly translateService = inject(CustomTranslateService);
  private readonly snackbarService = inject(SnackbarService);
  private readonly dialogService = inject(DialogService);
  private readonly appConfig = inject(APP_CONFIG);

  protected readonly rp = RedirectionEnum;

  protected readonly user = this.authService.currentUser;
  protected readonly isLoggedIn = this.authService.isLoggedIn;

  protected readonly activeStep = signal<WorkflowStepId>('security');
  protected readonly securityViewMode = signal<'user' | 'admin'>('user');
  protected readonly searchQuery = signal<string>('');
  protected readonly selectedRoomFilter = signal<'all' | 'garage' | 'basement' | 'office'>('all');
  protected readonly demoItems = signal<DemoItem[]>(INITIAL_DEMO_ITEMS);
  private addedCounter = 0;

  protected readonly currentLang = computed<'pl' | 'en'>(() => {
    const selected = this.translateService.selectedLanguage() || this.appConfig.default_language;
    return selected === LanguageEnum.ENGLISH ? 'en' : 'pl';
  });

  protected readonly copy = computed<ShowcaseCopy>(() => SHOWCASE_DICTIONARY[this.currentLang()]);

  protected readonly currentStepDetails = computed<WorkflowStepDetail>(() => {
    return this.copy().workflowSteps[this.activeStep()];
  });

  protected readonly filteredDemoItems = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const room = this.selectedRoomFilter();
    const lang = this.currentLang();

    return this.demoItems().filter(item => {
      const matchesRoom = room === 'all' || item.roomKey === room;
      if (!matchesRoom) return false;
      if (!query) return true;

      const name = (lang === 'en' ? item.nameEn : item.namePl).toLowerCase();
      const desc = (lang === 'en' ? item.descEn : item.descPl).toLowerCase();
      const box = (lang === 'en' ? item.boxEn : item.boxPl).toLowerCase();
      const roomName = (lang === 'en' ? item.roomEn : item.roomPl).toLowerCase();

      return name.includes(query) || desc.includes(query) || box.includes(query) || roomName.includes(query);
    });
  });

  protected selectStep(step: WorkflowStepId): void {
    this.activeStep.set(step);
  }

  protected setSecurityViewMode(mode: 'user' | 'admin'): void {
    this.securityViewMode.set(mode);
  }

  protected openAdminInspectorDemo(): void {
    const c = this.copy();
    const rawPayload = JSON.stringify(
      {
        userId: 'u_9x8f72a1e0b',
        vaultVersion: 1,
        algorithm: 'AES-256-GCM',
        salt: '8f4c2b9a10d3e5f7618294a5c3b1e7f9',
        iv: 'c2e8b19f04d73a6e8b2c1f5a',
        encryptedPayload: '7d9e1f3a8b2c4e6f3b0c1a9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f...[8192 bytes of high-entropy AES-256-GCM ciphertext]...4a0c8b',
        authTag: '5f9b1c2d3e4a7b8c',
        adminAccess: 'DENIED — NO PRIVATE KEY ON SERVER',
        humanReadableText: 'NULL — ZERO KNOWLEDGE ARCHITECTURE'
      },
      null,
      2
    );

    this.dialogService.openConfirmDialogWithData({
      title: c.dialogSecurityTitle,
      popupType: DialogType.CONFIRMATION,
      message: `${c.dialogSecurityMessage}\n\n${rawPayload}`,
      cancelButtonText: null,
      confirmButtonText: c.dialogSecurityConfirm,
      icon: 'lock',
      iconColor: 'primary'
    });
  }

  protected onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value ?? '';
    this.searchQuery.set(value);
  }

  protected setRoomFilter(room: 'all' | 'garage' | 'basement' | 'office'): void {
    this.selectedRoomFilter.set(room);
  }

  protected addSampleItem(): void {
    this.addedCounter++;
    const samples: Omit<DemoItem, 'id' | 'updatedAt'>[] = [
      {
        namePl: `Klucz dynamometryczny 1/2" (#${this.addedCounter})`,
        nameEn: `Torque Wrench 1/2" (#${this.addedCounter})`,
        descPl: 'Zakres 40-200 Nm, certyfikat kalibracji w etui',
        descEn: 'Range 40-200 Nm, calibration certificate in case',
        warehousePl: 'Dom',
        warehouseEn: 'Home',
        roomPl: 'Garaż',
        roomEn: 'Garage',
        boxPl: 'Regał B • Pudełko #3 (Narzędzia ręczne)',
        boxEn: 'Rack B • Box #3 (Hand Tools)',
        roomKey: 'garage'
      },
      {
        namePl: `Dysk zewnętrzny SSD 2TB NVMe (#${this.addedCounter})`,
        nameEn: `External SSD 2TB NVMe (#${this.addedCounter})`,
        descPl: 'Kopie zapasowe zdjęć z lat 2022–2026 + kabel USB-C',
        descEn: 'Photo backups 2022–2026 + USB-C cord',
        warehousePl: 'Dom',
        warehouseEn: 'Home',
        roomPl: 'Domowe Biuro',
        roomEn: 'Home Office',
        boxPl: 'Organizer #2 (Nośniki danych)',
        boxEn: 'Organizer #2 (Storage Media)',
        roomKey: 'office'
      }
    ];

    const template = samples[(this.addedCounter - 1) % samples.length];
    const newItem: DemoItem = {
      ...template,
      id: `demo-added-${this.addedCounter}`,
      updatedAt: '2026-10-18 21:45'
    };

    this.demoItems.update(list => [newItem, ...list]);
    this.snackbarService.openShortSnackBar(this.copy().toastAddedMsg);
  }

  protected simulateMoveItem(item: DemoItem): void {
    const nextRoomMap: Record<'garage' | 'basement' | 'office', {
      roomKey: 'garage' | 'basement' | 'office';
      roomPl: string;
      roomEn: string;
      boxPl: string;
      boxEn: string;
    }> = {
      garage: {
        roomKey: 'basement',
        roomPl: 'Piwnica',
        roomEn: 'Basement',
        boxPl: 'Pudełko #5 (Przeniesione z garażu)',
        boxEn: 'Box #5 (Moved from Garage)'
      },
      basement: {
        roomKey: 'office',
        roomPl: 'Domowe Biuro',
        roomEn: 'Home Office',
        boxPl: 'Szafka B • Pudełko #2',
        boxEn: 'Cabinet B • Box #2'
      },
      office: {
        roomKey: 'garage',
        roomPl: 'Garaż',
        roomEn: 'Garage',
        boxPl: 'Regał A • Pudełko #1 (Elektronarzędzia)',
        boxEn: 'Rack A • Box #1 (Power Tools)'
      }
    };

    const target = nextRoomMap[item.roomKey];
    this.demoItems.update(list =>
      list.map(existing =>
        existing.id === item.id
          ? {
              ...existing,
              roomKey: target.roomKey,
              roomPl: target.roomPl,
              roomEn: target.roomEn,
              boxPl: target.boxPl,
              boxEn: target.boxEn,
              updatedAt: '2026-10-18 21:46'
            }
          : existing
      )
    );
    this.snackbarService.openShortSnackBar(this.copy().toastMovedMsg);
  }

  protected inspectItemPath(item: DemoItem): void {
    const lang = this.currentLang();
    const c = this.copy();
    const name = lang === 'en' ? item.nameEn : item.namePl;
    const desc = lang === 'en' ? item.descEn : item.descPl;
    const path =
      lang === 'en'
        ? `${item.warehouseEn} → ${item.roomEn} → ${item.boxEn}`
        : `${item.warehousePl} → ${item.roomPl} → ${item.boxPl}`;

    this.dialogService.openConfirmDialogWithData({
      title: c.dialogInspectTitle,
      popupType: DialogType.CONFIRMATION,
      message: `${name} — ${desc} (${path})`,
      cancelButtonText: null,
      confirmButtonText: c.dialogInspectConfirm,
      icon: 'location_on',
      iconColor: 'primary'
    });
  }

  protected async removeDemoItem(itemId: string): Promise<void> {
    const c = this.copy();
    const dialogRef = this.dialogService.openConfirmDialogWithData({
      title: c.dialogDeleteTitle,
      popupType: DialogType.WARNING,
      message: c.dialogDeleteMessage,
      cancelButtonText: c.dialogDeleteCancel,
      confirmButtonText: c.dialogDeleteConfirm,
      icon: 'delete_outline',
      iconColor: 'warn'
    });

    const confirmed = await firstValueFrom(dialogRef.afterClosed());
    if (confirmed) {
      this.demoItems.update(list => list.filter(i => i.id !== itemId));
      this.snackbarService.openShortSnackBar(c.toastDeletedMsg);
    }
  }

  protected resetDemoItems(): void {
    this.demoItems.set(INITIAL_DEMO_ITEMS);
    this.searchQuery.set('');
    this.selectedRoomFilter.set('all');
    this.snackbarService.openShortSnackBar(this.copy().toastResetMsg);
  }

  protected scrollToPlayground(): void {
    const el = document.getElementById('bento-playground');
    el?.scrollIntoView({behavior: 'smooth', block: 'start'});
  }
}
