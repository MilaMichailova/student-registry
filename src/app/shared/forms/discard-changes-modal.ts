import { Component, inject } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-discard-changes-modal',
  host: { class: 'app-dialog' },
  imports: [NzButtonModule, NzIconModule],
  template: `
    <div class="app-dialog-header">
      <span class="app-dialog-title">{{ title }}</span>
      <button
        type="button"
        class="app-dialog-close"
        aria-label="Закрыть подтверждение и остаться"
        (click)="close(false)"
      >
        <nz-icon nzType="close" />
      </button>
    </div>
    <div class="app-dialog-body">
      Несохранённые изменения будут потеряны. Продолжить без сохранения?
    </div>
    <div class="app-dialog-footer">
      <button type="button" nz-button nzSize="small" cdkFocusInitial (click)="close(false)">
        Остаться
      </button>
      <button type="button" nz-button nzType="primary" nzSize="small" (click)="close(true)">
        Не сохранять
      </button>
    </div>
  `,
})
export class DiscardChangesModal {
  private readonly modalRef = inject<NzModalRef<DiscardChangesModal, boolean>>(NzModalRef);
  readonly title = 'Несохранённые изменения';

  constructor() {
    this.modalRef.getElement().setAttribute('aria-label', this.title);
  }

  close(discard: boolean): void {
    this.modalRef.close(discard);
  }
}
