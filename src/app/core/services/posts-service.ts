import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { ApiService } from './api-service';
import { ICreatePostRequest, IPostsResponse, SortBy } from '../interfaces/post-response.interface';
import { map, Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { IPost } from '../interfaces/post.interface';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  private readonly postsUrl = 'posts/';

  constructor(private apiService: ApiService, @Inject(PLATFORM_ID) private platformId: Object) {}

  getPost(
    page: number = 1,
    limit: number = 10,
    sortBy: SortBy = SortBy.DATE,
    userId?: string
  ): Observable<IPostsResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('sortBy', sortBy);

    if (userId) {
      params = params.set('userId', userId);
    }

    return this.apiService.get<IPostsResponse>(this.postsUrl, params).pipe(map((r) => r.data));
  }

  createPost(post: ICreatePostRequest, image?: File | null): Observable<IPost> {
    const formData = new FormData();
    formData.append('title', post.title);
    formData.append('content', post.content);

    if (post.type) formData.append('type', post.type);
    if (image) formData.append('image', image, image.name);

    return this.apiService.post<IPost>(this.postsUrl, formData).pipe(map((p) => p.data));
  }

  deletePost(id: string): Observable<{ message: string }> {
    return this.apiService
      .delete<{ message: string }>(`${this.postsUrl}${id}`)
      .pipe(map((r) => r.data));
  }

  likePost(id: string): Observable<{ message: string; likesCount: number }> {
    return this.apiService
      .post<{ message: string; likesCount: number }>(`${this.postsUrl}${id}/likes`, {})
      .pipe(map((r) => r.data));
  }

  dislikePost(id: string): Observable<{ message: string; likesCount: number }> {
    return this.apiService
      .delete<{ message: string; likesCount: number }>(`${this.postsUrl}${id}/likes`)
      .pipe(map((r) => r.data));
  }

  getLastPost(id: string): Observable<IPost[]> {
    return this.getPost(1, 3, SortBy.DATE, id).pipe(map((r) => r.data));
  }
}
