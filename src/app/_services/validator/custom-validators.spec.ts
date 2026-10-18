import { FormControl } from '@angular/forms';
import { CustomValidators } from './custom-validators';

describe('CustomValidators', () => {
  describe('exactTextValidator', () => {
    it('should return null when the text matches exactly', () => {
      const validator = CustomValidators.exactTextValidator('DELETE');
      const control = new FormControl('DELETE');
      expect(validator(control)).toBeNull();
    });

    it('should return error when the text does not match', () => {
      const validator = CustomValidators.exactTextValidator('DELETE');
      const control = new FormControl('delete');
      expect(validator(control)).toEqual({ exactText: { value: 'delete' } });
    });

    it('should return error when control value is empty', () => {
      const validator = CustomValidators.exactTextValidator('DELETE');
      const control = new FormControl('');
      expect(validator(control)).toEqual({ exactText: { value: '' } });
    });
  });

  describe('passwordValidator', () => {
    it('should return null when password meets all complexity requirements', () => {
      const control = new FormControl('Secure123!@#');
      expect(CustomValidators.passwordValidator(control)).toBeNull();
    });

    it('should return error when password has no uppercase letter', () => {
      const control = new FormControl('secure123!@#');
      expect(CustomValidators.passwordValidator(control)).toEqual({ invalidPasswordSecurity: true });
    });

    it('should return error when password has no lowercase letter', () => {
      const control = new FormControl('SECURE123!@#');
      expect(CustomValidators.passwordValidator(control)).toEqual({ invalidPasswordSecurity: true });
    });

    it('should return error when password has no digit', () => {
      const control = new FormControl('SecureSecret!@#');
      expect(CustomValidators.passwordValidator(control)).toEqual({ invalidPasswordSecurity: true });
    });

    it('should return error when password has no special character', () => {
      const control = new FormControl('SecurePassword123');
      expect(CustomValidators.passwordValidator(control)).toEqual({ invalidPasswordSecurity: true });
    });

    it('should return error when control value is null or empty', () => {
      const control = new FormControl('');
      expect(CustomValidators.passwordValidator(control)).toEqual({ invalidPasswordSecurity: true });
    });
  });
});
