import { ChangeDetectionStrategy, Component, Input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { StudentForm } from '../student-forms.types';
import { parseTags } from '../student-form-base';

interface SkillField {
  controlName: 'programmingLanguages' | 'frameworks' | 'databases' | 'tools';
  label: string;
  placeholder: string;
}

@Component({
  selector: 'app-student-skills-section',
  imports: [ReactiveFormsModule, NzCollapseModule, NzFormModule, NzInputModule, NzTagModule],
  templateUrl: './student-skills-section.html',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class StudentSkillsSection {
  @Input({ required: true }) formGroup!: StudentForm;
  @Input() active = false;
  readonly activeChange = output<boolean>();

  /** Поля навыков — строки через запятую; при сохранении превращаются в массивы. */
  readonly fields: SkillField[] = [
    {
      controlName: 'programmingLanguages',
      label: 'Языки программирования',
      placeholder: 'TypeScript, Python, C#',
    },
    { controlName: 'frameworks', label: 'Фреймворки', placeholder: 'Angular, .NET, Django' },
    { controlName: 'databases', label: 'Базы данных', placeholder: 'PostgreSQL, SQLite' },
    { controlName: 'tools', label: 'Инструменты', placeholder: 'Git, Docker, Figma' },
  ];

  readonly parseTags = parseTags;

  onActiveChange(active: boolean): void {
    this.active = active;
    this.activeChange.emit(active);
  }
}
