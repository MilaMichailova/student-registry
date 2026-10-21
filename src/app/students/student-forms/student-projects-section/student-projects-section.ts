import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
  output,
} from '@angular/core';
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import {
  FormArray,
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { TextFieldModule } from '@angular/cdk/text-field';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { ProjectFormGroup } from '../student-forms.types';

/**
 * Учебные проекты: FormArray групп, у каждой группы — свои FormArray обязанностей и результатов.
 * Порядок проектов и пунктов внутри меняется перетаскиванием.
 */
@Component({
  selector: 'app-student-projects-section',
  imports: [
    DatePipe,
    NgTemplateOutlet,
    ReactiveFormsModule,
    TextFieldModule,
    DragDropModule,
    NzFormModule,
    NzInputModule,
    NzDatePickerModule,
    NzButtonModule,
    NzIconModule,
    NzCollapseModule,
  ],
  templateUrl: './student-projects-section.html',
  styleUrl: './student-projects-section.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class StudentProjectsSection {
  private readonly formBuilder = inject(NonNullableFormBuilder);

  @Input({ required: true }) projectsArray!: FormArray<ProjectFormGroup>;
  /** Фабрика пустого проекта — общая с формой, чтобы валидаторы задавались в одном месте. */
  @Input({ required: true }) createProject!: () => ProjectFormGroup;
  @Input() active = false;
  readonly activeChange = output<boolean>();
  /** Проекты с ошибками раскрываются после попытки сохранения. */
  @Input() set invalidProjectIndexes(indexes: ReadonlySet<number>) {
    indexes.forEach((index) => {
      const project = this.projectsArray.at(index);
      if (project) {
        this.expandedPanels.add(project);
      }
    });
  }
  @Output() projectsChange = new EventEmitter<void>();

  // Раскрытие храним по ссылке на группу, а не по индексу, — переживает перетаскивание.
  expandedPanels = new Set<ProjectFormGroup>();
  readonly stringLists = PROJECT_STRING_LISTS;

  getProjectGroup(index: number): ProjectFormGroup {
    return this.projectsArray.at(index);
  }

  addProject(): void {
    const newGroup = this.createProject();
    this.projectsArray.push(newGroup);
    this.projectsArray.markAsDirty();
    this.projectsChange.emit();
    this.expandedPanels.add(newGroup);
  }

  getProjectTitle(index: number, projectControl: ProjectFormGroup): string {
    const projectName = projectControl.controls.projectName.value;
    const baseTitle = `Проект ${index + 1}`;
    return projectName?.trim() ? `${baseTitle} — ${projectName}` : baseTitle;
  }

  onActiveChange(active: boolean): void {
    this.active = active;
    this.activeChange.emit(active);
  }

  onPanelActiveChange(project: ProjectFormGroup, active: boolean): void {
    if (active) {
      this.expandedPanels.add(project);
    } else {
      this.expandedPanels.delete(project);
    }
  }

  /** Вложенный список строк проекта: задачи или результаты. */
  getListArray(
    projectIndex: number,
    list: ProjectStringList,
  ): FormArray<FormControl<string | null>> {
    return this.projectsArray.at(projectIndex).controls[list];
  }

  addListItem(projectIndex: number, list: ProjectStringList): void {
    this.getListArray(projectIndex, list).push(this.formBuilder.control<string | null>(''));
  }

  removeListItem(projectIndex: number, list: ProjectStringList, index: number): void {
    this.projectsArray.markAsDirty();
    this.getListArray(projectIndex, list).removeAt(index);
  }

  removeProject(index: number): void {
    const project = this.projectsArray.at(index);
    this.expandedPanels.delete(project);

    this.projectsArray.markAsDirty();
    this.projectsArray.removeAt(index);
    this.projectsChange.emit();
  }

  dropProject(event: CdkDragDrop<ProjectFormGroup[]>): void {
    moveItemInArray(this.projectsArray.controls, event.previousIndex, event.currentIndex);
    this.projectsArray.markAsDirty();
    this.projectsArray.updateValueAndValidity();
    this.projectsChange.emit();
  }

  dropListItem(
    event: CdkDragDrop<FormControl<string | null>[]>,
    projectIndex: number,
    list: ProjectStringList,
  ): void {
    const array = this.getListArray(projectIndex, list);
    moveItemInArray(array.controls, event.previousIndex, event.currentIndex);
    array.markAsDirty();
    array.updateValueAndValidity();
    this.projectsChange.emit();
  }
}

export type ProjectStringList = 'responsibilities' | 'achievements';

/** Подписи для двух вложенных списков проекта. */
export const PROJECT_STRING_LISTS: {
  name: ProjectStringList;
  label: string;
  placeholder: string;
  addLabel: string;
}[] = [
  {
    name: 'responsibilities',
    label: 'Задачи',
    placeholder: 'Что делал(а)',
    addLabel: 'Добавить задачу',
  },
  {
    name: 'achievements',
    label: 'Результаты',
    placeholder: 'Чего удалось добиться',
    addLabel: 'Добавить результат',
  },
];
