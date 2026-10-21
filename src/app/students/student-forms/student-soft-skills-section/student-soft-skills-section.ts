import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  output,
} from '@angular/core';
import { FormArray, FormControl, ReactiveFormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';

/** Личные качества: FormArray одиночных контролов, каждый обязателен к заполнению. */
@Component({
  selector: 'app-student-soft-skills-section',
  imports: [
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzCollapseModule,
  ],
  templateUrl: './student-soft-skills-section.html',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class StudentSoftSkillsSection {
  @Input({ required: true }) softSkillsArray!: FormArray<FormControl<string | null>>;
  @Input({ required: true }) createSoftSkill!: () => FormControl<string | null>;
  @Output() softSkillsChange = new EventEmitter<void>();
  @Input() active = false;
  readonly activeChange = output<boolean>();

  onActiveChange(active: boolean): void {
    this.active = active;
    this.activeChange.emit(active);
  }

  addSoftSkill(): void {
    this.softSkillsArray.markAsDirty();
    this.softSkillsArray.push(this.createSoftSkill());
    this.softSkillsChange.emit();
  }

  removeSoftSkill(index: number): void {
    this.softSkillsArray.markAsDirty();
    this.softSkillsArray.removeAt(index);
    this.softSkillsChange.emit();
  }
}
