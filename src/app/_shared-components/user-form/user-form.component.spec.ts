import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserFormComponent } from './user-form.component';
import { CustomTranslateService } from '../../_services/translate/custom-translate.service';
import { provideTranslateService } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AccessRole } from '../../_models/user/access-role';

describe('UserFormComponent', () => {
  let component: UserFormComponent;
  let fixture: ComponentFixture<UserFormComponent>;
  let mockTranslateService: jasmine.SpyObj<CustomTranslateService>;

  beforeEach(async () => {
    mockTranslateService = jasmine.createSpyObj('CustomTranslateService', ['get']);
    mockTranslateService.get.and.callFake((key: string) => key);

    await TestBed.configureTestingModule({
      imports: [UserFormComponent, NoopAnimationsModule],
      providers: [
        provideTranslateService(),
        { provide: CustomTranslateService, useValue: mockTranslateService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and initialize form with default controls', () => {
    expect(component).toBeTruthy();
    expect(component.userForm.contains('email')).toBe(true);
    expect(component.userForm.contains('firstName')).toBe(true);
    expect(component.userForm.contains('lastName')).toBe(true);
    expect(component.userForm.contains('roles')).toBe(true);
  });

  it('should be invalid when required fields are empty', () => {
    expect(component.userForm.valid).toBe(false);
  });

  it('should validate email format and return appropriate error message', () => {
    const emailControl = component.userForm.get('email');
    emailControl?.setValue('invalid-email');
    emailControl?.markAsTouched();

    expect(emailControl?.hasError('email')).toBe(true);
    expect(component.getErrorMessage('email')).toBe('registration.validation.invalidEmail');
  });

  it('should trim email and emit formSubmit when form is valid', () => {
    spyOn(component.formSubmit, 'emit');

    component.userForm.patchValue({
      email: 'test@example.com',
      firstName: 'Jan',
      lastName: 'Kowalski',
      roles: [AccessRole.ADMIN_PAGE_ACCESS]
    });

    expect(component.userForm.valid).toBe(true);

    component.submitForm();

    expect(component.formSubmit.emit).toHaveBeenCalledWith(jasmine.objectContaining({
      email: 'test@example.com',
      firstName: 'Jan',
      lastName: 'Kowalski',
      roles: [AccessRole.ADMIN_PAGE_ACCESS]
    }));
  });

  it('should not emit formSubmit if form is invalid', () => {
    spyOn(component.formSubmit, 'emit');

    component.userForm.patchValue({
      email: '',
      firstName: '',
      lastName: ''
    });

    component.submitForm();

    expect(component.formSubmit.emit).not.toHaveBeenCalled();
    expect(component.userForm.touched).toBe(true);
  });
});
