import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "../common/Modal";
import { Input } from "../common/Input";
import { Select } from "../common/Select";
import { Button } from "../common/Button";
import type { Product } from "../../types/product";

export interface StockFormValues {
  product_id: number;
  quantity: number;
  reference: string;
  notes: string;
}

interface StockFormModalProps {
  isOpen: boolean;
  mode: "in" | "out";
  products: Product[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: StockFormValues) => void;
}

interface FormErrors {
  product_id?: string;
  quantity?: string;
}

export function StockFormModal({
  isOpen,
  mode,
  products,
  isSubmitting,
  onClose,
  onSubmit,
}: StockFormModalProps) {
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (isOpen) {
      setProductId("");
      setQuantity("");
      setReference("");
      setNotes("");
      setErrors({});
    }
  }, [isOpen, mode]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: FormErrors = {};
    const quantityValue = Number(quantity);

    if (!productId) {
      nextErrors.product_id = "Select a product";
    }

    if (!quantity || Number.isNaN(quantityValue) || quantityValue <= 0) {
      nextErrors.quantity = "Enter a quantity greater than 0";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    onSubmit({
      product_id: Number(productId),
      quantity: quantityValue,
      reference: reference.trim(),
      notes: notes.trim(),
    });
  }

  const selectedProduct = products.find((p) => String(p.id) === productId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "in" ? "Stock In" : "Stock Out"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="stock-form" isLoading={isSubmitting}>
            {mode === "in" ? "Add Stock" : "Remove Stock"}
          </Button>
        </>
      }
    >
      <form id="stock-form" className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <Select
          id="stock-product"
          label="Product"
          placeholder="Select a product"
          value={productId}
          error={errors.product_id}
          onChange={(event) => setProductId(event.target.value)}
          options={products.map((product) => ({
            value: product.id,
            label: `${product.product_name} (SKU: ${product.sku})`,
          }))}
        />
        {selectedProduct && (
          <p className="-mt-2 text-xs text-gray-500">
            Current quantity: {selectedProduct.quantity}
          </p>
        )}
        <Input
          id="stock-quantity"
          label="Quantity"
          type="number"
          min="1"
          value={quantity}
          error={errors.quantity}
          onChange={(event) => setQuantity(event.target.value)}
        />
        <Input
          id="stock-reference"
          label="Reference"
          value={reference}
          onChange={(event) => setReference(event.target.value)}
        />
        <Input
          id="stock-notes"
          label="Notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </form>
    </Modal>
  );
}
