import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TextFieldModule } from '@angular/cdk/text-field';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule, NzSelectOptionInterface } from 'ng-zorro-antd/select';
import {
  STUDENT_COURSE_OPTIONS,
  STUDENT_STATUS_OPTIONS,
  STUDY_FORM_OPTIONS,
} from '../../student.types';
import { StudentForm } from '../student-forms.types';
import { StudyDirectionDictionaryService } from '../../api/study-direction-dictionary.service';
import { isFutureDate } from '../../../shared/utils/date.validators';

type DictionaryState = 'loading' | 'loaded' | 'error';

@Component({
  selector: 'app-student-main-info-section',
  imports: [
    ReactiveFormsModule,
    TextFieldModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzCollapseModule,
    NzDatePickerModule,
    NzButtonModule,
  ],
  templateUrl: './student-main-info-section.html',
  styleUrl: './student-main-info-section.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class StudentMainInfoSection implements OnInit {
  private readonly directionDictionaryService = inject(StudyDirectionDictionaryService);
  private readonly destroyRef = inject(DestroyRef);

  readonly formGroup = input.required<StudentForm>();
  /** Раскрыта ли секция; двусторонняя привязка [(active)]. */
  readonly active = model(false);

  readonly courseOptions = STUDENT_COURSE_OPTIONS;
  readonly statusOptions = STUDENT_STATUS_OPTIONS;
  readonly studyFormOptions = STUDY_FORM_OPTIONS;
  readonly isFutureDate = isFutureDate;

  readonly directionOptions = signal<NzSelectOptionInterface[]>([]);
  readonly dictionaryState = signal<DictionaryState>('loading');
  readonly primarySelectOpen = signal(false);
  readonly additionalSelectOpen = signal(false);

  ngOnInit(): void {
    this.loadDirectionDictionary();
    this.keepAdditionalDirectionsExclusive();
  }

  /**
   * Повторить загрузку словаря направлений после ошибки.
   */
  retryDictionaryLoad(): void {
    this.loadDirectionDictionary(true);
  }

  /** Одновременно открыт только один из двух селектов направлений. */
  onPrimarySelectOpenChange(open: boolean): void {
    this.primarySelectOpen.set(open);
    if (open) this.additionalSelectOpen.set(false);
  }

  onAdditionalSelectOpenChange(open: boolean): void {
    this.additionalSelectOpen.set(open);
    if (open) this.primarySelectOpen.set(false);
  }

  private loadDirectionDictionary(forceReload = false): void {
    this.dictionaryState.set('loading');
    const dictionary$ = forceReload
      ? this.directionDictionaryService.reloadDictionary()
      : this.directionDictionaryService.getDictionary();

    dictionary$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (items) => {
        this.directionOptions.set(items.map((item) => ({ label: item.name, value: item.id })));
        this.dictionaryState.set('loaded');
      },
      error: () => this.dictionaryState.set('error'),
    });
  }

  /**
   * Основное направление не может одновременно быть дополнительным:
   * при выборе основного оно убирается из дополнительных, и наоборот.
   */
  private keepAdditionalDirectionsExclusive(): void {
    const primary = this.formGroup().controls.directionId;
    const additional = this.formGroup().controls.additionalDirectionIds;

    primary.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((primaryId) => {
      if (primaryId && additional.value.includes(primaryId)) {
        additional.setValue(
          additional.value.filter((id) => id !== primaryId),
          { emitEvent: false },
        );
      }
    });

    additional.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      if (value == null) {
        additional.setValue([], { emitEvent: false });
        return;
      }

      const primaryId = primary.value;
      if (primaryId && value.includes(primaryId)) {
        additional.setValue(
          value.filter((id) => id !== primaryId),
          { emitEvent: false },
        );
      }
    });
  }
}
