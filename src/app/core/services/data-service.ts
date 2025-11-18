import { Injectable } from '@angular/core';
import { ProfileOptions } from '../interfaces/profileOptions.interface';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

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

// @Injectable({
//   providedIn: 'root',
// })
// export class DataService {
//   private apiUrl = environment.apiUrl;

//   constructor(private http: HttpClient) {}

//   getProfileOptions(): Observable<ProfileOptions> {
//     return this.http.get<ProfileOptions>(`${this.apiUrl}/profile-options`);
//   }
// }