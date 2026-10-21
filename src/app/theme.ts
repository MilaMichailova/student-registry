import { Theme } from 'ng-zorro-antd/core/config';

/**
 * Цвета бренда — единственный источник для темы.
 * NG-ZORRO выводит из них оттенки hover/active и пишет в CSS-переменные --ant-*,
 * а токены приложения (src/styles/_tokens.scss) ссылаются на эти переменные.
 */
export const APP_THEME: Theme = {
  primaryColor: '#25a1f4',
  infoColor: '#25a1f4',
  successColor: '#2e9e62',
  warningColor: '#e59a2b',
  errorColor: '#d9434b',
};
