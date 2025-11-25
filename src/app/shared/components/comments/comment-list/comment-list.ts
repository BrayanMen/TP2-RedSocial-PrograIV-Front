import {
  Component,
  Input,
  ViewChildren,
  QueryList,
  ElementRef,
  OnChanges,
  inject,
  PLATFORM_ID,
  EventEmitter,
  Output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { IComment } from '../../../../core/interfaces/comment.interface';
import { CommentItem } from '../comment-item/comment-item';
import gsap from 'gsap';

@Component({
  selector: 'app-comment-list',
  standalone: true,
  imports: [CommonModule, CommentItem],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './comment-list.html',
})
export class CommentList implements OnChanges {
  private platformId = inject(PLATFORM_ID);

  @Input() comments: IComment[] = [];
  @Input() currentUserId?: string; // Recibir del padre
  @Input() isAdmin: boolean = false; // Recibir del padre
  @Output() deleteComment = new EventEmitter<string>();
  @Output() updateComment = new EventEmitter<{ id: string; content: string }>();
  @ViewChildren('commentRef') commentElements!: QueryList<ElementRef>;

  ngOnChanges(): void {
    if (isPlatformBrowser(this.platformId) && this.comments.length > 0) {
      setTimeout(() => this.animateItems(), 50);
    }
  }

  private animateItems() {
    gsap.fromTo(
      this.commentElements.map((el) => el.nativeElement),
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.25, ease: 'power2.out', overwrite: 'auto' }
    );
  }
}
