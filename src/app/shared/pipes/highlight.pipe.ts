import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'highlight',
  standalone: true,
})
export class HighlightPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string, searchTerm: string): SafeHtml {
    if (!value) return '';
    const sanitizedValue = this.sanitizer.sanitize(SecurityContext.HTML, value) || '';

    if (!searchTerm) {
      return this.sanitizer.bypassSecurityTrustHtml(sanitizedValue);
    }

    const regex = new RegExp(searchTerm, 'gi');
    const highlighted = value.replace(
      regex,
      (match) => `<mark class="bg-amber-400 text-black px-1 rounded">${match}</mark>`
    );

    return this.sanitizer.bypassSecurityTrustHtml(highlighted);
  }
}