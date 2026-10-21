import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { DemoResetButton } from './mock-backend/demo-reset-button';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, NzIconModule, DemoResetButton],
  template: `
    <header class="app-header">
      <a class="app-header__brand" routerLink="/students">
        <nz-icon nzType="team" />
        Реестр студентов
      </a>
      <div class="app-header__demo">
        <span class="app-header__note">Демо: данные вымышленные и хранятся в браузере</span>
        <app-demo-reset-button />
      </div>
    </header>
    <main class="app-main">
      <router-outlet />
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
