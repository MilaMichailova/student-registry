import { ChangeDetectorRef, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import {
  LanguageFormGroup,
  ProjectFormGroup,
  StudentForm,
  StudentFormSection,
} from './student-forms.types';
import { StudentCourse, StudentStatus, StudyForm } from '../student.types';
import { Student, StudentLanguage, StudentProject, StudentSaveRequest } from '../student.models';
import { telegramValidator } from '../../shared/utils/telegram.validator';
import { dateRangeValidator, notInFutureValidator } from '../../shared/utils/date.validators';
import {
  calendarDateToUnixMilliseconds,
  unixMillisecondsToCalendarDate,
} from '../../shared/utils/calendar-date.utils';

/**
 * Общая форма студента для страниц создания и редактирования.
 * Секции получают свои контролы через input, а валидация и раскрытие секций с ошибками живут здесь.
 */
export abstract class StudentFormBase {
  protected readonly formBuilder = inject(NonNullableFormBuilder);
  protected readonly message = inject(NzMessageService);
  protected readonly cdr = inject(ChangeDetectorRef);

  lastNameControl = this.formBuilder.control<string | null>(null);
  firstNameControl = this.formBuilder.control<string | null>(null);
  middleNameControl = this.formBuilder.control<string | null>(null);
  dateOfBirthControl = this.formBuilder.control<Date | null>(null, [
    Validators.required,
    notInFutureValidator(),
  ]);
  groupControl = this.formBuilder.control<string | null>(null);
  directionIdControl = this.formBuilder.control<string | null>(null, [Validators.required]);
  additionalDirectionIdsControl = this.formBuilder.control<string[]>([]);
  statusControl = this.formBuilder.control<StudentStatus | null>(null, [Validators.required]);
  studyFormControl = this.formBuilder.control<StudyForm | null>(null, [Validators.required]);
  // «Не указан» — значение по умолчанию, но не допустимый выбор: pattern отсекает None.
  courseControl = this.formBuilder.control<StudentCourse>(StudentCourse.None, [
    Validators.required,
    Validators.pattern(/^(?!None$).+/),
  ]);
  aboutControl = this.formBuilder.control<string | null>(null);

  emailControl = this.formBuilder.control<string | null>(null, [Validators.email]);
  phoneControl = this.formBuilder.control<string | null>(null);
  telegramControl = this.formBuilder.control<string | null>(null, [telegramValidator()]);

  programmingLanguagesControl = this.formBuilder.control<string | null>(null);
  frameworksControl = this.formBuilder.control<string | null>(null);
  databasesControl = this.formBuilder.control<string | null>(null);
  toolsControl = this.formBuilder.control<string | null>(null);

  projectsFormControl = this.formBuilder.array<ProjectFormGroup>([]);
  languagesFormControl = this.formBuilder.array<LanguageFormGroup>([]);
  softSkillsFormControl = this.formBuilder.array<FormControl<string | null>>([]);

  form = new FormGroup({
    lastName: this.lastNameControl,
    firstName: this.firstNameControl,
    middleName: this.middleNameControl,
    dateOfBirth: this.dateOfBirthControl,
    group: this.groupControl,
    directionId: this.directionIdControl,
    additionalDirectionIds: this.additionalDirectionIdsControl,
    status: this.statusControl,
    studyForm: this.studyFormControl,
    course: this.courseControl,
    about: this.aboutControl,
    email: this.emailControl,
    phone: this.phoneControl,
    telegram: this.telegramControl,
    programmingLanguages: this.programmingLanguagesControl,
    frameworks: this.frameworksControl,
    databases: this.databasesControl,
    tools: this.toolsControl,
    projects: this.projectsFormControl,
    languages: this.languagesFormControl,
    softSkills: this.softSkillsFormControl,
  }) as StudentForm;

  readonly activeSections = signal<ReadonlySet<StudentFormSection>>(new Set(['main']));
  readonly invalidProjectIndexes = signal<ReadonlySet<number>>(new Set());

  protected validateForm(): boolean {
    this.form.markAllAsTouched();
    this.refreshValidationState(this.form);
    this.expandInvalidSections();
    return this.form.valid;
  }

  /**
   * Enter в поле не отправляет многосекционную форму — сохранение только кнопкой.
   * Иначе Enter в date-picker отправлял форму раньше, чем picker записывал введённую дату,
   * и на сервер уходило старое значение. В textarea Enter по-прежнему переносит строку.
   */
  preventImplicitSubmit(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      event.preventDefault();
    }
  }

  isSectionActive(section: StudentFormSection): boolean {
    return this.activeSections().has(section);
  }

  setSectionActive(section: StudentFormSection, active: boolean): void {
    this.activeSections.update((sections) => {
      if (sections.has(section) === active) return sections;
      const next = new Set(sections);
      if (active) next.add(section);
      else next.delete(section);
      return next;
    });
  }

  protected scrollToFirstError(containerSelector: string): void {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    this.expandInvalidSections();
    this.cdr.detectChanges();

    setTimeout(() => {
      // NgControlStatus помечает и контролы, и группы; прокручиваем к контролу, а не к его группе.
      const firstError = container.querySelector<HTMLElement>(
        '[formControlName].ng-invalid, input.ng-invalid, textarea.ng-invalid',
      );
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    });
  }

  /** Новый проект; без аргумента — пустой, с данными — заполненный (при редактировании). */
  createProjectGroup(project?: StudentProject): ProjectFormGroup {
    return this.formBuilder.group(
      {
        discipline: [project?.discipline ?? null],
        projectName: [project?.projectName ?? null],
        dateStart: [unixMillisecondsToCalendarDate(project?.dateStart), [Validators.required]],
        dateEnd: [unixMillisecondsToCalendarDate(project?.dateEnd)],
        role: [project?.role ?? null],
        technologies: [project?.technologies.join(', ') || null],
        description: [project?.description ?? null],
        teamInfo: [project?.teamInfo ?? null],
        responsibilities: this.formBuilder.array<FormControl<string | null>>(
          (project?.responsibilities ?? []).map((item) =>
            this.formBuilder.control<string | null>(item),
          ),
        ),
        achievements: this.formBuilder.array<FormControl<string | null>>(
          (project?.achievements ?? []).map((item) =>
            this.formBuilder.control<string | null>(item),
          ),
        ),
      },
      { validators: dateRangeValidator('dateStart', 'dateEnd') },
    ) as ProjectFormGroup;
  }

  createLanguageGroup(language?: StudentLanguage): LanguageFormGroup {
    return this.formBuilder.group({
      name: [language?.name ?? null],
      level: [language?.level ?? null],
    }) as LanguageFormGroup;
  }

  createSoftSkillControl(value: string | null = null): FormControl<string | null> {
    return this.formBuilder.control<string | null>(value, [Validators.required]);
  }

  /** Заполнить форму данными студента; массивы пересобираются целиком. */
  protected patchFromStudent(student: Student): void {
    this.form.patchValue({
      lastName: student.lastName,
      firstName: student.firstName,
      middleName: student.middleName,
      dateOfBirth: unixMillisecondsToCalendarDate(student.dateOfBirthInUnixMilliseconds),
      group: student.group,
      directionId: student.directionId,
      additionalDirectionIds: student.additionalDirectionIds,
      status: student.status,
      studyForm: student.studyForm,
      course: student.course,
      about: student.about,
      email: student.contacts.email,
      phone: student.contacts.mobilePhoneNumber,
      telegram: student.contacts.telegramUsername,
      programmingLanguages: student.technicalSkills.programmingLanguages.join(', ') || null,
      frameworks: student.technicalSkills.frameworks.join(', ') || null,
      databases: student.technicalSkills.databases.join(', ') || null,
      tools: student.technicalSkills.tools.join(', ') || null,
    });

    this.projectsFormControl.clear();
    student.projects.forEach((project) =>
      this.projectsFormControl.push(this.createProjectGroup(project)),
    );
    this.languagesFormControl.clear();
    student.languages.forEach((language) =>
      this.languagesFormControl.push(this.createLanguageGroup(language)),
    );
    this.softSkillsFormControl.clear();
    student.softSkills.forEach((skill) =>
      this.softSkillsFormControl.push(this.createSoftSkillControl(skill)),
    );
  }

  /** Собрать запрос из формы: пустые элементы массивов отбрасываются, строки тегов разбиваются. */
  protected buildSaveRequest(studentId: string): StudentSaveRequest {
    const formValue = this.form.getRawValue();

    return {
      studentId,
      firstName: formValue.firstName?.trim() || null,
      lastName: formValue.lastName?.trim() || null,
      middleName: formValue.middleName?.trim() || null,
      dateOfBirthInUnixMilliseconds: formValue.dateOfBirth
        ? calendarDateToUnixMilliseconds(formValue.dateOfBirth)
        : 0,
      group: formValue.group?.trim() || null,
      directionId: formValue.directionId || null,
      additionalDirectionIds: formValue.additionalDirectionIds ?? [],
      status: formValue.status!,
      studyForm: formValue.studyForm!,
      course: formValue.course || StudentCourse.None,
      about: formValue.about?.trim() || null,
      contacts: {
        email: formValue.email?.trim() || null,
        mobilePhoneNumber: formValue.phone?.trim() || null,
        telegramUsername: formValue.telegram?.trim() || null,
      },
      technicalSkills: {
        programmingLanguages: parseTags(formValue.programmingLanguages),
        frameworks: parseTags(formValue.frameworks),
        databases: parseTags(formValue.databases),
        tools: parseTags(formValue.tools),
      },
      projects: this.projectsFormControl.controls
        .map((projectGroup) => {
          const project = projectGroup.getRawValue();
          return {
            discipline: project.discipline?.trim() || null,
            projectName: project.projectName?.trim() || null,
            description: project.description?.trim() || null,
            dateStart: project.dateStart ? calendarDateToUnixMilliseconds(project.dateStart) : null,
            dateEnd: project.dateEnd ? calendarDateToUnixMilliseconds(project.dateEnd) : null,
            role: project.role?.trim() || null,
            technologies: parseTags(project.technologies),
            teamInfo: project.teamInfo?.trim() || null,
            responsibilities: nonEmptyStrings(project.responsibilities),
            achievements: nonEmptyStrings(project.achievements),
          };
        })
        .filter(
          (project) =>
            project.discipline ||
            project.projectName ||
            project.dateStart ||
            project.dateEnd ||
            project.role ||
            project.description,
        ),
      languages: this.languagesFormControl.controls
        .map((languageGroup) => {
          const language = languageGroup.getRawValue();
          if (!language.name?.trim() && !language.level?.trim()) return null;
          return { name: language.name?.trim() || null, level: language.level?.trim() || null };
        })
        .filter((language): language is StudentLanguage => language !== null),
      softSkills: nonEmptyStrings(this.softSkillsFormControl.getRawValue()),
    };
  }

  private expandInvalidSections(): void {
    const sections = new Set(this.activeSections());
    const mainControls = [
      this.dateOfBirthControl,
      this.directionIdControl,
      this.statusControl,
      this.studyFormControl,
      this.courseControl,
    ];

    if (mainControls.some((control) => control.invalid)) sections.add('main');
    if (this.emailControl.invalid || this.telegramControl.invalid) sections.add('contacts');
    if (this.projectsFormControl.invalid) sections.add('projects');
    if (this.languagesFormControl.invalid) sections.add('languages');
    if (this.softSkillsFormControl.invalid) sections.add('softSkills');

    this.activeSections.set(sections);
    this.invalidProjectIndexes.set(
      new Set(
        this.projectsFormControl.controls.flatMap((project, index) =>
          project.invalid ? [index] : [],
        ),
      ),
    );
  }

  private refreshValidationState(control: AbstractControl): void {
    if (control instanceof FormGroup || control instanceof FormArray) {
      Object.values(control.controls).forEach((child) => this.refreshValidationState(child));
    }

    control.updateValueAndValidity({ onlySelf: true, emitEvent: true });
  }
}

/** «Angular, .NET ,» → ['Angular', '.NET'] */
export function parseTags(value: string | null): string[] {
  if (!value || value.trim() === '') return [];
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag !== '');
}

function nonEmptyStrings(values: (string | null)[]): string[] {
  return values.map((value) => value?.trim() ?? '').filter((value) => value !== '');
}
