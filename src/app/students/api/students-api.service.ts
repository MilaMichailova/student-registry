import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../shared/api-url';
import { Page, Student, StudentListQuery, StudentRow, StudentSaveRequest } from '../student.models';

@Injectable({ providedIn: 'root' })
export class StudentsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_URL}/students`;

  getStudents(query: StudentListQuery): Observable<Page<StudentRow>> {
    let params = new HttpParams()
      .set('pageNumber', query.pageNumber)
      .set('pageSize', query.pageSize)
      .set('orderByColumn', query.orderByColumn)
      .set('orderByDirection', query.orderByDirection);

    if (query.search.trim()) {
      params = params.set('search', query.search.trim());
    }
    query.statuses.forEach((status) => (params = params.append('statuses', status)));
    query.studyForms.forEach((form) => (params = params.append('studyForms', form)));

    return this.http.get<Page<StudentRow>>(this.baseUrl, { params });
  }

  getStudent(studentId: string): Observable<Student> {
    return this.http.get<Student>(`${this.baseUrl}/${studentId}`);
  }

  createStudent(request: StudentSaveRequest): Observable<void> {
    return this.http.post<void>(this.baseUrl, request);
  }

  updateStudent(request: StudentSaveRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${request.studentId}`, request);
  }

  deleteStudent(studentId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${studentId}`);
  }
}
