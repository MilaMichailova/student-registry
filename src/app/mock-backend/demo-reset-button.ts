import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalService } from 'ng-zorro-antd/modal';
import { resetMockDatabase } from './mock-backend.interceptor';

/**
 * Кнопка демо-режима: возвращает исходный набор данных.
 * Живёт рядом с имитацией API, чтобы фичи приложения о подмене бэкенда не знали.
 */
@Component({
  selector: 'app-demo-reset-button',
  imports: [NzButtonModule, NzIconModule],
  template: `
    <button nz-button nzType="text" nzSize="small" type="button" (click)="confirmReset()">
      <nz-icon nzType="reload" />
      Сбросить демо
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoResetButton {
  private readonly modal = inject(NzModalService);
  private readonly document = inject(DOCUMENT);

  confirmReset(): void {
    this.modal.confirm({
      nzTitle: 'Сбросить демо-данные?',
      nzContent: 'Добавленные и изменённые записи пропадут, вернётся исходный набор студентов.',
      nzOkText: 'Сбросить',
      nzCancelText: 'Отмена',
      nzOnOk: () => {
        resetMockDatabase();
        // Перезагрузка — самый надёжный способ сбросить и данные, и состояние открытых экранов.
        this.document.location.reload();
      },
    });
  }
}
