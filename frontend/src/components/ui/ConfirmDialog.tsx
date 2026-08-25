import {
  Button,
} from "./Button";

import {
  Modal,
} from "./Modal";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmText = "Eliminar",
  cancelText = "Cancelar",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={() => {
        if (!loading) {
          onCancel();
        }
      }}
      size="sm"
      closeOnBackdrop={!loading}
    >
      <p className="text-gray-600">
        {message}
      </p>

      <div className="mt-8 flex justify-end gap-3">
        <Button
          type="button"
          className="bg-gray-300 text-black hover:bg-gray-400"
          onClick={onCancel}
          disabled={loading}
        >
          {cancelText}
        </Button>

        <Button
          type="button"
          className="bg-red-600 hover:bg-red-700"
          onClick={() => {
            void onConfirm();
          }}
          disabled={loading}
        >
          {loading
            ? "Procesando..."
            : confirmText}
        </Button>
      </div>
    </Modal>
  );
}