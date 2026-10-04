import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * ====================================================================================
 * [EXPERIMENT 23] - Add a custom validator to check password strength
 * ====================================================================================
 * 
 * [KYA KARTA HAI YE CODE?]:
 * Angular Reactive Forms ke liye ek Custom Validator function banata hai.
 * Ye ensure karta hai ki student ya admin ka password strong ho:
 * 1. At least 1 Capital letter (A-Z)
 * 2. At least 1 Number (0-9)
 * 3. At least 1 Special character (@$!%*?&#^_-)
 * 
 * [KAISE KAAM KARTA HAI?]:
 * Ye ek `ValidatorFn` return karta hai.
 * Agar password sabhi criteria satisfy karta hai toh `null` return hota hai (valid).
 * Agar kisi condition me fail hota hai toh error object return hota hai:
 * `{ passwordStrength: { hasUpperCase: false, hasNumber: true, hasSpecialChar: false } }`
 * 
 * [STUDENT MANAGEMENT SYSTEM ME CONNECTION]:
 * Student login aur Admin portal security ke liye strong credentials enforce karna
 * zaroori hai. Ye validator reactive login form me lagaya gaya hai.
 */

export function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value || '';

    // If empty, let Validators.required handle it
    if (!value) {
      return null;
    }

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecialChar = /[@$!%*?&#^_\-+=<>.,]/.test(value);
    const isMinLength = value.length >= 6;

    const passwordValid = hasUpperCase && hasNumber && hasSpecialChar && isMinLength;

    if (!passwordValid) {
      return {
        passwordStrength: {
          hasUpperCase,
          hasLowerCase,
          hasNumber,
          hasSpecialChar,
          isMinLength,
          message: 'Password must contain at least 1 uppercase letter, 1 number, 1 special character and be at least 6 characters long.'
        }
      };
    }

    return null;
  };
}
