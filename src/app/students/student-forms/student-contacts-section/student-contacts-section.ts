import { ChangeDetectionStrategy, Component, Input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { StudentForm } from '../student-forms.types';

@Component({
  selector: 'app-student-contacts-section',
  imports: [ReactiveFormsModule, NzCollapseModule, NzFormModule, NzInputModule],
  templateUrl: './student-contacts-section.html',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class StudentContactsSection {
  @Input({ required: true }) formGroup!: StudentForm;
  @Input() active = false;
  readonly activeChange = output<boolean>();

  onActiveChange(active: boolean): void {
    this.active = active;
    this.activeChange.emit(active);
  }
}
