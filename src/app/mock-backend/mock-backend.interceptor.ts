import {
  HttpErrorResponse,
  HttpEvent,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable, delay, dematerialize, materialize, of, throwError } from 'rxjs';
import { Page, Student, StudentRow, StudentSaveRequest } from '../students/student.models';
import {
  OrderByDirection,
  StudentsOrderByColumn,
  StudentStatus,
  StudyForm,
  STUDENT_COURSE_OPTIONS,
  STUDENT_STATUS_OPTIONS,
  STUDY_FORM_OPTIONS,
} from '../students/student.types';
import { API_URL } from '../shared/api-url';
import { STUDY_DIRECTIONS, createSeedStudents } from './seed-data';

const STORAGE_KEY = 'student-registry-demo';
const LATENCY_MS = 400;

/**
 * Имитация REST API для демо: данные живут в localStorage, ответы приходят с задержкой,
 * как от настоящего сервера. Компоненты и сервисы о подмене не знают.
 */
export const mockBackendInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith(API_URL)) {
    return next(request);
  }

  return handle(request).pipe(materialize(), delay(LATENCY_MS), dematerialize());
};

function handle(request: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
  const path = request.url.slice(API_URL.length);
  const studentIdMatch = /^\/students\/([^/]+)$/.exec(path);

  if (path === '/study-directions' && request.method === 'GET') {
    return ok({ items: STUDY_DIRECTIONS });
  }
  if (path === '/students' && request.method === 'GET') {
    return ok(queryStudents(request));
  }
  if (path === '/students' && request.method === 'POST') {
    const body = request.body as StudentSaveRequest;
    saveStudents([...loadStudents(), { ...body, createdAtInUnixMilliseconds: Date.now() }]);
    return ok(null, 201);
  }
  if (studentIdMatch) {
    const studentId = decodeURIComponent(studentIdMatch[1]);
    const students = loadStudents();
    const index = students.findIndex((student) => student.studentId === studentId);
    if (index === -1) {
      return error(404, 'Студент не найден');
    }

    switch (request.method) {
      case 'GET':
        return ok(students[index]);
      case 'PUT': {
        const body = request.body as StudentSaveRequest;
        students[index] = {
          ...body,
          createdAtInUnixMilliseconds: students[index].createdAtInUnixMilliseconds,
        };
        saveStudents(students);
        return ok(null, 204);
      }
      case 'DELETE':
        saveStudents(students.filter((student) => student.studentId !== studentId));
        return ok(null, 204);
    }
  }

  return error(404, `Нет обработчика для ${request.method} ${request.url}`);
}

function queryStudents(request: HttpRequest<unknown>): Page<StudentRow> {
  const params = request.params;
  const search = (params.get('search') ?? '').toLowerCase();
  const statuses = (params.getAll('statuses') ?? []) as StudentStatus[];
  const studyForms = (params.getAll('studyForms') ?? []) as StudyForm[];
  const orderByColumn = params.get('orderByColumn') as StudentsOrderByColumn;
  const direction = params.get('orderByDirection') === OrderByDirection.Desc ? -1 : 1;
  const pageNumber = Number(params.get('pageNumber') ?? 1);
  const pageSize = Number(params.get('pageSize') ?? 10);

  const rows = loadStudents()
    .map(toRow)
    .filter(
      (row) =>
        (!search ||
          row.fullName.toLowerCase().includes(search) ||
          (row.group ?? '').toLowerCase().includes(search)) &&
        (!statuses.length || statuses.includes(row.status)) &&
        (!studyForms.length || studyForms.includes(row.studyForm)),
    )
    .sort((a, b) => compareRows(a, b, orderByColumn) * direction);

  const start = (pageNumber - 1) * pageSize;
  return {
    items: rows.slice(start, start + pageSize),
    totalItems: rows.length,
    totalPages: Math.ceil(rows.length / pageSize),
  };
}

function compareRows(a: StudentRow, b: StudentRow, column: StudentsOrderByColumn): number {
  const byOptionOrder = <T>(options: { value: T }[], left: T, right: T) =>
    options.findIndex((option) => option.value === left) -
    options.findIndex((option) => option.value === right);

  switch (column) {
    case StudentsOrderByColumn.Direction:
      return (a.directionName ?? '').localeCompare(b.directionName ?? '', 'ru');
    case StudentsOrderByColumn.Course:
      return byOptionOrder(STUDENT_COURSE_OPTIONS, a.course, b.course);
    case StudentsOrderByColumn.Status:
      return byOptionOrder(STUDENT_STATUS_OPTIONS, a.status, b.status);
    case StudentsOrderByColumn.StudyForm:
      return byOptionOrder(STUDY_FORM_OPTIONS, a.studyForm, b.studyForm);
    case StudentsOrderByColumn.CreationDate:
      return a.createdAtInUnixMilliseconds - b.createdAtInUnixMilliseconds;
    default:
      return a.fullName.localeCompare(b.fullName, 'ru');
  }
}

function toRow(student: Student): StudentRow {
  return {
    studentId: student.studentId,
    fullName:
      [student.lastName, student.firstName, student.middleName].filter(Boolean).join(' ') ||
      'Без имени',
    group: student.group,
    directionName: STUDY_DIRECTIONS.find((item) => item.id === student.directionId)?.name ?? null,
    course: student.course,
    status: student.status,
    studyForm: student.studyForm,
    createdAtInUnixMilliseconds: student.createdAtInUnixMilliseconds,
  };
}

function loadStudents(): Student[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as Student[];
    }
  } catch {
    // Хранилище недоступно (приватный режим) — работаем на свежем наборе.
  }
  const seed = createSeedStudents();
  saveStudents(seed);
  return seed;
}

function saveStudents(students: Student[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  } catch {
    // Без хранилища изменения не переживут перезагрузку — для демо это допустимо.
  }
}

/** Вернуть демо-данные к исходному набору. */
export function resetMockDatabase(): void {
  saveStudents(createSeedStudents());
}

function ok(body: unknown, status = 200): Observable<HttpEvent<unknown>> {
  return of(new HttpResponse({ status, body }));
}

function error(status: number, message: string): Observable<never> {
  return throwError(() => new HttpErrorResponse({ status, error: { message } }));
}
