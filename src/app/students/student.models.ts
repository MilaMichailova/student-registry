import {
  OrderByDirection,
  StudentCourse,
  StudentsOrderByColumn,
  StudentStatus,
  StudyForm,
} from './student.types';

export interface StudentContacts {
  email: string | null;
  mobilePhoneNumber: string | null;
  telegramUsername: string | null;
}

export interface StudentTechnicalSkills {
  programmingLanguages: string[];
  frameworks: string[];
  databases: string[];
  tools: string[];
}

export interface StudentProject {
  discipline: string | null;
  projectName: string | null;
  description: string | null;
  dateStart: number | null;
  dateEnd: number | null;
  role: string | null;
  technologies: string[];
  teamInfo: string | null;
  responsibilities: string[];
  achievements: string[];
}

export interface StudentLanguage {
  name: string | null;
  level: string | null;
}

/** Полная карточка студента; даты — календарные дни в Unix-миллисекундах (UTC-полночь). */
export interface Student {
  studentId: string;
  firstName: string | null;
  lastName: string | null;
  middleName: string | null;
  dateOfBirthInUnixMilliseconds: number;
  group: string | null;
  directionId: string | null;
  additionalDirectionIds: string[];
  status: StudentStatus;
  studyForm: StudyForm;
  course: StudentCourse;
  about: string | null;
  contacts: StudentContacts;
  technicalSkills: StudentTechnicalSkills;
  projects: StudentProject[];
  languages: StudentLanguage[];
  softSkills: string[];
  createdAtInUnixMilliseconds: number;
}

export type StudentSaveRequest = Omit<Student, 'createdAtInUnixMilliseconds'>;

/** Строка таблицы — то, что список получает с «сервера» вместо полной карточки. */
export interface StudentRow {
  studentId: string;
  fullName: string;
  group: string | null;
  directionName: string | null;
  course: StudentCourse;
  status: StudentStatus;
  studyForm: StudyForm;
  createdAtInUnixMilliseconds: number;
}

export interface StudentListQuery {
  search: string;
  statuses: StudentStatus[];
  studyForms: StudyForm[];
  orderByColumn: StudentsOrderByColumn;
  orderByDirection: OrderByDirection;
  pageNumber: number;
  pageSize: number;
}

export interface Page<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
}

export interface DictionaryItem {
  id: string;
  name: string;
}
