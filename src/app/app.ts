import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, NzIconModule],
  template: `
    <header class="app-header">
      <a class="app-header__brand" routerLink="/students">
        <nz-icon nzType="team" />
        Реестр студентов
      </a>
      <span class="app-header__note">Демо: данные вымышленные и хранятся в браузере</span>
    </header>
    <main class="app-main">
      <router-outlet />
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
