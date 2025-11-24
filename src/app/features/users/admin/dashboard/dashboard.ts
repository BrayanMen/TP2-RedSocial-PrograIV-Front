import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth-service';
import { IUser } from '../../../../core/interfaces/user.interface';
import { LoadingService } from '../../../../core/services/loading-service';
import { ModalService } from '../../../../core/services/modal-service';
import { AnalyticsService } from '../../../../core/services/analytics-service';
import { PostsService } from '../../../../core/services/posts-service';
import { IPost } from '../../../../core/interfaces/post.interface';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private loadingService = inject(LoadingService);
  private analyticsService = inject(AnalyticsService);
  private postsService = inject(PostsService);
  private modalService = inject(ModalService);
  private router = inject(Router);

  @ViewChild('commentsChart') commentsCanvas!: ElementRef;

  private charts: Chart[] = [];

  user = signal<IUser | null>(null);
  isAdmin = computed(() => this.authService.isAdmin());

  allUser = signal<number>(0);
  usersList = signal<IUser[]>([]);
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);
  totalComments = signal<number>(0);

  allPost = signal<number>(0);
  postList = signal<IPost[]>([]);

  showCreateUserModal = signal<boolean>(false);

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) this.user.set(currentUser);

    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.charts.forEach((c) => c.destroy());
  }

  loadDashboardData() {
    this.loadingService.show();

    this.analyticsService.getCommentsPerPost().subscribe({
      next: (res) => {
        this.createDoughnutChart(this.commentsCanvas.nativeElement, res);
      },
      error: (err) => console.error(err),
    });

    this.postsService.getPost(this.currentPage(), 10).subscribe({
      next: (res) => {
        this.postList.set(res.data);
        const total = res.meta?.total ?? res.data.length;
        this.allPost.set(total);
        if (res.meta.totalPages) {
          this.totalPages.set(res.meta.totalPages);
        }
        this.loadingService.hide();
      },
      error: (err) => {
        console.error('Error al cargar datos: ', err);
        this.loadingService.hide();
      },
    });

    this.analyticsService.getCommentsByRange().subscribe({
      next: (res) => {
        this.totalComments.set(res);
        this.loadingService.hide();
      },
      error: (err) => {
        console.error('Error al cargar datos: ', err);
        this.loadingService.hide();
      },
    });

    this.analyticsService.getAllUsers(this.currentPage(), 10).subscribe({
      next: (res) => {
        this.usersList.set(res.data);
        const total = res.meta?.total ?? res.data.length;
        this.allUser.set(total);
        if (res.meta.totalPages) {
          this.totalPages.set(res.meta.totalPages);
        }
        this.loadingService.hide();
      },
      error: (err) => {
        console.error('Error al cargar datos: ', err);
        this.loadingService.hide();
      },
    });
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
          legend: { position: 'left', labels: { color: '#e5e7eb' } },
        },
      },
    });
    this.charts.push(chart);
  }
}
