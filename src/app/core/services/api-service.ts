import { Injectable } from '@angular/core';
import { IApiResponse } from '../interfaces/api-response-interface';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
    withCredentials: true,
  }

  constructor(private http: HttpClient) {}

  get<T>(endpoint: string, params?: HttpParams): Observable<IApiResponse<T>> {
    return this.http.get<IApiResponse<T>>(`${this.apiUrl}${endpoint}`, {
      ...this.httpOptions,
      params,
    });
  }
  
  post<T>(endpoint: string, body: any): Observable<IApiResponse<T>> {
    let options = { ...this.httpOptions };
    if (body instanceof FormData) {
      options.headers = options.headers.delete('Content-Type');
    }

    return this.http.post<IApiResponse<T>>(
      `${this.apiUrl}${endpoint}`,
      body,
      options
    );
  }

  put<T>(endpoint: string, body: any): Observable<IApiResponse<T>> {
    let options = { ...this.httpOptions };
    if (body instanceof FormData) {
      options.headers = options.headers.delete('Content-Type');
    }

    return this.http.put<IApiResponse<T>>(
      `${this.apiUrl}${endpoint}`,
      body,
      options
    );
  }

  delete<T>(endpoint: string): Observable<IApiResponse<T>> {
    return this.http.delete<IApiResponse<T>>(
      `${this.apiUrl}${endpoint}`,
      this.httpOptions
    );
  }
}
