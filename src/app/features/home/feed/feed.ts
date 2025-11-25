import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import {
  ILikeResponse,
  IPostsResponse,
  ICreatePostRequest,
  SortBy,
} from '../../../core/interfaces/post-response.interface';
import { IPost, PostType } from '../../../core/interfaces/post.interface';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { PostCard } from '../../../shared/components/post-card/post-card';
import { PostsService } from '../../../core/services/posts-service';
import { AuthService } from '../../../core/services/auth-service';
import { LoadingService } from '../../../core/services/loading-service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommentsService } from '../../../core/services/comments-service';
import { IComment } from '../../../core/interfaces/comment.interface';

@Component({
  selector: 'app-feed',
  imports: [CommonModule, PostCard, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './feed.html',
  styleUrl: './feed.css',
})
export class Feed implements OnInit {
  private postsService = inject(PostsService);
  private authService = inject(AuthService);
  private loadingService = inject(LoadingService);

  posts = signal<IPost[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);
  sortBy = signal<SortBy>(SortBy.DATE);
  readonly SortBy = SortBy;

  currentUserId = signal<string | undefined>(undefined);
  isAdmin = signal<boolean>(false);

  showCreateModal = signal<boolean>(false);
  newPostTitle = signal<string>('');
  newPostContent = signal<string>('');
  newPostType = signal<PostType>(PostType.GENERAL);
  readonly PostType = PostType;
  selectedImage = signal<File | null>(null);
  imagePreview = signal<string | null>(null);
  isCreating = signal<boolean>(false);

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.currentUserId.set(user.id);
      this.isAdmin.set(this.authService.isAdmin());
    }
    this.loadPosts();
  }

  onSortChange(): void {
    this.currentPage.set(1);
    this.loadPosts();
  }

  loadPosts(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.postsService.getPost(this.currentPage(), 10, this.sortBy()).subscribe({
      next: (response: IPostsResponse) => {
        this.posts.set(response.data);
        this.totalPages.set(response.meta.totalPages);
        this.isLoading.set(false);
      },
      error: (error: any) => {
        this.errorMessage.set(error.message || 'Error al cargar publicaciones');
        this.isLoading.set(false);
      },
    });
  }

  openCreateModal(): void {
    this.showCreateModal.set(true);
    this.resetForm();
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
    this.resetForm();
  }

  resetForm(): void {
    this.newPostTitle.set('');
    this.newPostContent.set('');
    this.newPostType.set(PostType.GENERAL);
    this.selectedImage.set(null);
    this.imagePreview.set(null);
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.errorMessage.set('Solo se permiten archivos de imagen');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage.set('La imagen no debe superar los 5MB');
        return;
      }

      this.selectedImage.set(file);

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedImage.set(null);
    this.imagePreview.set(null);
  }

  createPost(): void {
    if (!this.newPostContent().trim()) {
      this.errorMessage.set('El contenido de la publicación es requerido');
      return;
    }

    this.isCreating.set(true);
    this.errorMessage.set(null);

    const postData: ICreatePostRequest = {
      title: this.newPostTitle().trim() || 'Publicacion',
      content: this.newPostContent().trim(),
      type: this.newPostType(),
    };

    const imageFile: File | null = this.selectedImage();

    this.postsService.createPost(postData, imageFile).subscribe({
      next: (newPost: IPost) => {
        this.posts.update((posts) => [newPost, ...posts]);

        this.closeCreateModal();
        this.isCreating.set(false);

        // Mostrar mensaje de éxito
        this.errorMessage.set('¡Publicación creada exitosamente!');
        setTimeout(() => this.errorMessage.set(null), 3000);
      },
      error: (error: any) => {
        this.errorMessage.set(error.message || 'Error al crear la publicación');
        this.isCreating.set(false);
      },
    });
  }

  changeSortBy(newSort: SortBy): void {
    if (this.sortBy() !== newSort) {
      this.sortBy.set(newSort);
      this.currentPage.set(1);
      this.loadPosts();
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((page) => page + 1);
      this.loadPosts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((page) => page - 1);
      this.loadPosts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  handleLike(postId: string): void {
    this.postsService.likePost(postId).subscribe({
      next: (response: ILikeResponse) => {
        const postIndex = this.posts().findIndex((p) => p.id === postId);
        if (postIndex !== -1) {
          const updatedPosts = [...this.posts()];
          updatedPosts[postIndex] = {
            ...updatedPosts[postIndex],
            isLikedByMe: true,
            likesCount: response.likesCount,
          };
          this.posts.set(updatedPosts);
        }
      },
      error: (error: any) => {
        console.error('Error al dar like:', error);
      },
    });
  }

  handleUnlike(postId: string): void {
    this.postsService.dislikePost(postId).subscribe({
      next: (response: ILikeResponse) => {
        const postIndex = this.posts().findIndex((p) => p.id === postId);
        if (postIndex !== -1) {
          const updatedPosts = [...this.posts()];
          updatedPosts[postIndex] = {
            ...updatedPosts[postIndex],
            isLikedByMe: false,
            likesCount: response.likesCount,
          };
          this.posts.set(updatedPosts);
        }
      },
      error: (error: any) => {
        console.error('Error al quitar like:', error);
      },
    });
  }

  handleDelete(postId: string): void {
    this.loadingService.show();
    this.postsService.deletePost(postId).subscribe({
      next: () => {
        this.posts.update((posts) => posts.filter((p) => p.id !== postId));
        this.loadingService.hide();
      },
      error: (error: any) => {
        console.error('Error al eliminar publicación:', error);
        this.loadingService.hide();
      },
    });
  }
}
