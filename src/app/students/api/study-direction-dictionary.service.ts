import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, shareReplay, throwError } from 'rxjs';
import { DictionaryItem } from '../student.models';
import { API_URL } from '../../shared/api-url';

interface StudyDirectionDictionaryResponse {
  items: DictionaryItem[];
}

/**
 * Сервис словаря направлений подготовки.
 * Словарь загружается один раз и переиспользуется всеми формами; неудачная загрузка не кэшируется.
 */
@Injectable({ providedIn: 'root' })
export class StudyDirectionDictionaryService {
  private readonly http = inject(HttpClient);
  private readonly dictionaryUrl = `${API_URL}/study-directions`;
  private cachedDictionary$: Observable<DictionaryItem[]> | null = null;

  /**
   * Получить элементы словаря направлений.
   */
  getDictionary(): Observable<DictionaryItem[]> {
    if (!this.cachedDictionary$) {
      const dictionary$ = this.http.get<StudyDirectionDictionaryResponse>(this.dictionaryUrl).pipe(
        map((response) => response.items ?? []),
        catchError((error: unknown) => {
          if (this.cachedDictionary$ === dictionary$) {
            this.cachedDictionary$ = null;
          }
          return throwError(() => error);
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
      this.cachedDictionary$ = dictionary$;
    }

    return this.cachedDictionary$;
  }

  /**
   * Сбросить кэш и повторно загрузить словарь направлений.
   */
  reloadDictionary(): Observable<DictionaryItem[]> {
    this.cachedDictionary$ = null;
    return this.getDictionary();
  }
}
