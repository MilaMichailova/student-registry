import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Начало сегодняшнего дня по локальному времени — граница для «не позже сегодня». */
function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/** Дата не позже сегодняшней (например, дата рождения). Пустое значение пропускается. */
export function notInFutureValidator(): ValidatorFn {
  return (control: AbstractControl<Date | null>): ValidationErrors | null => {
    const value = control.value;
    return value && value > endOfDay(startOfToday()) ? { futureDate: true } : null;
  };
}

/** Для nzDisabledDate: в календаре нельзя выбрать дни после сегодняшнего. */
export function isFutureDate(date: Date): boolean {
  return date > endOfDay(startOfToday());
}

/**
 * Валидатор группы: дата окончания не раньше даты начала.
 * Ошибка ставится на группу — поля по отдельности корректны, неверно только их сочетание.
 */
export function dateRangeValidator(startKey: string, endKey: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const start = group.get(startKey)?.value as Date | null | undefined;
    const end = group.get(endKey)?.value as Date | null | undefined;
    return start && end && end < start ? { dateRange: true } : null;
  };
}

function endOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}
