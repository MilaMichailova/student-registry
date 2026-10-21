import { FormControl } from '@angular/forms';
import { telegramValidator } from './telegram.validator';

describe('telegramValidator', () => {
  const validate = (value: string | null) => telegramValidator()(new FormControl(value));

  it('пропускает пустое значение — поле необязательное', () => {
    expect(validate(null)).toBeNull();
    expect(validate('   ')).toBeNull();
  });

  it.each(['student_01', '@student_01', 'https://t.me/student_01', ' @student_01 '])(
    'принимает %s',
    (value) => {
      expect(validate(value)).toBeNull();
    },
  );

  it.each(['abc', '1student', 'student_', 'https://example.com/student', '@student name'])(
    'отклоняет %s',
    (value) => {
      expect(validate(value)).toEqual({ telegramInvalid: expect.any(String) });
    },
  );
});
