import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, catchError, finalize, map, of, switchMap, tap, timer } from 'rxjs';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule, NzTableSortOrder } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { StudentsApiService } from '../api/students-api.service';
import { Page, StudentListQuery, StudentRow } from '../student.models';
import {
  OrderByDirection,
  STUDENT_STATUS_COLORS,
  STUDENT_STATUS_OPTIONS,
  STUDY_FORM_OPTIONS,
  StudentsOrderByColumn,
  StudentStatus,
  StudyForm,
  getStudentCourseLabel,
  getStudentStatusLabel,
  getStudyFormLabel,
} from '../student.types';
import { StudentShortInfoPopover } from '../student-short-info-popover/student-short-info-popover';
import { resetMockDatabase } from '../../mock-backend/mock-backend.interceptor';

const SEARCH_DEBOUNCE_MS = 400;
const PAGE_SIZE_OPTIONS = [10, 20, 50];

interface ReloadTrigger {
  debounce: boolean;
}

@Component({
  selector: 'app-student-list',
  imports: [
    RouterLink,
    FormsModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzPopoverModule,
    NzSelectModule,
    NzTableModule,
    NzTagModule,
    NzTooltipModule,
    StudentShortInfoPopover,
  ],
  templateUrl: './student-list.html',
  styleUrl: './student-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentList implements OnInit {
  private readonly studentsApi = inject(StudentsApiService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  private readonly destroyRef = inject(DestroyRef);

  readonly statusOptions = STUDENT_STATUS_OPTIONS;
  readonly studyFormOptions = STUDY_FORM_OPTIONS;
  readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  readonly statusColors = STUDENT_STATUS_COLORS;
  readonly Column = StudentsOrderByColumn;
  readonly getStatusLabel = getStudentStatusLabel;
  readonly getStudyFormLabel = getStudyFormLabel;
  readonly getCourseLabel = getStudentCourseLabel;

  readonly search = signal('');
  readonly statuses = signal<StudentStatus[]>([]);
  readonly studyForms = signal<StudyForm[]>([]);
  readonly orderByColumn = signal(StudentsOrderByColumn.FullName);
  readonly orderByDirection = signal(OrderByDirection.Asc);
  readonly pageNumber = signal(1);
  readonly pageSize = signal(PAGE_SIZE_OPTIONS[0]);

  readonly page = signal<Page<StudentRow>>({ items: [], totalItems: 0, totalPages: 0 });
  readonly loading = signal(false);
  /** Строки, по которым идёт удаление: кнопки блокируются, повторный клик не уходит на сервер. */
  readonly pendingMutationIds = signal<ReadonlySet<string>>(new Set());
  readonly openedPopoverId = signal<string | null>(null);

  readonly hasFilters = computed(
    () => !!this.search().trim() || this.statuses().length > 0 || this.studyForms().length > 0,
  );

  private readonly reloadTriggers = new Subject<ReloadTrigger>();

  ngOnInit(): void {
    this.reloadTriggers
      .pipe(
        // Ввод в поиске ждёт паузу; смена фильтра, сортировки или страницы грузит сразу.
        switchMap((trigger) =>
          trigger.debounce ? timer(SEARCH_DEBOUNCE_MS).pipe(map(() => trigger)) : of(trigger),
        ),
        tap(() => this.loading.set(true)),
        // switchMap отменяет устаревший запрос: ответ на старый фильтр не перетрёт новый.
        switchMap(() =>
          this.studentsApi.getStudents(this.buildQuery()).pipe(
            catchError(() => {
              this.message.error('Не удалось загрузить список студентов');
              return of<Page<StudentRow> | null>(null);
            }),
            finalize(() => this.loading.set(false)),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((page) => {
        if (page) {
          this.page.set(page);
        }
      });

    this.reload();
  }

  onSearchChange(value: string): void {
    this.search.set(value);
    this.pageNumber.set(1);
    this.reload(true);
  }

  onStatusesChange(statuses: StudentStatus[]): void {
    this.statuses.set(statuses);
    this.pageNumber.set(1);
    this.reload();
  }

  onStudyFormsChange(studyForms: StudyForm[]): void {
    this.studyForms.set(studyForms);
    this.pageNumber.set(1);
    this.reload();
  }

  resetFilters(): void {
    this.search.set('');
    this.statuses.set([]);
    this.studyForms.set([]);
    this.pageNumber.set(1);
    this.reload();
  }

  sortOrder(column: StudentsOrderByColumn): NzTableSortOrder {
    if (this.orderByColumn() !== column) return null;
    return this.orderByDirection() === OrderByDirection.Asc ? 'ascend' : 'descend';
  }

  onSortChange(column: StudentsOrderByColumn, order: NzTableSortOrder): void {
    // Снятие сортировки возвращает порядок по ФИО, а не «как пришло».
    this.orderByColumn.set(order ? column : StudentsOrderByColumn.FullName);
    this.orderByDirection.set(order === 'descend' ? OrderByDirection.Desc : OrderByDirection.Asc);
    this.reload();
  }

  onPageIndexChange(pageNumber: number): void {
    this.pageNumber.set(pageNumber);
    this.reload();
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSize.set(pageSize);
    this.pageNumber.set(1);
    this.reload();
  }

  isPending(studentId: string): boolean {
    return this.pendingMutationIds().has(studentId);
  }

  deleteStudent(row: StudentRow): void {
    if (this.isPending(row.studentId)) {
      return;
    }
    this.openedPopoverId.set(null);

    this.modal.confirm({
      nzTitle: 'Удалить студента?',
      nzContent: `${row.fullName} будет удалён(а) без возможности восстановления.`,
      nzOkText: 'Удалить',
      nzOkDanger: true,
      nzCancelText: 'Отмена',
      nzOnOk: () => this.confirmDelete(row.studentId),
    });
  }

  resetDemoData(): void {
    resetMockDatabase();
    this.resetFilters();
    this.message.info('Демо-данные восстановлены');
  }

  private confirmDelete(studentId: string): void {
    this.setPending(studentId, true);
    this.studentsApi
      .deleteStudent(studentId)
      .pipe(
        finalize(() => this.setPending(studentId, false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.message.success('Студент удалён');
          // Удалили последнюю строку на странице — переходим на предыдущую.
          if (this.page().items.length === 1 && this.pageNumber() > 1) {
            this.pageNumber.update((page) => page - 1);
          }
          this.reload();
        },
        error: () => this.message.error('Не удалось удалить студента'),
      });
  }

  private setPending(studentId: string, pending: boolean): void {
    this.pendingMutationIds.update((ids) => {
      const next = new Set(ids);
      if (pending) next.add(studentId);
      else next.delete(studentId);
      return next;
    });
  }

  private reload(debounce = false): void {
    this.reloadTriggers.next({ debounce });
  }

  private buildQuery(): StudentListQuery {
    return {
      search: this.search(),
      statuses: this.statuses(),
      studyForms: this.studyForms(),
      orderByColumn: this.orderByColumn(),
      orderByDirection: this.orderByDirection(),
      pageNumber: this.pageNumber(),
      pageSize: this.pageSize(),
    };
  }
}
