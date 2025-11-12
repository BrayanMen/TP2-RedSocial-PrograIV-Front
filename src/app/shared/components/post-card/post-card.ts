import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IPost } from '../../../core/interfaces/post.interface';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-post-card',
  imports: [CommonModule, RouterLink],
  templateUrl: './post-card.html',
  styleUrl: './post-card.css',
})
export class PostCard {
  @Input({ required: true }) post!: IPost;
  @Input() currentUserId?: string;
  @Input() isAdmin: boolean = false;

  @Output() like = new EventEmitter<string>();
  @Output() unlike = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();
  @Output() viewComments = new EventEmitter<string>();

  canDelete(): boolean {
    return this.isAdmin || this.post.author.id === this.currentUserId;
  }

  onLike(): void {
    if (this.post.isLikedByMe) {
      this.unlike.emit(this.post.id);
    } else {
      this.like.emit(this.post.id);
    }
  }

  onDelete(): void {
    if (confirm('¿Estás seguro de que quieres eliminar esta publicación?')) {
      this.delete.emit(this.post.id);
    }
  }

  onViewComments(): void {
    this.viewComments.emit(this.post.id);
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const postDate = new Date(date);
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
