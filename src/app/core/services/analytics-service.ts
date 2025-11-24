import { inject, Injectable } from '@angular/core';
import { ApiService } from './api-service';
import { IUser } from '../interfaces/user.interface';
import { map, Observable } from 'rxjs';
import { IChartData } from '../interfaces/chartsData.interface';
import { ICreateUserByAdmin } from '../interfaces/register-request.interface';
import { IUsersResponse } from '../interfaces/post-response.interface';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private apiService = inject(ApiService);
  private adminUserUrl = 'admin/users';
  // /api/v1/admin/users, GET
  // /api/v1/admin/users, POST
  // /api/v1/admin/users/:id, DELETE
  // /api/v1/admin/users/:id/active
  private adminStatsUrl = 'admin/analytics';
  // /api/v1/admin/analytics/posts-per-user
  // /api/v1/admin/analytics/comments-by-range
  // /api/v1/admin/analytics/comments-per-post

  private buildDateParams(startDate?: string, endDate?: string): HttpParams {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return params;
  }

  getPostUsers(startDate?: string, endDate?: string): Observable<IChartData[]> {
    const params = this.buildDateParams(startDate, endDate);
    return this.apiService.get<any[]>(`${this.adminStatsUrl}/posts-per-user`,params).pipe(
      map((p) => {
        // Validacion de datos
        const data = Array.isArray(p.data) ? p.data : [];
        // Mapeo de dato y coversion n formato para Stats
        return data.map((stat) => ({
          label: stat.username || `Usuario`,
          value: Number(stat.totalPosts) || 0,
        }));
      })
    );
  }

  getCommentsByRange(startDate?: string, endDate?: string): Observable<number> {
    const params = this.buildDateParams(startDate, endDate);
    return this.apiService
      .get<any>(`${this.adminStatsUrl}/comments-by-range`,params)
      .pipe(map((p) => Number(p.data?.totalComments) || 0));
  }

  getCommentsPerPost(startDate?: string, endDate?: string): Observable<IChartData[]> {
    const params = this.buildDateParams(startDate, endDate);
    return this.apiService.get<any[]>(`${this.adminStatsUrl}/comments-per-post`,params).pipe(
      map((p) => {
        const data = Array.isArray(p.data) ? p.data : [];
        return data.map((stat) => ({
          label: stat.postTitle || `Sin titulo`,
          value: Number(stat.totalComments) || 0,
        }));
      })
    );
  }

  createUser(userData: ICreateUserByAdmin): Observable<IUser> {
    return this.apiService.post<IUser>(this.adminUserUrl, userData).pipe(map((u) => u.data));
  }

  getAllUsers(page: number = 1, limit: number = 10): Observable<IUsersResponse> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    return this.apiService.get<IUsersResponse>(this.adminUserUrl, params).pipe(map((u) => u.data));
  }

  handlerUserStatus(userId: string, isActive: boolean) {
    if (!isActive) {
      console.log('Desactivando');
      return this.apiService.delete(`${this.adminUserUrl}/${userId}`);
    } else {
      console.log('Activando');

      return this.apiService.post(`${this.adminUserUrl}/${userId}/active`, {});
    }
  }
}
