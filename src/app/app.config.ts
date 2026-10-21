import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeRu from '@angular/common/locales/ru';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideNzConfig } from 'ng-zorro-antd/core/config';
import { provideNzNativeDateAdapter } from 'ng-zorro-antd/core/time';
import { provideNzI18n, ru_RU } from 'ng-zorro-antd/i18n';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { NzModalService } from 'ng-zorro-antd/modal';
import {
  CalendarOutline,
  CloseOutline,
  CopyOutline,
  DeleteOutline,
  DragOutline,
  EditOutline,
  PlusOutline,
  ReloadOutline,
  SaveOutline,
  SearchOutline,
  TeamOutline,
} from '@ant-design/icons-angular/icons';
import { routes } from './app.routes';
import { mockBackendInterceptor } from './mock-backend/mock-backend.interceptor';
import { APP_THEME } from './theme';

registerLocaleData(localeRu);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([mockBackendInterceptor])),
    // Тема через CSS-переменные: angular.json подключает ng-zorro-antd.variable.min.css.
    provideNzConfig({ theme: APP_THEME }),
    provideNzI18n(ru_RU),
    provideNzNativeDateAdapter({ locale: 'ru-RU', firstDayOfWeek: 1 }),
    provideNzIcons([
      CalendarOutline,
      CloseOutline,
      CopyOutline,
      DeleteOutline,
      DragOutline,
      EditOutline,
      PlusOutline,
      ReloadOutline,
      SaveOutline,
      SearchOutline,
      TeamOutline,
    ]),
    // Модалки нужны и списку (удаление), и guard'у несохранённых изменений.
    NzModalService,
    { provide: LOCALE_ID, useValue: 'ru' },
  ],
};
