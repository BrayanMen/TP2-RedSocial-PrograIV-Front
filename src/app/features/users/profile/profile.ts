import { Component, OnInit, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth-service';
import { PostsService } from '../../../core/services/posts-service';
import { Router } from '@angular/router';
import { IUser } from '../../../core/interfaces/user.interface';
import { IPost } from '../../../core/interfaces/post.interface';
import { ILikeResponse } from '../../../core/interfaces/post-response.interface';
import { CommonModule } from '@angular/common';
import { PostCard } from '../../../shared/components/post-card/post-card';
import { LoadingService } from '../../../core/services/loading-service';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, PostCard],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  user = signal<IUser | null>(null);
  latestPosts = signal<IPost[]>([]);
  isLoading = signal<boolean>(true);
  postsLoading = signal<boolean>(true);

  constructor(
    private authService: AuthService,
    private postsService: PostsService,
    private loadingService: LoadingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.user.set(currentUser);
      this.isLoading.set(false);
      this.loadLatestPosts(currentUser.id);
    } else {
      this.isLoading.set(false);
    }
  }

  loadLatestPosts(userId: string): void {
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

  onFileSelected(e: Event) {
    const input = e.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const currentUser = this.user();
      if (currentUser) {
        this.authService.updateProfile(currentUser, file).subscribe({
          next: (updated) => {
            this.user.set(updated);
          },
          error: (err) => console.error('Error al subir la imagen: ', err),
        });
      }
    }
    input.value = '';
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
