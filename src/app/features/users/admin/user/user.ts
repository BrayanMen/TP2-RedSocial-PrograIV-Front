import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AnalyticsService } from '../../../../core/services/analytics-service';
import { ModalService } from '../../../../core/services/modal-service';
import { IUser } from '../../../../core/interfaces/user.interface';
import { UpperCasePipe, NgClass } from '@angular/common';
import { CutLongTextPipe } from '../../../../shared/pipes/cut-long-text.pipe';
import { CreateUserModal } from '../../../../shared/components/modal/create-user-modal/create-user-modal';

@Component({
  selector: 'app-user',
  imports: [RouterLink, UpperCasePipe, CutLongTextPipe, NgClass, CreateUserModal],
  templateUrl: './user.html',
  styleUrl: './user.css',
})
export class User implements OnInit {
  private analyticsService = inject(AnalyticsService);
  private modalService = inject(ModalService);

  users = signal<IUser[]>([]);
  isload = signal<boolean>(false);

  showCreateUserModal = signal<boolean>(false)

  currentPage = signal<number>(1);
  totalPages = signal<number>(1);

  ngOnInit(): void {
    this.loadDataUser();
  }

  loadDataUser() {
    this.isload.set(true);
    this.analyticsService.getAllUsers(this.currentPage(), 10).subscribe({
      next: (users) => {
        this.users.set(users.data);
        if (users.meta.totalPages) this.totalPages.set(users.meta.totalPages);
        this.isload.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isload.set(false);
      },
    });
  }

  handlerStatusUser(user: IUser) {
    const newStatus = !user.isActive;
    const currentStatus = newStatus ? 'Activar' : 'Desactivar';

    this.modalService.confirmModal(
      `${currentStatus} Usuario`,
      `¿Estas seguro de que deseas ${currentStatus} a ${user.fullName}`,
      () => {
        this.users.update((u) =>
          u.map((userData) =>
            userData.id === user.id ? { ...userData, isActive: newStatus } : userData
          )
        );
        this.analyticsService.handlerUserStatus(user.id, newStatus).subscribe({
          next: () => {
            this.modalService.successModal(`Usuario ${currentStatus} con exito`);
          },
          error: () => {
            this.users.update((u) =>
              u.map((userData) => userData.id === user.id ? { ...userData, isActive: !newStatus } : userData));
            this.modalService.errorModal(`No se pudo ${currentStatus} el Usuario`)
          },
        });
      },
      () => {}
    );
  }
  openCreateUserModal() {
    console.log('Abriendo modal...');
    this.showCreateUserModal.set(true);
  }

  closeCreateUserModal() {
    this.showCreateUserModal.set(false);
  }

  onUserCreated() {
    this.loadDataUser();
    this.modalService.successModal('El usuario ha sido creado correctamente.');
  }
}
