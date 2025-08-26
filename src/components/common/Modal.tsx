import type { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export const Modal = ({ open, onClose, title, children }: ModalProps) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white rounded shadow-lg w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="border-b px-4 py-3 flex items-center justify-between">
          <h3 className="font-semibold">{title}</h3>
          <button aria-label="Close" className="p-1" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog = ({
  open,
  title = 'Confirm',
  message = 'Are you sure?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="mb-4 text-sm text-gray-700">{message}</p>
      <div className="flex justify-end gap-2">
        <button className="px-4 py-2 border rounded" onClick={onCancel}>
          {cancelText}
        </button>
        <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={onConfirm}>
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};
