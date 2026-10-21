import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { StudentsApiService } from '../api/students-api.service';
import { StudyDirectionDictionaryService } from '../api/study-direction-dictionary.service';
import { Student } from '../student.models';
import {
  STUDENT_STATUS_COLORS,
  getStudentCourseLabel,
  getStudentStatusLabel,
  getStudyFormLabel,
} from '../student.types';
import { formatCalendarDate } from '../../shared/utils/calendar-date.utils';

/** Краткая карточка студента: данные догружаются при открытии, контакты копируются в один клик. */
@Component({
  selector: 'app-student-short-info-popover',
  imports: [
    NgTemplateOutlet,
    RouterLink,
    NzButtonModule,
    NzIconModule,
    NzSpinModule,
    NzTagModule,
    NzTooltipModule,
  ],
  templateUrl: './student-short-info-popover.html',
  styleUrl: './student-short-info-popover.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentShortInfoPopover {
  private readonly studentsApi = inject(StudentsApiService);
  private readonly directions = inject(StudyDirectionDictionaryService);
  private readonly message = inject(NzMessageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly studentId = input.required<string>();
  readonly closed = output<void>();
  readonly deleteClick = output<void>();

  readonly data = signal<Student | null>(null);
  readonly loading = signal(true);
  readonly directionNames = signal<Record<string, string>>({});

  readonly statusColors = STUDENT_STATUS_COLORS;

  readonly fullName = computed(() => {
    const info = this.data();
    if (!info) return '';
    return [info.lastName, info.firstName, info.middleName].filter(Boolean).join(' ').trim();
  });

  readonly statusLabel = computed(() => getStudentStatusLabel(this.data()?.status));
  readonly summary = computed(() => {
    const info = this.data();
    if (!info) return '';
    return [info.group, getStudentCourseLabel(info.course), getStudyFormLabel(info.studyForm)]
      .filter((part) => part && part !== '—')
      .join(' · ');
  });
  readonly dateOfBirth = computed(() =>
    formatCalendarDate(this.data()?.dateOfBirthInUnixMilliseconds),
  );
  readonly directionsText = computed(() => {
    const info = this.data();
    const names = this.directionNames();
    if (!info) return '';
    return [info.directionId, ...info.additionalDirectionIds]
      .map((id) => (id ? names[id] : null))
      .filter(Boolean)
      .join(', ');
  });
  readonly telegramLink = computed(() => {
    const username = this.data()?.contacts.telegramUsername?.replace(/^@|^https:\/\/t\.me\//i, '');
    return username ? `https://t.me/${username}` : null;
  });

  constructor() {
    this.directions
      .getDictionary()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items) =>
          this.directionNames.set(Object.fromEntries(items.map((item) => [item.id, item.name]))),
        error: () => this.directionNames.set({}),
      });

    // Перезагрузка при смене студента — аналог ngOnChanges для signal input.
    effect(() => this.loadData(this.studentId()));
  }

  copyToClipboard(text: string | null | undefined, successText = 'Скопировано'): void {
    if (!text) return;

    navigator.clipboard
      ?.writeText(text)
      .then(() => this.message.success(successText))
      .catch(() => this.message.error('Не удалось скопировать'));
  }

  /** Текст для вставки в письмо или мессенджер. */
  copyStudentInfo(): void {
    const info = this.data();
    if (!info) return;

    const text = [
      `ФИО: ${this.fullName() || '—'}`,
      `Группа, курс: ${this.summary() || '—'}`,
      `Направления: ${this.directionsText() || '—'}`,
      `Статус: ${this.statusLabel()}`,
      `Дата рождения: ${this.dateOfBirth() || '—'}`,
      `E-mail: ${info.contacts.email || '—'}`,
    ].join('\n');

    this.copyToClipboard(text, 'Информация скопирована');
  }

  private loadData(studentId: string): void {
    this.loading.set(true);
    this.data.set(null);

    this.studentsApi
      .getStudent(studentId)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (student) => this.data.set(student),
        error: () => this.message.error('Не удалось загрузить данные'),
      });
  }
}
