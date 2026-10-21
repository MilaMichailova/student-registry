import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { StudentFormBase } from '../student-form-base';
import { StudentMainInfoSection } from '../student-main-info-section/student-main-info-section';
import { StudentContactsSection } from '../student-contacts-section/student-contacts-section';
import { StudentSkillsSection } from '../student-skills-section/student-skills-section';
import { StudentProjectsSection } from '../student-projects-section/student-projects-section';
import { StudentLanguagesSection } from '../student-languages-section/student-languages-section';
import { StudentSoftSkillsSection } from '../student-soft-skills-section/student-soft-skills-section';

/** Набор секций формы, общий для создания и редактирования. */
@Component({
  selector: 'app-student-form-sections',
  imports: [
    StudentMainInfoSection,
    StudentContactsSection,
    StudentSkillsSection,
    StudentProjectsSection,
    StudentLanguagesSection,
    StudentSoftSkillsSection,
  ],
  template: `
    <app-student-main-info-section
      [formGroup]="host.form"
      [active]="host.isSectionActive('main')"
      (activeChange)="host.setSectionActive('main', $event)"
    />
    <app-student-contacts-section
      [formGroup]="host.form"
      [active]="host.isSectionActive('contacts')"
      (activeChange)="host.setSectionActive('contacts', $event)"
    />
    <app-student-skills-section
      [formGroup]="host.form"
      [active]="host.isSectionActive('skills')"
      (activeChange)="host.setSectionActive('skills', $event)"
    />
    <app-student-projects-section
      [projectsArray]="host.projectsFormControl"
      [createProject]="createProject"
      [invalidProjectIndexes]="host.invalidProjectIndexes()"
      [active]="host.isSectionActive('projects')"
      (activeChange)="host.setSectionActive('projects', $event)"
      (projectsChange)="host.form.updateValueAndValidity()"
    />
    <app-student-languages-section
      [languagesArray]="host.languagesFormControl"
      [createLanguage]="createLanguage"
      [active]="host.isSectionActive('languages')"
      (activeChange)="host.setSectionActive('languages', $event)"
      (languagesChange)="host.form.updateValueAndValidity()"
    />
    <app-student-soft-skills-section
      [softSkillsArray]="host.softSkillsFormControl"
      [createSoftSkill]="createSoftSkill"
      [active]="host.isSectionActive('softSkills')"
      (activeChange)="host.setSectionActive('softSkills', $event)"
      (softSkillsChange)="host.form.updateValueAndValidity()"
    />
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class StudentFormSections {
  @Input({ required: true }) host!: StudentFormBase;

  // Стрелочные функции — стабильные ссылки для input, с правильным this.
  readonly createProject = () => this.host.createProjectGroup();
  readonly createLanguage = () => this.host.createLanguageGroup();
  readonly createSoftSkill = () => this.host.createSoftSkillControl();
}
