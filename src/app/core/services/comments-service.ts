import { Injectable } from '@angular/core';
import { ApiService } from './api-service';
import { map, Observable } from 'rxjs';
import {
  IComment,
  ICommentsResponse,
  ICreateCommentRequest,
  IUpdateCommentRequest,
} from '../interfaces/comment.interface';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CommentsService {
  private readonly postsUrl = 'posts/';

  constructor(private apiService: ApiService) {}

  getComments(page: number = 1, limit: number = 5, postId: string): Observable<ICommentsResponse> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    return this.apiService
      .get<ICommentsResponse>(`${this.postsUrl}${postId}/comments`, params)
      .pipe(map((c) => c.data));
  }

  createComment(comment: ICreateCommentRequest, postId: string): Observable<IComment> {
    return this.apiService
      .post<IComment>(`${this.postsUrl}${postId}/comments`, comment)
      .pipe(map((c) => c.data));
  }

  deleteComment(postId: string, commentId: string): Observable<{ message: string }> {
    return this.apiService
      .delete<{ message: string }>(`${this.postsUrl}${postId}/comments/${commentId}`)
      .pipe(map((r) => r.data));
  }

  updatedComment(
    postId: string,
    commentId: string,
    contentUpdated: IUpdateCommentRequest
  ): Observable<IComment> {
    return this.apiService
      .put<IComment>(`${this.postsUrl}${postId}/comments/${commentId}`,contentUpdated)
      .pipe(map((r) => r.data));
  }
}
