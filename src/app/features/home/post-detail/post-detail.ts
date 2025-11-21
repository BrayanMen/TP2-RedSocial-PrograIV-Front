import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommentList } from '../../../shared/components/comments/comment-list/comment-list';
import { CommentForm } from '../../../shared/components/comments/comment-form/comment-form';
import { PostsService } from '../../../core/services/posts-service';
import { CommentsService } from '../../../core/services/comments-service';
import { AuthService } from '../../../core/services/auth-service';
import { ModalService } from '../../../core/services/modal-service';
import { LoadingService } from '../../../core/services/loading-service';
import { IPost } from '../../../core/interfaces/post.interface';
import { IComment } from '../../../core/interfaces/comment.interface';
import { ILikeResponse } from '../../../core/interfaces/post-response.interface';
import { CutLongTextPipe } from '../../../shared/pipes/cut-long-text.pipe';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';

@Component({
  selector: 'app-post-detail',
  imports: [CommonModule, RouterLink, CommentList, CommentForm],
  templateUrl: './post-detail.html',
  styleUrl: './post-detail.css',
})
export class PostDetail implements OnInit {
  private postService = inject(PostsService);
  private commentService = inject(CommentsService);
  authService = inject(AuthService);
  private modalService = inject(ModalService);
  private loadingService = inject(LoadingService);
  private router = inject(Router);

  @Input() id!: string;

  post = signal<IPost | null>(null);
  comments = signal<IComment[]>([]);

  isLoad = signal<boolean>(false);
  isSubmittingComment = signal<boolean>(false);
  isAdmin = signal<boolean>(false);

  currentUserId = signal<string | undefined>(undefined);

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.currentUserId.set(user.id);
      this.isAdmin.set(this.authService.isAdmin());
    }
    if (this.id) {
      this.loadData();
    }
  }

  canDelete(): boolean {
    return this.isAdmin() || this.post()?.author?.id === this.currentUserId();
  }

  loadData() {
    this.loadingService.show();

    this.postService.getPostById(this.id).subscribe({
      next: (post) => {
        this.post.set(post);
        console.log(this.post);

        this.loadComments();
      },
      error: (err) => {
        console.error(err);
        this.loadingService.hide();
        this.router.navigate(['/feed']); // Redirigir si no existe
      },
    });
  }

  loadComments() {
    this.commentService.getComments(1, 100, this.id).subscribe({
      next: (resp) => {
        this.comments.set(resp.data);
        this.loadingService.hide();
      },
      error: () => {
        this.isLoad.set(false);
        this.loadingService.hide();
      },
    });
  }

  addComment(content: string) {
    this.isSubmittingComment.set(true);
    this.commentService.createComment({ content }, this.id).subscribe({
      next: (newComment) => {
        // Agregamos al inicio de la lista
        this.comments.update((prev) => [newComment, ...prev]);
        this.post.update((p) => (p ? { ...p, commentsCount: p.commentsCount + 1 } : null));
        this.isSubmittingComment.set(false);
      },
      error: (err) => {
        this.modalService.errorModal('Error alhacer comentario');
        console.error(err);
        this.isSubmittingComment.set(false);
      },
    });
  }

  handleDeleteComment(commentId: string) {
    this.modalService.confirmModal(
      'Eliminar comentario',
      '¿Estás seguro de eliminar este comentario?',
      () => {
        this.commentService.deleteComment(this.id, commentId).subscribe({
          next: () => {
            this.comments.update((prev) => prev.filter((c) => c.id !== commentId));
            this.post.update((p) => (p ? { ...p, commentsCount: p.commentsCount - 1 } : null));
            this.modalService.successModal('Comentario eliminado');
          },
          error: () => this.modalService.errorModal('No se pudo eliminar'),
        });
      },
      () => {}
    );
  }

  handleUpdateComment(event: { id: string; content: string }) {
    this.commentService.updatedComment(this.id, event.id, { content: event.content }).subscribe({
      next: (updated) => {
        this.comments.update((prev) => prev.map((c) => (c.id === event.id ? updated : c)));
        this.modalService.successModal('Comentario editado');
      },
      error: () => this.modalService.errorModal('Error al editar'),
    });
  }

  onPostDelete() {
    this.modalService.confirmModal(
      'Eliminar publicación',
      '¿Estás seguro de que quieres eliminar esta publicación?',
      () => {
        this.loadingService.show();
        this.postService.deletePost(this.id).subscribe({
          next: () => {
            this.loadingService.hide();
            this.modalService.successModal('Publicación eliminada');
            this.router.navigate(['/feed']);
          },
          error: (err) => {
            console.error(err);
            this.loadingService.hide();
            this.modalService.errorModal('No se pudo eliminar la publicación');
          }
        });
      },
      () => {}
    );
  }

  handlesLikesChange() {
    const post = this.post();
    if (!post) return;

    const prevState = { ...post };
    const isLiked = post.isLikedByMe;

    this.post.update((p) =>
      p
        ? {
            ...p,
            isLikedByMe: !isLiked,
            likesCount: p.likesCount + (isLiked ? -1 : 1),
          }
        : null
    );

    const req = isLiked
      ? this.postService.dislikePost(post.id)
      : this.postService.likePost(post.id);

    req.subscribe({
      error: (err) => {
        this.modalService.errorModal('Error al dar me gusta');
        console.error('Error: ', err);
      },
    });
  }

  getTimeAgo(): string {
    const now = new Date();
    const postDate = new Date(this.post()?.createdAt || now);
    const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Ahora';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;

    return postDate.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
    });
  }
}
