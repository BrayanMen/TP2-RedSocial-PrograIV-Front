import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, OnInit, Output, signal } from '@angular/core';
import { IPost } from '../../../core/interfaces/post.interface';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';
import { CutLongTextPipe } from '../../pipes/cut-long-text.pipe';
import { IComment } from '../../../core/interfaces/comment.interface';
import { CommentsService } from '../../../core/services/comments-service';
import { ModalService } from '../../../core/services/modal-service';
import { FormsModule } from '@angular/forms';
import { CommentList } from '../comments/comment-list/comment-list';
import { CommentForm } from '../comments/comment-form/comment-form';

@Component({
  selector: 'app-post-card',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    TimeAgoPipe,
    CutLongTextPipe,
    CommentList,
    CommentForm,
    NgOptimizedImage,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './post-card.html',
  styleUrl: './post-card.css',
})
export class PostCard implements OnInit {
  private router = inject(Router);
  private commentsService = inject(CommentsService);
  private modalService = inject(ModalService);

  @Input({ required: true }) post!: IPost;
  @Input() currentUserId?: string;
  @Input() isAdmin: boolean = false;

  @Output() like = new EventEmitter<string>();
  @Output() unlike = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();

  comments = signal<IComment[]>([]);
  commentContent = signal<string>('');
  isSubmitting = signal<boolean>(false);
  showComments = signal<boolean>(false);

  ngOnInit(): void {
    this.loadComments();
  }

  onCommentSubmit(content: string) {
    this.commentContent.set(content);
    this.addComment();
  }

  onViewComments(e: Event) {
    if (e) e.stopPropagation();
    this.showComments.update((v) => !v);

    // Carga perezosa: Solo cargamos si se abren y no hay datos aun
    if (this.showComments() && this.comments().length === 0) {
      this.loadComments();
    }
  }

  loadComments() {
    this.commentsService.getComments(1, 3, this.post.id).subscribe({
      next: (c) => {
        this.comments.set(c.data);
      },
      error: (err) => {
        console.error('Error cargando comentarios:', err);
      },
    });
  }

  addComment() {
    if (!this.commentContent().trim()) return;
    this.isSubmitting.set(true);

    this.commentsService.createComment({ content: this.commentContent() }, this.post.id).subscribe({
      next: (newComment) => {
        this.comments.update((prevComments) => [newComment, ...prevComments].slice(0, 3));
        this.post.commentsCount++;
        this.commentContent.set('');
        this.isSubmitting.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isSubmitting.set(false);
      },
    });
  }

  navigateToDetails() {
    this.router.navigate(['/posts', this.post.id]);
  }

  canDelete(): boolean {
    return this.isAdmin || this.post.author.id === this.currentUserId;
  }

  onLike(e: Event): void {
    e.stopPropagation();
    if (this.post.isLikedByMe) this.unlike.emit(this.post.id);
    else this.like.emit(this.post.id);
  }

  onDelete(e: Event): void {
    e.stopPropagation();
    this.modalService.confirmModal(
      'Eliminar Publicación',
      '¿Estás seguro de que quieres eliminar esta publicación?',
      () => {
        this.delete.emit(this.post.id);
        this.modalService.infoModal('Publicacion eliminada');
      },
      () => {
        this.modalService.closeModal();
      }
    );
  }

  onDeleteComment(commentId: string) {
    this.modalService.confirmModal(
      'Eliminar Comentario',
      '¿Seguro deseas eliminar el comentario?',
      () => {
        this.commentsService.deleteComment(this.post.id, commentId).subscribe({
          next: () => {
            this.comments.update((prevComment) => prevComment.filter((c) => c.id !== commentId));
            this.post.commentsCount--;
        this.modalService.successModal('Comentario eliminado');

          },
          error: () => this.modalService.errorModal('No se pudo eliminar'),
        });
      },
      () => {}
    );
  }
  
  handleUpdateComment(event: { id: string, content: string }) {
    this.commentsService.updatedComment(this.post.id, event.id, { content: event.content }).subscribe({
      next: (updatedComment) => {        
        this.comments.update(prev => prev.map(c => c.id === event.id ? updatedComment : c));
        this.modalService.successModal('Comentario editado');

      },
      error: (err) => console.error(err)
    });
  }
}
