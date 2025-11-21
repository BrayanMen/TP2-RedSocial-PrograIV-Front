import { Component, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth-service';
import { PostsService } from '../../../core/services/posts-service';
import { Router } from '@angular/router';
import { IUser } from '../../../core/interfaces/user.interface';
import { IPost } from '../../../core/interfaces/post.interface';
import { ILikeResponse } from '../../../core/interfaces/post-response.interface';
import { CommonModule } from '@angular/common';
import { PostCard } from '../../../shared/components/post-card/post-card';

@Component({
  selector: 'app-profile',
  imports: [CommonModule,PostCard],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  user = signal<IUser | null>(null);
  latestPosts = signal<IPost[]>([]);
  isLoading = signal<boolean>(true);
  postsLoading = signal<boolean>(true);

  constructor(
    private authService: AuthService,
    private postsService: PostsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadLatestPosts();
  }

  loadUserProfile(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.user.set(currentUser);
      this.isLoading.set(false);
    }
  }

  loadLatestPosts(): void {
    const userId = this.user()?.id;
    if (!userId) return;

    this.postsLoading.set(true);
    this.postsService.getLastPost(userId).subscribe({
      next: (posts: IPost[]) => {
        this.latestPosts.set(posts);
        this.postsLoading.set(false);
      },
      error: (error: any) => {
        console.error('Error al cargar publicaciones:', error);
        this.postsLoading.set(false);
      },
    });
  }

  editProfile(): void {
    this.router.navigate(['/profile/edit']);
  }

  handleLike(postId: string): void {
    this.postsService.likePost(postId).subscribe({
      next: (response) => {
        const posts = this.latestPosts();
        const index = posts.findIndex((p) => p.id === postId);
        if (index !== -1) {
          const updated = [...posts];
          updated[index] = {
            ...updated[index],
            isLikedByMe: true,
            likesCount: response.likesCount,
          };
          this.latestPosts.set(updated);
        }
      },
      error: (error) => console.error('Error:', error),
    });
  }

  handleUnlike(postId: string): void {
    this.postsService.dislikePost(postId).subscribe({
      next: (response: ILikeResponse) => {
        const posts = this.latestPosts();
        const index = posts.findIndex((p) => p.id === postId);
        if (index !== -1) {
          const updated = [...posts];
          updated[index] = {
            ...updated[index],
            isLikedByMe: false,
            likesCount: response.likesCount,
          };
          this.latestPosts.set(updated);
        }
      },
      error: (error: any) => console.error('Error:', error),
    });
  }

  handleDelete(postId: string): void {
    this.postsService.deletePost(postId).subscribe({
      next: () => {
        this.latestPosts.update((posts) => posts.filter((p) => p.id !== postId));
        if (this.user()) {
          this.user.update((u) => (u ? { ...u, postsCount: u.postsCount - 1 } : null));
        }
      },
      error: (error) => console.error('Error:', error),
    });
  }


}
