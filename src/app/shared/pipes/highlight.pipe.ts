import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'highlight',
  standalone: true,
})
export class HighlightPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string, searchTerm: string): SafeHtml {
    if (!value || !searchTerm) {
      return value;
    }

    const regex = new RegExp(searchTerm, 'gi');
    const highlighted = value.replace(
      regex,
      (match) => `<mark class="bg-amber-400 text-black px-1 rounded">${match}</mark>`
    );

    return this.sanitizer.bypassSecurityTrustHtml(highlighted);
  }
}