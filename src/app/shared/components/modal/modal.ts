import { CommonModule, isPlatformBrowser, NgClass } from '@angular/common';
import { Component, effect, HostListener, inject, Inject, PLATFORM_ID } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ModalService } from '../../../core/services/modal-service';

@Component({
  selector: 'app-modal',
  imports: [CommonModule, NgClass],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class Modal {
  private modalService = inject(ModalService);
  private sanitizer = inject(DomSanitizer);
  private isBrowser: boolean;

  isOpen = this.modalService.isOpen;
  config = this.modalService.modalConfig;

  constructor(@Inject(PLATFORM_ID) plataformId: Object) {
    this.isBrowser = isPlatformBrowser(plataformId);
    effect(() => {
      if (this.isBrowser && this.isOpen()) {
        document.body.style.overflow = 'hidden';
      } else if (this.isBrowser) {
        document.body.style.overflow = '';
      }
    });
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isOpen()) {
      this.onCancel();
    }
  }

  onConfirm(): void {
    const actConfig = this.config();
    if (actConfig?.onConfirm) {
      actConfig.onConfirm();
    }
    this.modalService.closeModal();
  }

  onCancel(): void {
    const actConfig = this.config();
    if (actConfig?.onCancel) {
      actConfig.onCancel();
    }
    this.modalService.closeModal();
  }

  onClose(): void {
    this.modalService.closeModal();
  }

  onModalContentClick(event: Event): void {
    event.stopPropagation();
  }

  getModalClass(): string {
    const actConfig = this.config();
    return `modal-${actConfig?.type || 'info'}`;
  }

  getIconClass(): string {
    const type = this.config()?.type || 'info';
    switch (type) {
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      case 'info':
        return 'text-blue-500';
      default:
        return 'text-gray-400';
    }
  }

  getIcon(): SafeHtml {
    const currentConfig = this.config();

    let svgContent = '';
    switch (currentConfig?.type) {
      case 'success':
        svgContent = `<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
        break;
      case 'error':
        svgContent = `<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
        break;
      case 'warning':
        svgContent = `<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0377 2.66667 10.2679 4L3.33975 16C2.56995 17.3333 3.53216 19 5.07183 19Z" 
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
        break;
      case 'info':
        svgContent = `<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" 
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
        break;
      default:
        svgContent = `<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
    }

    return this.sanitizer.bypassSecurityTrustHtml(svgContent);
  }

  getCloseIcon(): SafeHtml {
    const svgContent = `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

    return this.sanitizer.bypassSecurityTrustHtml(svgContent);
  }
}
