import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class passwordValidator {
  static strongPassword(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return null;
      }
      const missing: string[] = [];
      if (value.length < 8) missing.push('at least 8 characters');
      if (!/[A-Z]/.test(value)) missing.push('an uppercase letter');
      if (!/[a-z]/.test(value)) missing.push('a lowercase letter');
      if (!/[0-9]/.test(value)) missing.push('a number');
      if (!/[^a-zA-Z0-9]/.test(value)) missing.push('a special character');

      // [CHANGED] the error value is now an object, not `true`
      return missing.length
        ? { passwordStrength: { missing: missing.join(', ') } }
        : null;
      // const hasNumbers = /[0-9]/.test(value);
      // const hasUpper = /[A-Z]/.test(value);
      // const hasLower = /[a-z]/.test(value);
      // const hasSpecial = /[^a-zA-Z0-9]/.test(value);
      // const isValidLength = value.length >= 8;
      // const isValidPassword = hasLower && hasNumbers && hasUpper && hasSpecial && isValidLength;
      // return !isValidPassword ? { passwordStrength: true } : null;
    };
  }

  static PasswordMatch(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const retypePassword = control.value;
      const password = control.parent?.get('password')?.value;
      if (!retypePassword) {
        return null;
      }
      if (retypePassword === password) {
        return null;
      }
      return { passwordMismatch: true };
    };
  }
}
