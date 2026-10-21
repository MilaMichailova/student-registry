export enum StudentsOrderByColumn {
  CreationDate = 'CreationDate',
  FullName = 'FullName',
  Direction = 'Direction',
  Course = 'Course',
  Status = 'Status',
  StudyForm = 'StudyForm',
}

export enum OrderByDirection {
  Asc = 'Asc',
  Desc = 'Desc',
}

export enum StudentStatus {
  Studying = 'Studying',
  Internship = 'Internship',
  AcademicLeave = 'AcademicLeave',
  Transfer = 'Transfer',
  Graduated = 'Graduated',
  Expelled = 'Expelled',
}

export enum StudyForm {
  Budget = 'Budget',
  Contract = 'Contract',
  Targeted = 'Targeted',
}

export enum StudentCourse {
  None = 'None',
  Bachelor1 = 'Bachelor1',
  Bachelor2 = 'Bachelor2',
  Bachelor3 = 'Bachelor3',
  Bachelor4 = 'Bachelor4',
  Master1 = 'Master1',
  Master2 = 'Master2',
}

export interface SelectOption<T> {
  value: T;
  label: string;
}

export const STUDENT_STATUS_OPTIONS: SelectOption<StudentStatus>[] = [
  { value: StudentStatus.Studying, label: 'Обучается' },
  { value: StudentStatus.Internship, label: 'На практике' },
  { value: StudentStatus.AcademicLeave, label: 'Академический отпуск' },
  { value: StudentStatus.Transfer, label: 'Перевод' },
  { value: StudentStatus.Graduated, label: 'Выпускник' },
  { value: StudentStatus.Expelled, label: 'Отчислен' },
];

export const STUDY_FORM_OPTIONS: SelectOption<StudyForm>[] = [
  { value: StudyForm.Budget, label: 'Бюджет' },
  { value: StudyForm.Contract, label: 'Контракт' },
  { value: StudyForm.Targeted, label: 'Целевое' },
];

export const STUDENT_COURSE_OPTIONS: SelectOption<StudentCourse>[] = [
  { value: StudentCourse.None, label: 'Не указан' },
  { value: StudentCourse.Bachelor1, label: '1 курс' },
  { value: StudentCourse.Bachelor2, label: '2 курс' },
  { value: StudentCourse.Bachelor3, label: '3 курс' },
  { value: StudentCourse.Bachelor4, label: '4 курс' },
  { value: StudentCourse.Master1, label: 'Магистратура, 1 курс' },
  { value: StudentCourse.Master2, label: 'Магистратура, 2 курс' },
];

/** Цвет тега статуса в таблице и карточке. */
export const STUDENT_STATUS_COLORS: Record<StudentStatus, string> = {
  [StudentStatus.Studying]: 'blue',
  [StudentStatus.Internship]: 'cyan',
  [StudentStatus.AcademicLeave]: 'orange',
  [StudentStatus.Transfer]: 'purple',
  [StudentStatus.Graduated]: 'green',
  [StudentStatus.Expelled]: 'default',
};

function getLabel<T>(
  options: readonly SelectOption<T>[],
  value: T | null | undefined,
  fallback = '—',
): string {
  return options.find((option) => option.value === value)?.label ?? fallback;
}

export function getStudentStatusLabel(status: StudentStatus | null | undefined): string {
  return getLabel(STUDENT_STATUS_OPTIONS, status);
}

export function getStudyFormLabel(studyForm: StudyForm | null | undefined): string {
  return getLabel(STUDY_FORM_OPTIONS, studyForm);
}

export function getStudentCourseLabel(course: StudentCourse | null | undefined): string {
  return course === StudentCourse.None ? '—' : getLabel(STUDENT_COURSE_OPTIONS, course);
}
