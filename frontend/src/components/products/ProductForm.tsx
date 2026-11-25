import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "../common/Modal";
import { Input } from "../common/Input";
import { Select } from "../common/Select";
import { Button } from "../common/Button";
import { CategoryFormModal } from "../categories/CategoryFormModal";
import {
  SupplierFormModal,
  type SupplierFormValues,
} from "../suppliers/SupplierFormModal";
import { createCategory } from "../../api/categories";
import { createSupplier } from "../../api/suppliers";
import type { Category } from "../../types/category";
import type { Supplier } from "../../types/supplier";
import type { Product } from "../../types/product";
import { useToast } from "../../hooks/useToast";
import { getErrorMessage } from "../../utils/format";

const NEW_CATEGORY_VALUE = "__new_category__";
const NEW_SUPPLIER_VALUE = "__new_supplier__";

export interface ProductFormValues {
  product_name: string;
  price: number;
  quantity: number;
  category_name: string;
  supplier_id: number;
  sku: string;
  description: string;
}

interface ProductFormProps {
  isOpen: boolean;
  product: Product | null;
  categories: Category[];
  suppliers: Supplier[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: ProductFormValues) => void;
  onCategoryCreated: (category: Category) => void;
  onSupplierCreated: (supplier: Supplier) => void;
}

interface FormErrors {
  product_name?: string;
  price?: string;
  quantity?: string;
  category_id?: string;
  supplier_id?: string;
  sku?: string;
}

export function ProductForm({
  isOpen,
  product,
  categories,
  suppliers,
  isSubmitting,
  onClose,
  onSubmit,
  onCategoryCreated,
  onSupplierCreated,
}: ProductFormProps) {
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isCreatingSupplier, setIsCreatingSupplier] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setProductName(product?.product_name ?? "");
      setPrice(product ? String(product.price) : "");
      setQuantity(product ? String(product.quantity) : "");
      setCategoryId(product ? String(product.category_id) : "");
      setSupplierId(product ? String(product.supplier_id) : "");
      setSku(product?.sku ?? "");
      setDescription(product?.description ?? "");
      setErrors({});
    }
  }, [isOpen, product]);

  function handleCategoryChange(value: string) {
    if (value === NEW_CATEGORY_VALUE) {
      setIsCategoryModalOpen(true);
      return;
    }

    setCategoryId(value);
  }

  function handleSupplierChange(value: string) {
    if (value === NEW_SUPPLIER_VALUE) {
      setIsSupplierModalOpen(true);
      return;
    }

    setSupplierId(value);
  }

  async function handleCategoryCreate(values: {
    name: string;
    description: string;
  }) {
    setIsCreatingCategory(true);

    try {
      const created = await createCategory(values);
      onCategoryCreated(created);
      setCategoryId(String(created.id));
      setIsCategoryModalOpen(false);
      showToast("Category created", "success");
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setIsCreatingCategory(false);
    }
  }

  async function handleSupplierCreate(values: SupplierFormValues) {
    setIsCreatingSupplier(true);

    try {
      const created = await createSupplier(values);
      onSupplierCreated(created);
      setSupplierId(String(created.id));
      setIsSupplierModalOpen(false);
      showToast("Supplier created", "success");
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setIsCreatingSupplier(false);
    }
  }

  function validate(): FormErrors {
    const nextErrors: FormErrors = {};

    if (!productName.trim()) {
      nextErrors.product_name = "Product name is required";
    }

    const priceValue = Number(price);
    if (!price || Number.isNaN(priceValue) || priceValue <= 0) {
      nextErrors.price = "Enter a valid price greater than 0";
    }

    const quantityValue = Number(quantity);
    if (
      quantity === "" ||
      !Number.isInteger(quantityValue) ||
      quantityValue < 0
    ) {
      nextErrors.quantity = "Enter a valid non-negative quantity";
    }

    if (!categoryId) {
      nextErrors.category_id = "Select a category";
    }

    if (!supplierId) {
      nextErrors.supplier_id = "Select a supplier";
    }

    if (!sku.trim()) {
      nextErrors.sku = "SKU is required";
    }

    return nextErrors;
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const category = categories.find(
      (item) => String(item.id) === categoryId
    );

    if (!category) {
      setErrors((current) => ({
        ...current,
        category_id: "Select a category",
      }));
      return;
    }

    onSubmit({
      product_name: productName.trim(),
      price: Number(price),
      quantity: Number(quantity),
      category_name: category.name,
      supplier_id: Number(supplierId),
      sku: sku.trim(),
      description: description.trim(),
    });
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={product ? "Edit Product" : "Add Product"}
        size="lg"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" form="product-form" isLoading={isSubmitting}>
              {product ? "Save Changes" : "Create Product"}
            </Button>
          </>
        }
      >
        <form
          id="product-form"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          onSubmit={handleSubmit}
        >
          <Input
            id="product-name"
            label="Product Name"
            value={productName}
            error={errors.product_name}
            onChange={(event) => setProductName(event.target.value)}
          />
          <Input
            id="product-sku"
            label="SKU"
            value={sku}
            error={errors.sku}
            onChange={(event) => setSku(event.target.value)}
          />
          <Input
            id="product-price"
            label="Price"
            type="number"
            step="0.01"
            min="0"
            value={price}
            error={errors.price}
            onChange={(event) => setPrice(event.target.value)}
          />
          <Input
            id="product-quantity"
            label="Quantity"
            type="number"
            min="0"
            value={quantity}
            error={errors.quantity}
            onChange={(event) => setQuantity(event.target.value)}
          />
          <Select
            id="product-category"
            label="Category"
            placeholder="Select a category"
            value={categoryId}
            error={errors.category_id}
            onChange={(event) => handleCategoryChange(event.target.value)}
            options={[
              ...categories.map((category) => ({
                value: category.id,
                label: category.name,
              })),
              { value: NEW_CATEGORY_VALUE, label: "+ Add New Category" },
            ]}
          />
          <Select
            id="product-supplier"
            label="Supplier"
            placeholder="Select a supplier"
            value={supplierId}
            error={errors.supplier_id}
            onChange={(event) => handleSupplierChange(event.target.value)}
            options={[
              ...suppliers.map((supplier) => ({
                value: supplier.id,
                label: supplier.name,
              })),
              { value: NEW_SUPPLIER_VALUE, label: "+ Add New Supplier" },
            ]}
          />
          <div className="sm:col-span-2">
            <Input
              id="product-description"
              label="Description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
        </form>
      </Modal>

      <CategoryFormModal
        isOpen={isCategoryModalOpen}
        category={null}
        isSubmitting={isCreatingCategory}
        onClose={() => setIsCategoryModalOpen(false)}
        onSubmit={handleCategoryCreate}
      />

      <SupplierFormModal
        isOpen={isSupplierModalOpen}
        supplier={null}
        isSubmitting={isCreatingSupplier}
        onClose={() => setIsSupplierModalOpen(false)}
        onSubmit={handleSupplierCreate}
      />
    </>
  );
}
