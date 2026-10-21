import { DictionaryItem, Student } from '../students/student.models';
import { StudentCourse, StudentStatus, StudyForm } from '../students/student.types';

export const STUDY_DIRECTIONS: DictionaryItem[] = [
  { id: 'dir-software', name: 'Программная инженерия' },
  { id: 'dir-applied', name: 'Прикладная информатика' },
  { id: 'dir-security', name: 'Информационная безопасность' },
  { id: 'dir-data', name: 'Анализ данных' },
  { id: 'dir-ux', name: 'Дизайн интерфейсов' },
  { id: 'dir-business', name: 'Бизнес-информатика' },
  { id: 'dir-math', name: 'Математическое моделирование' },
];

/** Вымышленные ФИО: [фамилия, имя, отчество]. */
const PEOPLE: [string, string, string | null][] = [
  ['Орлова', 'Анна', 'Сергеевна'],
  ['Соколов', 'Илья', 'Андреевич'],
  ['Лебедева', 'Мария', 'Игоревна'],
  ['Козлов', 'Денис', 'Павлович'],
  ['Новикова', 'Ольга', null],
  ['Морозов', 'Артём', 'Олегович'],
  ['Волкова', 'Вера', 'Ильинична'],
  ['Зайцев', 'Кирилл', null],
  ['Белова', 'Ксения', 'Петровна'],
  ['Фролов', 'Максим', 'Дмитриевич'],
  ['Киселёва', 'Дарья', null],
  ['Егоров', 'Глеб', 'Романович'],
  ['Миронова', 'Алиса', 'Викторовна'],
  ['Тихонов', 'Роман', null],
  ['Голубева', 'Полина', 'Андреевна'],
  ['Кузнецов', 'Тимофей', 'Сергеевич'],
  ['Захарова', 'Ева', null],
  ['Степанов', 'Лев', 'Игоревич'],
  ['Афанасьева', 'Софья', 'Николаевна'],
  ['Борисов', 'Марк', 'Евгеньевич'],
  ['Никитина', 'Таисия', null],
  ['Медведев', 'Фёдор', 'Алексеевич'],
  ['Крылова', 'Милана', 'Олеговна'],
  ['Гусев', 'Даниил', null],
];

const STATUSES = Object.values(StudentStatus);
const STUDY_FORMS = Object.values(StudyForm);
const COURSES = Object.values(StudentCourse).filter((course) => course !== StudentCourse.None);

const DAY_MS = 24 * 60 * 60 * 1000;
const CURRENT_YEAR = new Date().getFullYear();

/** Год обучения: 1–4 бакалавриат, 5–6 магистратура. */
const COURSE_YEAR: Record<StudentCourse, number> = {
  [StudentCourse.None]: 1,
  [StudentCourse.Bachelor1]: 1,
  [StudentCourse.Bachelor2]: 2,
  [StudentCourse.Bachelor3]: 3,
  [StudentCourse.Bachelor4]: 4,
  [StudentCourse.Master1]: 5,
  [StudentCourse.Master2]: 6,
};

/** Курс, правдоподобный для статуса: выпускник — на последнем курсе, практика — со 3-го. */
function courseForStatus(status: StudentStatus, index: number): StudentCourse {
  switch (status) {
    case StudentStatus.Graduated:
      return index % 2 === 0 ? StudentCourse.Bachelor4 : StudentCourse.Master2;
    case StudentStatus.Internship:
      return index % 2 === 0 ? StudentCourse.Bachelor3 : StudentCourse.Bachelor4;
    default:
      return COURSES[index % COURSES.length];
  }
}

/** Дата рождения: поступление в 18 лет, плюс годы обучения и разброс в пределах года. */
function birthDateForCourse(course: StudentCourse, index: number): number {
  const birthYear = CURRENT_YEAR - 17 - COURSE_YEAR[course];
  return Date.UTC(birthYear, 0, 1) + ((index * 47) % 365) * DAY_MS;
}

/** Детерминированный набор вымышленных студентов: одинаковый при каждом сбросе демо. */
export function createSeedStudents(): Student[] {
  return Array.from({ length: 24 }, (_, index) => {
    const direction = STUDY_DIRECTIONS[index % STUDY_DIRECTIONS.length];
    const extraDirection = STUDY_DIRECTIONS[(index + 3) % STUDY_DIRECTIONS.length];
    // Шаг 5 взаимно прост с 24 — каждый человек встречается ровно один раз, но вперемешку.
    const [lastName, firstName, middleName] = PEOPLE[(index * 5) % PEOPLE.length];
    const status = STATUSES[index % STATUSES.length];
    const course = courseForStatus(status, index);
    // Номер группы: год поступления и номер потока, например ИТ-233.
    const entryYear = (CURRENT_YEAR - COURSE_YEAR[course] + 1) % 100;

    return {
      studentId: `seed-${index + 1}`,
      lastName,
      firstName,
      middleName,
      dateOfBirthInUnixMilliseconds: birthDateForCourse(course, index),
      group: `ИТ-${entryYear}${(index % 3) + 1}`,
      directionId: direction.id,
      additionalDirectionIds: index % 3 === 0 ? [extraDirection.id] : [],
      status,
      studyForm: STUDY_FORMS[index % STUDY_FORMS.length],
      course,
      about: index % 2 === 0 ? 'Интересуется веб-разработкой и командными проектами.' : null,
      contacts: {
        email: `student${index + 1}@example.edu`,
        mobilePhoneNumber:
          index % 2 === 0 ? `+7 900 000-${String(index).padStart(2, '0')}-00` : null,
        telegramUsername: index % 4 === 0 ? `@student_${index + 1}` : null,
      },
      technicalSkills: {
        programmingLanguages: index % 2 === 0 ? ['TypeScript', 'Python'] : ['C#'],
        frameworks: index % 2 === 0 ? ['Angular'] : ['.NET'],
        databases: ['PostgreSQL'],
        tools: ['Git'],
      },
      projects:
        index % 2 === 0
          ? [
              {
                discipline: 'Веб-программирование',
                projectName: 'Расписание занятий',
                description: 'Веб-приложение для просмотра расписания группы.',
                dateStart: Date.UTC(2024, 1, 1),
                dateEnd: Date.UTC(2024, 4, 31),
                role: 'Фронтенд-разработчик',
                technologies: ['Angular', 'TypeScript'],
                teamInfo: '3 человека',
                responsibilities: ['Вёрстка страниц', 'Работа с формами'],
                achievements: ['Защищён на «отлично»'],
              },
            ]
          : [],
      languages: [{ name: 'Английский', level: index % 2 === 0 ? 'B2' : 'B1' }],
      softSkills: ['Работа в команде'],
      createdAtInUnixMilliseconds: Date.UTC(2025, 8, 1) + index * DAY_MS,
    } satisfies Student;
  });
}
