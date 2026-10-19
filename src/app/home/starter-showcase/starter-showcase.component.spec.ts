import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {provideRouter} from '@angular/router';
import {signal} from '@angular/core';
import {of} from 'rxjs';
import {StarterShowcaseComponent} from './starter-showcase.component';
import {AuthService} from '../../_services/auth/auth.service';
import {CustomTranslateService} from '../../_services/translate/custom-translate.service';
import {SnackbarService} from '../../_services/util/snackbar.service';
import {DialogService} from '../../_services/util/dialog.service';
import {APP_CONFIG} from '../../app.config.token';
import {LanguageEnum} from '../../_services/translate/language-enum';

describe('StarterShowcaseComponent', () => {
  let component: StarterShowcaseComponent;
  let fixture: ComponentFixture<StarterShowcaseComponent>;
  let mockAuthService: {
    currentUser: ReturnType<typeof signal<any>>;
    isLoggedIn: ReturnType<typeof signal<boolean>>;
  };
  let selectedLanguageSignal: ReturnType<typeof signal<string | null>>;
  let mockTranslateService: {
    selectedLanguage: ReturnType<typeof signal<string | null>>;
    setLanguage: jasmine.Spy;
    get: jasmine.Spy;
  };
  let mockSnackbarService: jasmine.SpyObj<SnackbarService>;
  let mockDialogService: jasmine.SpyObj<DialogService>;

  beforeEach(async () => {
    mockAuthService = {
      currentUser: signal(null),
      isLoggedIn: signal(false)
    };

    selectedLanguageSignal = signal<string | null>(LanguageEnum.POLISH);
    mockTranslateService = {
      selectedLanguage: selectedLanguageSignal,
      setLanguage: jasmine.createSpy('setLanguage'),
      get: jasmine.createSpy('get').and.callFake((k: string) => k)
    };

    mockSnackbarService = jasmine.createSpyObj('SnackbarService', ['openShortSnackBar', 'openSnackBar']);
    mockDialogService = jasmine.createSpyObj('DialogService', ['openConfirmDialogWithData']);
    mockDialogService.openConfirmDialogWithData.and.returnValue({
      afterClosed: () => of(true)
    } as any);

    await TestBed.configureTestingModule({
      imports: [StarterShowcaseComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        {provide: AuthService, useValue: mockAuthService},
        {provide: CustomTranslateService, useValue: mockTranslateService},
        {provide: SnackbarService, useValue: mockSnackbarService},
        {provide: DialogService, useValue: mockDialogService},
        {provide: APP_CONFIG, useValue: {default_language: LanguageEnum.POLISH}}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StarterShowcaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and default to Polish language copy in guest mode', () => {
    expect(component).toBeTruthy();
    expect((component as any).currentLang()).toBe('pl');
    expect((component as any).copy().guestMode).toContain('Gość');
    expect((component as any).filteredDemoItems().length).toBe(4);
  });

  it('should switch reactive copy to English when CustomTranslateService language changes to EN', () => {
    selectedLanguageSignal.set(LanguageEnum.ENGLISH);
    fixture.detectChanges();

    expect((component as any).currentLang()).toBe('en');
    expect((component as any).copy().guestMode).toContain('Guest');
  });

  it('should switch workflow steps when selectStep is called', () => {
    expect((component as any).activeStep()).toBe('security');
    expect((component as any).currentStepDetails().stepBadge).toContain('01');

    (component as any).selectStep('hierarchy');
    expect((component as any).activeStep()).toBe('hierarchy');
    expect((component as any).currentStepDetails().stepBadge).toContain('02');

    (component as any).selectStep('catalog');
    expect((component as any).activeStep()).toBe('catalog');
    expect((component as any).currentStepDetails().stepBadge).toContain('03');

    (component as any).selectStep('search');
    expect((component as any).activeStep()).toBe('search');
    expect((component as any).currentStepDetails().stepBadge).toContain('04');
  });

  it('should toggle security view mode between user and admin', () => {
    expect((component as any).securityViewMode()).toBe('user');

    (component as any).setSecurityViewMode('admin');
    expect((component as any).securityViewMode()).toBe('admin');

    (component as any).setSecurityViewMode('user');
    expect((component as any).securityViewMode()).toBe('user');
  });

  it('should open admin inspector dialog with raw encrypted JSON representation', () => {
    (component as any).openAdminInspectorDemo();

    expect(mockDialogService.openConfirmDialogWithData).toHaveBeenCalledWith(
      jasmine.objectContaining({
        title: (component as any).copy().dialogSecurityTitle,
        icon: 'lock',
        iconColor: 'primary'
      })
    );
  });

  it('should filter demo items by room and by search query', () => {
    (component as any).setRoomFilter('garage');
    expect((component as any).filteredDemoItems().length).toBe(2);

    (component as any).onSearchInput({target: {value: 'Fluke'}} as any);
    expect((component as any).filteredDemoItems().length).toBe(1);
    expect((component as any).filteredDemoItems()[0].id).toBe('item-2');

    (component as any).resetDemoItems();
    expect((component as any).filteredDemoItems().length).toBe(4);
    expect(mockSnackbarService.openShortSnackBar).toHaveBeenCalled();
  });

  it('should add a sample item and trigger snackbar notification', () => {
    const initialCount = (component as any).demoItems().length;
    (component as any).addSampleItem();

    expect((component as any).demoItems().length).toBe(initialCount + 1);
    expect(mockSnackbarService.openShortSnackBar).toHaveBeenCalled();
  });

  it('should simulate moving an item to another room and update its location', () => {
    const firstItem = (component as any).demoItems()[0];
    expect(firstItem.roomKey).toBe('garage');

    (component as any).simulateMoveItem(firstItem);

    const updatedItem = (component as any).demoItems()[0];
    expect(updatedItem.roomKey).toBe('basement');
    expect(mockSnackbarService.openShortSnackBar).toHaveBeenCalled();
  });

  it('should open inspection dialog when inspectItemPath is called', () => {
    const firstItem = (component as any).demoItems()[0];
    (component as any).inspectItemPath(firstItem);

    expect(mockDialogService.openConfirmDialogWithData).toHaveBeenCalled();
  });

  it('should remove demo item after confirmation dialog resolves true', async () => {
    const initialCount = (component as any).demoItems().length;
    await (component as any).removeDemoItem('item-1');

    expect(mockDialogService.openConfirmDialogWithData).toHaveBeenCalled();
    expect((component as any).demoItems().length).toBe(initialCount - 1);
    expect(mockSnackbarService.openShortSnackBar).toHaveBeenCalled();
  });
});
