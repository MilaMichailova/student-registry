import { DestroyRef, inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Observable } from 'rxjs';
import { DiscardChangesModal } from './discard-changes-modal';

export interface PendingChanges {
  hasUnsavedChanges(): boolean;
}

export interface FormChanges {
  hasChanges(): boolean;
  markSaved(value?: unknown): void;
}

/** Сравнивает текущее значение формы с сохранённым снимком. */
export function trackFormChanges(readValue: () => unknown): FormChanges {
  let baseline = JSON.stringify(readValue());

  return {
    hasChanges: () => baseline !== JSON.stringify(readValue()),
    markSaved: (value = readValue()) => {
      baseline = JSON.stringify(value);
    },
  };
}

/** Только явное «Не сохранять» разрешает переход; закрытие окна оставляет форму без изменений. */
export function confirmDiscardChanges(modal: NzModalService): Observable<boolean> {
  return new Observable<boolean>((subscriber) => {
    const modalRef = modal.create<DiscardChangesModal, undefined, boolean>({
      nzContent: DiscardChangesModal,
      nzFooter: null,
      nzClosable: false,
      nzCentered: true,
      nzWidth: 416,
      nzMaskClosable: false,
    });
    const closed = modalRef.afterClose.subscribe((discard) => {
      subscriber.next(discard === true);
      subscriber.complete();
    });
    return () => {
      closed.unsubscribe();
      modalRef.destroy();
    };
  });
}

/** Guard маршрута: спрашивает подтверждение, если в форме есть несохранённые изменения. */
export const pendingChangesGuard: CanDeactivateFn<PendingChanges> = (component) =>
  component.hasUnsavedChanges() ? confirmDiscardChanges(inject(NzModalService)) : true;

/** Предупреждение браузера при закрытии вкладки или перезагрузке с несохранёнными изменениями. */
export function protectUnsavedChanges(hasChanges: () => boolean): void {
  const destroyRef = inject(DestroyRef);

  if (typeof window === 'undefined') {
    return;
  }

  const onBeforeUnload = (event: BeforeUnloadEvent): void => {
    if (!hasChanges()) {
      return;
    }

    event.preventDefault();
    event.returnValue = '';
  };

  window.addEventListener('beforeunload', onBeforeUnload);
  destroyRef.onDestroy(() => window.removeEventListener('beforeunload', onBeforeUnload));
}
