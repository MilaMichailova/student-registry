import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { StudentCourse, StudentStatus, StudyForm } from '../student.types';

/** Проект: группа полей, внутри которой ещё два массива — обязанности и результаты. */
export type ProjectFormGroup = FormGroup<{
  discipline: FormControl<string | null>;
  projectName: FormControl<string | null>;
  description: FormControl<string | null>;
  dateStart: FormControl<Date | null>;
  dateEnd: FormControl<Date | null>;
  role: FormControl<string | null>;
  technologies: FormControl<string | null>;
  teamInfo: FormControl<string | null>;
  responsibilities: FormArray<FormControl<string | null>>;
  achievements: FormArray<FormControl<string | null>>;
}>;

/** Язык: повторяемая группа из двух полей. */
export type LanguageFormGroup = FormGroup<{
  name: FormControl<string | null>;
  level: FormControl<string | null>;
}>;

export type StudentForm = FormGroup<{
  lastName: FormControl<string | null>;
  firstName: FormControl<string | null>;
  middleName: FormControl<string | null>;
  dateOfBirth: FormControl<Date | null>;
  group: FormControl<string | null>;
  directionId: FormControl<string | null>;
  additionalDirectionIds: FormControl<string[]>;
  status: FormControl<StudentStatus | null>;
  studyForm: FormControl<StudyForm | null>;
  course: FormControl<StudentCourse>;
  about: FormControl<string | null>;

  email: FormControl<string | null>;
  phone: FormControl<string | null>;
  telegram: FormControl<string | null>;

  programmingLanguages: FormControl<string | null>;
  frameworks: FormControl<string | null>;
  databases: FormControl<string | null>;
  tools: FormControl<string | null>;

  projects: FormArray<ProjectFormGroup>;
  languages: FormArray<LanguageFormGroup>;
  softSkills: FormArray<FormControl<string | null>>;
}>;

export type StudentFormSection =
  'main' | 'contacts' | 'skills' | 'projects' | 'languages' | 'softSkills';
