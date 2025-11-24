import {
  Component,
  inject,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';
import { AnalyticsService } from '../../../../core/services/analytics-service';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './stats.html',
  styleUrl: './stats.css', // Asegúrate de tener el archivo css o quitar esta línea
})
export class Stats implements AfterViewInit, OnDestroy {
  private analyticsService = inject(AnalyticsService);
  //Selector de etiquetas en angular
  @ViewChild('postsChart') postsCanvas!: ElementRef;
  @ViewChild('commentsChart') commentsCanvas!: ElementRef;

  private charts: Chart[] = [];

  startDate = signal<string>('');
  endDate = signal<string>('');
  isLoading = signal<boolean>(false);

  ngAfterViewInit() {
    this.loadCharts();
  }

  ngOnDestroy() {
    this.destroyCharts();
  }

  private destroyCharts() {
    this.charts.forEach((c) => c.destroy());
    this.charts = [];
  }

  applyFilters() {
    this.destroyCharts();
    this.loadCharts();
  }

  clearFilters() {
    this.startDate.set('');
    this.endDate.set('');
    this.applyFilters();
  }

  loadCharts() {
    this.isLoading.set(true);
    const start = this.startDate() || undefined;
    const end = this.endDate() || undefined;
    // 1. Gráfico Barras: Posts por Usuario
    this.analyticsService.getPostUsers(start, end).subscribe({
      next: (data) => {
        if (this.postsCanvas?.nativeElement) {
          this.createBarChart(this.postsCanvas.nativeElement, data);
        }
      },
      error: (err) => console.error(err),
    });

    // 2. Gráfico Dona: Comentarios por Post
    this.analyticsService.getCommentsPerPost(start, end).subscribe({
      next: (data) => {
        if (this.commentsCanvas?.nativeElement) {
          this.createDoughnutChart(this.commentsCanvas.nativeElement, data);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      },
    });
  }

  createBarChart(canvas: any, data: any[]) {
    const chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: data.map((d) => d.label),
        datasets: [
          {
            label: 'Publicaciones',
            data: data.map((d) => d.value),
            backgroundColor: '#fbbf24',
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { color: '#ffffff10' }, ticks: { color: '#9ca3af' } },
          x: { ticks: { color: '#9ca3af' } },
        },
      },
    });
    this.charts.push(chart);
  }

  createDoughnutChart(canvas: any, data: any[]) {
    const chart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: data.map((d) => d.label),
        datasets: [
          {
            data: data.map((d) => d.value),
            backgroundColor: ['#ef4444', '#fbbf24', '#3b82f6', '#10b981'],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { color: '#e5e7eb' } },
        },
      },
    });
    this.charts.push(chart);
  }
}
