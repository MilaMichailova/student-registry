import { Routes } from '@angular/router';
import { pendingChangesGuard } from './shared/forms/pending-changes';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'students' },
  {
    path: 'students',
    title: 'Студенты',
    loadComponent: () => import('./students/student-list/student-list').then((m) => m.StudentList),
  },
  {
    path: 'students/new',
    title: 'Новый студент',
    loadComponent: () =>
      import('./students/student-create/student-create').then((m) => m.StudentCreate),
    canDeactivate: [pendingChangesGuard],
  },
  {
    path: 'students/:studentId',
    title: 'Редактирование студента',
    loadComponent: () => import('./students/student-edit/student-edit').then((m) => m.StudentEdit),
    canDeactivate: [pendingChangesGuard],
  },
  { path: '**', redirectTo: 'students' },
];
