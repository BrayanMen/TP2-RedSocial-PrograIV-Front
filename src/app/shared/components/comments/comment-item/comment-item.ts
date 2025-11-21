import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IComment } from '../../../../core/interfaces/comment.interface';
import { TimeAgoPipe } from '../../../pipes/time-ago.pipe';
import { CommentForm } from '../comment-form/comment-form';
@Component({
  selector: 'app-comment-item',
  standalone: true,
  imports: [CommonModule, TimeAgoPipe, CommentForm],
  templateUrl: './comment-item.html',
})
export class CommentItem {
  @Input({ required: true }) comment!: IComment;
  @Input() currentUserId?: string;
  @Input() isAdmin: boolean = false;

  @Output() delete = new EventEmitter<string>();
  @Output() update = new EventEmitter<{ id: string; content: string }>();

  isEdit = signal<boolean>(false);

  get isMyComment(): boolean {
    return this.currentUserId === this.comment.author.id;
  }
  get canDelete(): boolean {
    return this.isMyComment || this.isAdmin;
  }

  showEditComment() {
    this.isEdit.update((v) => !v);
  }

  handleEditComment(newComment: string) {
    this.update.emit({ id: this.comment.id, content: newComment });
    this.isEdit.set(false);
  }

  handleDelete() {
    this.delete.emit(this.comment.id);
  }
}
