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
const BASE_DATE = Date.UTC(2004, 0, 15);

/** Детерминированный набор вымышленных студентов: одинаковый при каждом сбросе демо. */
export function createSeedStudents(): Student[] {
  return Array.from({ length: 24 }, (_, index) => {
    const direction = STUDY_DIRECTIONS[index % STUDY_DIRECTIONS.length];
    const extraDirection = STUDY_DIRECTIONS[(index + 3) % STUDY_DIRECTIONS.length];
    // Шаг 5 взаимно прост с 24 — каждый человек встречается ровно один раз, но вперемешку.
    const [lastName, firstName, middleName] = PEOPLE[(index * 5) % PEOPLE.length];
    const course = COURSES[index % COURSES.length];

    return {
      studentId: `seed-${index + 1}`,
      lastName,
      firstName,
      middleName,
      dateOfBirthInUnixMilliseconds: BASE_DATE + index * 47 * DAY_MS,
      group: `ИТ-${21 + (index % 4)}${(index % 3) + 1}`,
      directionId: direction.id,
      additionalDirectionIds: index % 3 === 0 ? [extraDirection.id] : [],
      status: STATUSES[index % STATUSES.length],
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
