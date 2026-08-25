import { Modal } from "@/components/ui/Modal";

import { ProductForm } from "./ProductForm";

import type {
  CreateProductDto,
} from "../types/product.types";

interface Props {
  open: boolean;

  onClose: () => void;

  onSubmit: (
    data:
      CreateProductDto,
  ) => void;

  loading?: boolean;

  defaultValues?:
    Partial<CreateProductDto>;
}

export function ProductModal({
  open,
  onClose,
  onSubmit,
  loading = false,
  defaultValues,
}: Props) {
  if (!open) {
    return null;
  }

  const isEditing =
    Boolean(
      defaultValues,
    );

  return (
    <Modal
      title={
        isEditing
          ? "Editar producto"
          : "Nuevo producto"
      }
      open={open}
      onClose={onClose}
    >

      <ProductForm
        defaultValues={
          defaultValues
        }
        loading={
          loading
        }
        onSubmit={
          onSubmit
        }
      />

    </Modal>
  );
}