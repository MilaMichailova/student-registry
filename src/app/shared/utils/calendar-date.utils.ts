const calendarDateTimeZone = 'UTC';

/**
 * Преобразует календарную дату из datepicker в unix-миллисекунды.
 * Календарные компоненты (год, месяц, день) трактуются как UTC0, без сдвига момента времени.
 * @param date Дата, выбранная пользователем.
 */
export function calendarDateToUnixMilliseconds(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Преобразует unix-миллисекунды в Date для привязки к datepicker.
 * Календарные компоненты извлекаются как UTC0 и подставляются в локальный Date без сдвига часового пояса.
 * @param millis Unix-миллисекунды или пустое значение.
 */
export function unixMillisecondsToCalendarDate(millis: number | null | undefined): Date | null {
  if (millis == null || millis === 0) {
    return null;
  }

  const storedDate = new Date(millis);
  return new Date(storedDate.getUTCFullYear(), storedDate.getUTCMonth(), storedDate.getUTCDate());
}

/**
 * Форматирует календарную дату из unix-миллисекунд.
 * @param millis Unix-миллисекунды или пустое значение.
 */
export function formatCalendarDate(millis: number | null | undefined): string {
  if (millis == null || millis === 0) {
    return '';
  }

  return new Date(millis).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: calendarDateTimeZone,
  });
}

/**
 * Форматирует календарный месяц и год из unix-миллисекунд.
 * @param millis Unix-миллисекунды или пустое значение.
 */
export function formatCalendarMonthYear(millis: number | null | undefined): string {
  if (millis == null || millis === 0) {
    return '';
  }

  return new Date(millis).toLocaleDateString('ru-RU', {
    month: 'long',
    year: 'numeric',
    timeZone: calendarDateTimeZone,
  });
}
