import { ConfirmationDialog } from "../common/ConfirmationDialog";
import type { Product } from "../../types/product";

interface ProductDeleteDialogProps {
  product: Product | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ProductDeleteDialog({
  product,
  isDeleting,
  onConfirm,
  onCancel,
}: ProductDeleteDialogProps) {
  return (
    <ConfirmationDialog
      isOpen={product !== null}
      title="Delete Product"
      message={`Are you sure you want to delete "${product?.product_name}"? This action cannot be undone.`}
      confirmLabel="Delete"
      isLoading={isDeleting}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
