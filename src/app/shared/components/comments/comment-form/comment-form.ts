import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-comment-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comment-form.html',
})
export class CommentForm implements OnInit {
  @Input() isSubmitting = false;
  @Input() placeholder = 'Escribe un comentario...';
  @Input() initialValue = '';
  @Output() submitComment = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();

  content = signal('');

  ngOnInit(): void {
    if (this.initialValue) {
      this.content.set(this.initialValue);
    }
  }

  handleSubmit() {
    if (this.content().trim() && !this.isSubmitting) {
      this.submitComment.emit(this.content());
      if (!this.initialValue) {
        this.content.set(''); // Limpiar input tras enviar
      }
    }
  }

  onCancel(){
    this.cancel.emit()
  }
}
