import { FormControl, FormGroup } from '@angular/forms';
import { dateRangeValidator, isFutureDate, notInFutureValidator } from './date.validators';

describe('notInFutureValidator', () => {
  const validate = (value: Date | null) => notInFutureValidator()(new FormControl(value));

  it('пропускает пустое значение, сегодняшний и прошлые дни', () => {
    const today = new Date();
    expect(validate(null)).toBeNull();
    expect(
      validate(new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 0)),
    ).toBeNull();
    expect(validate(new Date(2004, 4, 17))).toBeNull();
  });

  it('отклоняет завтрашний день', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(validate(tomorrow)).toEqual({ futureDate: true });
    expect(isFutureDate(tomorrow)).toBe(true);
  });
});

describe('dateRangeValidator', () => {
  const group = (start: Date | null, end: Date | null) =>
    new FormGroup(
      { start: new FormControl(start), end: new FormControl(end) },
      { validators: dateRangeValidator('start', 'end') },
    );

  it('ошибка, только если окончание раньше начала', () => {
    expect(group(new Date(2024, 4, 1), new Date(2024, 1, 1)).errors).toEqual({ dateRange: true });
    expect(group(new Date(2024, 1, 1), new Date(2024, 1, 1)).errors).toBeNull();
    expect(group(new Date(2024, 1, 1), new Date(2024, 4, 1)).errors).toBeNull();
  });

  it('незаполненная дата окончания — «по настоящее время», не ошибка', () => {
    expect(group(new Date(2024, 1, 1), null).errors).toBeNull();
  });
});
