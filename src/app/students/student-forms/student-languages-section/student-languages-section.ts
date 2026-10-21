import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { FormArray, ReactiveFormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { LanguageFormGroup } from '../student-forms.types';

const LANGUAGE_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Родной'];

/** Языки: FormArray одинаковых групп «язык + уровень». */
@Component({
  selector: 'app-student-languages-section',
  imports: [
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzCollapseModule,
  ],
  templateUrl: './student-languages-section.html',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class StudentLanguagesSection {
  readonly languagesArray = input.required<FormArray<LanguageFormGroup>>();
  readonly createLanguage = input.required<() => LanguageFormGroup>();
  readonly languagesChange = output<void>();
  /** Раскрыта ли секция; двусторонняя привязка [(active)]. */
  readonly active = model(false);

  readonly levels = LANGUAGE_LEVELS;

  getLanguageGroup(index: number): LanguageFormGroup {
    return this.languagesArray().at(index);
  }

  addLanguage(): void {
    this.languagesArray().push(this.createLanguage()());
    this.languagesArray().markAsDirty();
    this.languagesChange.emit();
  }

  removeLanguage(index: number): void {
    this.languagesArray().markAsDirty();
    this.languagesArray().removeAt(index);
    this.languagesChange.emit();
  }
}
