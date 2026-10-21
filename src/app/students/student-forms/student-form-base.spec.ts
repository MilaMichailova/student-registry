import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NzMessageService } from 'ng-zorro-antd/message';
import { StudentFormBase, parseTags } from './student-form-base';
import { StudentCourse, StudentStatus, StudyForm } from '../student.types';

@Component({ template: '' })
class TestStudentForm extends StudentFormBase {
  validate(): boolean {
    return this.validateForm();
  }

  request() {
    return this.buildSaveRequest('student-1');
  }

  fillRequired(): void {
    this.form.patchValue({
      dateOfBirth: new Date(2004, 4, 17),
      directionId: 'dir-software',
      status: StudentStatus.Studying,
      studyForm: StudyForm.Budget,
      course: StudentCourse.Bachelor2,
    });
  }
}

describe('StudentFormBase', () => {
  let component: TestStudentForm;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: NzMessageService, useValue: { error: () => {} } }],
    });
    component = TestBed.createComponent(TestStudentForm).componentInstance;
  });

  it('не пропускает курс «Не указан», хотя значение задано', () => {
    component.fillRequired();
    component.courseControl.setValue(StudentCourse.None);

    expect(component.validate()).toBe(false);
    expect(component.courseControl.hasError('pattern')).toBe(true);
  });

  it('раскрывает секции и проекты, в которых есть ошибки', () => {
    component.fillRequired();
    component.setSectionActive('main', false);
    component.telegramControl.setValue('не логин');
    component.projectsFormControl.push(component.createProjectGroup()); // без обязательной даты начала
    component.projectsFormControl.push(
      component.createProjectGroup({
        discipline: null,
        projectName: 'Готовый',
        description: null,
        dateStart: Date.UTC(2024, 0, 1),
        dateEnd: null,
        role: null,
        technologies: [],
        teamInfo: null,
        responsibilities: [],
        achievements: [],
      }),
    );

    expect(component.validate()).toBe(false);
    expect(component.isSectionActive('main')).toBe(false);
    expect(component.isSectionActive('contacts')).toBe(true);
    expect(component.isSectionActive('projects')).toBe(true);
    expect([...component.invalidProjectIndexes()]).toEqual([0]);
  });

  it('пустой пункт личных качеств — ошибка, которую нужно исправить или удалить', () => {
    component.fillRequired();
    component.softSkillsFormControl.push(component.createSoftSkillControl());

    expect(component.validate()).toBe(false);
    expect(component.isSectionActive('softSkills')).toBe(true);

    component.softSkillsFormControl.removeAt(0);
    expect(component.validate()).toBe(true);
  });

  it('собирает запрос: теги разбиты, пустые элементы массивов отброшены, даты в UTC', () => {
    component.fillRequired();
    component.form.patchValue({ lastName: '  Орлова ', frameworks: 'Angular, , RxJS ' });

    const project = component.createProjectGroup();
    project.patchValue({ projectName: 'Расписание', dateStart: new Date(2024, 1, 1) });
    project.controls.responsibilities.push(component.createSoftSkillControl('Вёрстка'));
    project.controls.responsibilities.push(component.createSoftSkillControl('  '));
    component.projectsFormControl.push(project);
    component.projectsFormControl.push(component.createProjectGroup()); // полностью пустой

    component.languagesFormControl.push(component.createLanguageGroup());
    component.languagesFormControl.push(
      component.createLanguageGroup({ name: 'Английский', level: 'B2' }),
    );

    const request = component.request();

    expect(request.lastName).toBe('Орлова');
    expect(request.technicalSkills.frameworks).toEqual(['Angular', 'RxJS']);
    expect(request.dateOfBirthInUnixMilliseconds).toBe(Date.UTC(2004, 4, 17));
    expect(request.projects).toHaveLength(1);
    expect(request.projects[0].dateStart).toBe(Date.UTC(2024, 1, 1));
    expect(request.projects[0].responsibilities).toEqual(['Вёрстка']);
    expect(request.languages).toEqual([{ name: 'Английский', level: 'B2' }]);
  });
});

describe('parseTags', () => {
  it('режет по запятым и выбрасывает пустое', () => {
    expect(parseTags(' C#, , Python,')).toEqual(['C#', 'Python']);
    expect(parseTags(null)).toEqual([]);
  });
});
