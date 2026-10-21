import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const TELEGRAM_PLAIN_USERNAME_PATTERN = /^[A-Za-z][A-Za-z0-9_]{3,30}[A-Za-z0-9]$/;
const TELEGRAM_USERNAME_PATTERN = /^@[A-Za-z][A-Za-z0-9_]{3,30}[A-Za-z0-9]$/;
const TELEGRAM_URL_PATTERN = /^https:\/\/t\.me\/[A-Za-z][A-Za-z0-9_]{3,30}[A-Za-z0-9]\/?$/i;
const TELEGRAM_INVALID_MESSAGE = 'Введите username, @username или ссылку https://t.me/username';

/** Пустое значение допустимо; заполненное должно быть username, @username или ссылкой t.me. */
export function telegramValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string | null | undefined;
    if (value == null || value.trim() === '') {
      return null;
    }

    const trimmed = value.trim();
    return TELEGRAM_PLAIN_USERNAME_PATTERN.test(trimmed) ||
      TELEGRAM_USERNAME_PATTERN.test(trimmed) ||
      TELEGRAM_URL_PATTERN.test(trimmed)
      ? null
      : { telegramInvalid: TELEGRAM_INVALID_MESSAGE };
  };
}
