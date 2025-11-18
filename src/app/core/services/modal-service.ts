import { Injectable, signal } from '@angular/core';
import { IModalConfig } from '../interfaces/IModal.interface';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private isOpenModal = signal<boolean>(false);
  private isModalConfig = signal<IModalConfig | null>(null);

  public isOpen = this.isOpenModal.asReadonly();
  public modalConfig = this.isModalConfig.asReadonly();

  openModal(config: IModalConfig): void {
    this.isModalConfig.set(config);
    this.isOpenModal.set(true);

    if (config.autoClose) {
      setTimeout(() => {
        this.closeModal();
      }, config.autoClose);
    }
  }

  closeModal(): void {
    this.isOpenModal.set(false);
    this.isModalConfig.set(null);
  }

  successModal(message: string, title: string = '¡Exito!'): void {
    this.openModal({
      title,
      message,
      type: 'success',
      showCloseButton: true,
      autoClose: 3000,
    });
  }

  errorModal(message: string, title: string = 'Error'): void {
    this.openModal({
      title,
      message,
      type: 'error',
      showCloseButton: true,
      showConfirmButton: true,
      autoClose: 4000,
    });
  }

  warningModal(message: string, title: string = 'Advertencia'): void {
    this.openModal({
      title,
      message,
      type: 'warning',
      showCloseButton: true,
      showConfirmButton: true,
      confirmButtonText: 'Continuar',
    });
  }

  confirmModal(
    message: string,
    title: string = 'Confirmar',
    onConfirm: () => void,
    onCancel: () => void
  ): void {
    this.openModal({
      title,
      message,
      type: 'warning',
      showCloseButton: true,
      showConfirmButton: true,
      confirmButtonText: 'Si',
      cancelButtonText: 'No',
      onConfirm,
      onCancel,
    });
  }

  infoModal(message: string, title: string = 'Informacion') {
    this.openModal({
      title,
      message,
      type: 'info',
      showCloseButton: true,
      autoClose: 3000,
    });
  }
}
