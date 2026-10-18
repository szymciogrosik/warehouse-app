import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CookieConsentComponent } from './cookie-consent.component';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';

describe('CookieConsentComponent', () => {
  let component: CookieConsentComponent;
  let fixture: ComponentFixture<CookieConsentComponent>;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [CookieConsentComponent],
      providers: [provideRouter([]), provideTranslateService()]
    }).compileComponents();

    fixture = TestBed.createComponent(CookieConsentComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show banner after delay if consent has not been given', () => {
    jasmine.clock().install();
    try {
      component.ngOnInit();
      expect(component.visible()).toBe(false);

      jasmine.clock().tick(850);
      expect(component.visible()).toBe(true);
    } finally {
      jasmine.clock().uninstall();
    }
  });

  it('should not show banner if consent was already given in localStorage', () => {
    jasmine.clock().install();
    try {
      localStorage.setItem('cookie_consent', 'essential');
      component.ngOnInit();

      jasmine.clock().tick(850);
      expect(component.visible()).toBe(false);
    } finally {
      jasmine.clock().uninstall();
    }
  });

  it('should save consent to localStorage and hide banner when accepted', () => {
    component.visible.set(true);
    component.accept();

    expect(localStorage.getItem('cookie_consent')).toBe('essential');
    expect(component.visible()).toBe(false);
  });
});
