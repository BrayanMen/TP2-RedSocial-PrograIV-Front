import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo',
  standalone: true,
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: Date | string | number): string {
    if (!value) return 'Fecha no disponible';

    const date = new Date(value);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Ahora mismo';
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} minuto${Math.floor(seconds / 60) > 1 ? 's' : ''}`;
    if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} hora${Math.floor(seconds / 3600) > 1 ? 's' : ''}`;
    if (seconds < 604800) return `Hace ${Math.floor(seconds / 86400)} día${Math.floor(seconds / 86400) > 1 ? 's' : ''}`;
    if (seconds < 2592000) return `Hace ${Math.floor(seconds / 604800)} semana${Math.floor(seconds / 604800) > 1 ? 's' : ''}`;
    if (seconds < 31536000) return `Hace ${Math.floor(seconds / 2592000)} mes${Math.floor(seconds / 2592000) > 1 ? 'es' : ''}`;

    return `Hace ${Math.floor(seconds / 31536000)} año${Math.floor(seconds / 31536000) > 1 ? 's' : ''}`;
  }
}