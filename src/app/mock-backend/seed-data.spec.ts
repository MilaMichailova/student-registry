import { createSeedStudents } from './seed-data';
import { StudentCourse, StudentStatus } from '../students/student.types';

describe('createSeedStudents', () => {
  const students = createSeedStudents();

  it('создаёт уникальных людей с уникальными id', () => {
    const names = students.map((s) => `${s.lastName} ${s.firstName}`);
    expect(new Set(names).size).toBe(students.length);
    expect(new Set(students.map((s) => s.studentId)).size).toBe(students.length);
  });

  it('выпускники — только на последнем курсе бакалавриата или магистратуры', () => {
    students
      .filter((s) => s.status === StudentStatus.Graduated)
      .forEach((s) => expect([StudentCourse.Bachelor4, StudentCourse.Master2]).toContain(s.course));
  });

  it('возраст правдоподобен для курса: 17–25 лет', () => {
    const year = new Date().getFullYear();
    students.forEach((s) => {
      const age = year - new Date(s.dateOfBirthInUnixMilliseconds).getUTCFullYear();
      expect(age).toBeGreaterThanOrEqual(17);
      expect(age).toBeLessThanOrEqual(25);
    });
  });
});
