import {AbstractControl, ValidatorFn} from '@angular/forms';

export class CustomValidators {
  static exactTextValidator(text: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const input = control.value;
      const isValid = input === text;
      return isValid ? null : { 'exactText': { value: control.value } };
    };
  }

  static passwordValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const value: string = control.value || '';
    const hasUppercase = /[A-Z]/.test(value);
    const hasLowercase = /[a-z]/.test(value);
    const hasDigit = /[0-9]/.test(value);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    const isValid = hasUppercase && hasLowercase && hasDigit && hasSpecial;

    return isValid ? null : { 'invalidPasswordSecurity': true };
  }

}
