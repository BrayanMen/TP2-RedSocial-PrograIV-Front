import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ProfileOptions } from '../interfaces/profileOptions.interface';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private readonly apiUrl = `${environment.apiUrl}data`;

  private optionsSubject = new BehaviorSubject<ProfileOptions | null>(null);
  public options$ = this.optionsSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadProfileOptions(): Observable<ProfileOptions | null> {
    if (this.optionsSubject.value) {
      return this.options$;
    }

    return this.http.get<ProfileOptions>(`${this.apiUrl}/profile-options`).pipe(
      tap((options) => {
        this.optionsSubject.next(options);
      })
    );
  }
}
