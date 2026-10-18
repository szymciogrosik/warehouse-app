import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../_services/auth/auth.service';
import { PublicSettingsFacade } from '../_database/settings/public-settings.facade';
import { CustomTranslateService } from '../_services/translate/custom-translate.service';
import { SnackbarService } from '../_services/util/snackbar.service';
import { Router, ActivatedRoute, provideRouter } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { provideTranslateService } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { of, Subject } from 'rxjs';
import { FirebaseError } from '@angular/fire/app';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: any;
  let mockPublicSettingsFacade: any;
  let mockTranslateService: jasmine.SpyObj<CustomTranslateService>;
  let mockSnackbarService: jasmine.SpyObj<SnackbarService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let authErrorLogoutSubject: Subject<void>;

  beforeEach(async () => {
    authErrorLogoutSubject = new Subject<void>();
    mockAuthService = {
      isLoading: signal(false),
      isLoggedIn: signal(false),
      getAuthErrorLogout: () => authErrorLogoutSubject.asObservable(),
      loginWithEmailAndPassword: jasmine.createSpy('loginWithEmailAndPassword').and.returnValue(Promise.resolve()),
      registerUserWithDetails: jasmine.createSpy('registerUserWithDetails').and.returnValue(Promise.resolve()),
      loginWithGoogleSso: jasmine.createSpy('loginWithGoogleSso').and.returnValue(Promise.resolve())
    };

    mockPublicSettingsFacade = {
      allowForRegistering: signal(true),
      settings: signal({ allowForRegistering: true })
    };

    mockTranslateService = jasmine.createSpyObj('CustomTranslateService', ['get']);
    mockTranslateService.get.and.callFake((key: string) => key);

    mockSnackbarService = jasmine.createSpyObj('SnackbarService', ['openLongSnackBar']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        provideTranslateService(),
        { provide: AuthService, useValue: mockAuthService },
        { provide: PublicSettingsFacade, useValue: mockPublicSettingsFacade },
        { provide: CustomTranslateService, useValue: mockTranslateService },
        { provide: SnackbarService, useValue: mockSnackbarService },
        { provide: Router, useValue: mockRouter },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParams: { returnUrl: '/admin' } } }
        },
        { provide: MatDialog, useValue: { open: () => ({ afterClosed: () => of(false) }) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and initialize login and register forms', () => {
    expect(component).toBeTruthy();
    expect(component.loginForm).toBeDefined();
    expect(component.registerForm).toBeDefined();
  });

  it('should validate loginForm required fields', () => {
    component.loginForm.setValue({ email: '', password: '' });
    expect(component.loginForm.valid).toBe(false);

    component.loginForm.setValue({ email: 'user@example.com', password: 'Password123!' });
    expect(component.loginForm.valid).toBe(true);
  });

  it('should submit login when loginForm is valid', async () => {
    component.loginForm.setValue({ email: 'user@example.com', password: 'Password123!' });
    component.onSubmitLogin();

    expect(mockAuthService.loginWithEmailAndPassword).toHaveBeenCalledWith('user@example.com', 'Password123!');
  });

  it('should handle login failure and display snackbar', async () => {
    mockAuthService.loginWithEmailAndPassword.and.returnValue(Promise.reject('Login failed'));
    component.loginForm.setValue({ email: 'user@example.com', password: 'Password123!' });

    component.onSubmitLogin();
    await fixture.whenStable();

    expect(mockSnackbarService.openLongSnackBar).toHaveBeenCalledWith('Login failed');
    expect(component.loading()).toBe(false);
    expect(component.loginForm.enabled).toBe(true);
  });

  it('should require acceptTerms in registerForm', () => {
    component.registerForm.setValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'SecurePassword1!',
      acceptTerms: false
    });
    expect(component.registerForm.valid).toBe(false);

    component.registerForm.patchValue({ acceptTerms: true });
    expect(component.registerForm.valid).toBe(true);
  });

  it('should submit registration when registerForm is valid', () => {
    component.registerForm.setValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'SecurePassword1!',
      acceptTerms: true
    });

    component.onSubmitRegister();
    expect(mockAuthService.registerUserWithDetails).toHaveBeenCalledWith(
      'john@example.com',
      'SecurePassword1!',
      'John',
      'Doe'
    );
  });

  it('should handle registration failure for already used email', async () => {
    const error = new FirebaseError('auth/email-already-in-use', 'Email already in use');
    mockAuthService.registerUserWithDetails.and.returnValue(Promise.reject(error));

    component.registerForm.setValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'SecurePassword1!',
      acceptTerms: true
    });

    component.onSubmitRegister();
    await fixture.whenStable();

    expect(mockSnackbarService.openLongSnackBar).toHaveBeenCalledWith('login.error.emailAlreadyUsed');
    expect(component.loading()).toBe(false);
    expect(component.registerForm.enabled).toBe(true);
  });

  it('should trigger Google SSO login on loginGoogleSsoPopup()', () => {
    component['loginGoogleSsoPopup']();
    expect(mockAuthService.loginWithGoogleSso).toHaveBeenCalledWith(false);
  });

  it('should trigger Google SSO registration when in registration mode', () => {
    component.isRegistrationMode.set(true);
    component['loginGoogleSsoPopup']();
    expect(mockAuthService.loginWithGoogleSso).toHaveBeenCalledWith(true);
  });

  describe('onTabChange', () => {
    it('should switch to registration mode on index 1 and reset hidePassword', () => {
      component.hidePassword.set(false);
      component.onTabChange({ index: 1 } as any);
      expect(component.isRegistrationMode()).toBe(true);
      expect(component.hidePassword()).toBe(true);
    });

    it('should switch to login mode on index 0', () => {
      component.isRegistrationMode.set(true);
      component.onTabChange({ index: 0 } as any);
      expect(component.isRegistrationMode()).toBe(false);
      expect(component.hidePassword()).toBe(true);
    });
  });

  describe('getErrorMessage validation helper', () => {
    it('should return required error message', () => {
      component.loginForm.controls['email'].setValue('');
      component.loginForm.controls['email'].markAsTouched();
      const msg = component['getErrorMessage']('email', false);
      expect(msg).toBe('login.validation.mandatoryField');
    });

    it('should return invalid email error message', () => {
      component.loginForm.controls['email'].setValue('not-an-email');
      component.loginForm.controls['email'].markAsTouched();
      const msg = component['getErrorMessage']('email', false);
      expect(msg).toBe('login.validation.invalidEmail');
    });

    it('should return empty string if field has no error or is not found', () => {
      component.loginForm.controls['email'].setValue('valid@example.com');
      expect(component['getErrorMessage']('email', false)).toBe('');
      expect(component['getErrorMessage']('nonExistentField', false)).toBe('');
    });
  });
});
