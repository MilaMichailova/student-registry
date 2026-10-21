import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { StudentFormBase } from '../student-forms/student-form-base';
import { StudentFormSections } from '../student-forms/student-form-sections/student-form-sections';
import { StudentsApiService } from '../api/students-api.service';
import {
  PendingChanges,
  protectUnsavedChanges,
  trackFormChanges,
} from '../../shared/forms/pending-changes';

type LoadState = 'loading' | 'loaded' | 'notFound' | 'error';

@Component({
  selector: 'app-student-edit',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    NzBreadCrumbModule,
    NzButtonModule,
    NzFormModule,
    NzIconModule,
    NzResultModule,
    NzSpinModule,
    StudentFormSections,
  ],
  templateUrl: './student-edit.html',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class StudentEdit extends StudentFormBase implements OnInit, PendingChanges {
  private readonly studentsApi = inject(StudentsApiService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly changes = trackFormChanges(() => this.form.getRawValue());

  /** Параметр маршрута :studentId (withComponentInputBinding). */
  readonly studentId = input.required<string>();

  readonly loadState = signal<LoadState>('loading');
  readonly saving = signal(false);
  readonly studentName = signal('');

  constructor() {
    super();
    protectUnsavedChanges(() => this.hasUnsavedChanges());
  }

  ngOnInit(): void {
    this.loadStudent();
  }

  hasUnsavedChanges(): boolean {
    return this.loadState() === 'loaded' && this.changes.hasChanges();
  }

  loadStudent(): void {
    this.loadState.set('loading');
    this.studentsApi
      .getStudent(this.studentId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (student) => {
          this.patchFromStudent(student);
          this.studentName.set(
            [student.lastName, student.firstName].filter(Boolean).join(' ') || 'Без имени',
          );
          // Исходное состояние формы после загрузки — точка отсчёта для «есть изменения».
          this.changes.markSaved();
          this.form.markAsPristine();
          this.loadState.set('loaded');
        },
        error: (error: HttpErrorResponse) =>
          this.loadState.set(error.status === 404 ? 'notFound' : 'error'),
      });
  }

  saveStudent(): void {
    if (this.saving()) {
      return;
    }

    if (!this.validateForm()) {
      this.message.error('Пожалуйста, заполните все обязательные поля');
      setTimeout(() => this.scrollToFirstError('.student-form-page'), 100);
      return;
    }

    const formValue = this.form.getRawValue();
    this.saving.set(true);
    this.studentsApi
      .updateStudent(this.buildSaveRequest(this.studentId()))
      .pipe(
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.changes.markSaved(formValue);
          this.message.success('Изменения сохранены');
          this.router.navigate(['/students']);
        },
        error: () => this.message.error('Не удалось сохранить изменения'),
      });
  }

  onCancel(): void {
    this.router.navigate(['/students']);
  }
}
