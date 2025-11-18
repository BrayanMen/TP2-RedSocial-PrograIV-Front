export interface IModalConfig {
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  showCloseButton?: boolean;
  showConfirmButton?: boolean;
  confirmButtonText?: string;
  cancelButtonText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  autoClose?: number; // en milisegundos
}
