import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { StudentFormBase } from '../student-forms/student-form-base';
import { StudentFormSections } from '../student-forms/student-form-sections/student-form-sections';
import { StudentsApiService } from '../api/students-api.service';
import {
  PendingChanges,
  protectUnsavedChanges,
  trackFormChanges,
} from '../../shared/forms/pending-changes';

@Component({
  selector: 'app-student-create',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    NzBreadCrumbModule,
    NzButtonModule,
    NzFormModule,
    NzIconModule,
    NzSpinModule,
    StudentFormSections,
  ],
  templateUrl: './student-create.html',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class StudentCreate extends StudentFormBase implements PendingChanges {
  private readonly studentsApi = inject(StudentsApiService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly changes = trackFormChanges(() => this.form.getRawValue());

  readonly saving = signal(false);

  constructor() {
    super();
    protectUnsavedChanges(() => this.hasUnsavedChanges());
  }

  hasUnsavedChanges(): boolean {
    return this.changes.hasChanges();
  }

  createStudent(): void {
    if (this.saving()) {
      return;
    }

    if (!this.validateForm()) {
      this.message.error('Пожалуйста, заполните все обязательные поля');
      setTimeout(() => this.scrollToFirstError('.student-form-page'), 100);
      return;
    }

    const formValue = this.form.getRawValue();
    const request = this.buildSaveRequest(crypto.randomUUID());

    this.saving.set(true);
    this.studentsApi
      .createStudent(request)
      .pipe(
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          // Снимок сохранённого значения — чтобы guard не спросил про уход со страницы.
          this.changes.markSaved(formValue);
          this.message.success('Студент добавлен');
          this.router.navigate(['/students']);
        },
        error: () => this.message.error('Не удалось сохранить студента'),
      });
  }

  onCancel(): void {
    this.router.navigate(['/students']);
  }
}
