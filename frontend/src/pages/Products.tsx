import { useCallback, useEffect, useState } from "react";
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from "../api/products";
import { getCategories } from "../api/categories";
import { getSuppliers } from "../api/suppliers";
import type { Product } from "../types/product";
import type { Category } from "../types/category";
import type { Supplier } from "../types/supplier";
import { Button } from "../components/common/Button";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { ErrorState } from "../components/common/ErrorState";
import { EmptyState } from "../components/common/EmptyState";
import { Pagination } from "../components/common/Pagination";
import { ProductFilters, type ProductFilterValues } from "../components/products/ProductFilters";
import { ProductTable } from "../components/products/ProductTable";
import { ProductForm, type ProductFormValues } from "../components/products/ProductForm";
import { ProductDeleteDialog } from "../components/products/ProductDeleteDialog";
import { useToast } from "../hooks/useToast";
import { getErrorMessage } from "../utils/format";

const PAGE_SIZE = 10;

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ProductFilterValues>({
    search: "",
    categoryId: "",
    supplierId: "",
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deletingProduct, setDeletingProduct] = useState<Product | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const { showToast } = useToast();

  const loadReferenceData = useCallback(async () => {
    const [categoryData, supplierData] = await Promise.all([
      getCategories(),
      getSuppliers(),
    ]);
    setCategories(categoryData);
    setSuppliers(supplierData);
  }, []);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getProducts({
        page,
        page_size: PAGE_SIZE,
        search: filters.search || undefined,
        category_id: filters.categoryId ? Number(filters.categoryId) : undefined,
        supplier_id: filters.supplierId ? Number(filters.supplierId) : undefined,
      });
      setProducts(data.items);
      setTotal(data.total);
      setTotalPages(data.total_pages);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    loadReferenceData().catch((err) => {
      showToast(getErrorMessage(err), "error");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  function handleFiltersChange(values: ProductFilterValues) {
    setFilters(values);
    setPage(1);
  }

  function openCreateForm() {
    setEditingProduct(null);
    setIsFormOpen(true);
  }

  function openEditForm(product: Product) {
    setEditingProduct(product);
    setIsFormOpen(true);
  }

  function handleCategoryCreated(category: Category) {
    setCategories((current) => [...current, category]);
  }

  function handleSupplierCreated(supplier: Supplier) {
    setSuppliers((current) => [...current, supplier]);
  }

  async function handleFormSubmit(values: ProductFormValues) {
    setIsSubmitting(true);

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, values);
        showToast("Product updated", "success");
      } else {
        await createProduct(values);
        showToast(
          values.quantity > 0
            ? "Product created and opening stock recorded"
            : "Product created",
          "success"
        );
      }

      setIsFormOpen(false);
      await loadProducts();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!deletingProduct) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteProduct(deletingProduct.id);
      showToast("Product deleted", "success");
      setDeletingProduct(null);
      await loadProducts();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{total} products found</p>
        <Button onClick={openCreateForm}>+ Add Product</Button>
      </div>

      <div className="rounded-lg bg-white p-4 shadow-sm">
        <ProductFilters
          categories={categories}
          suppliers={suppliers}
          onChange={handleFiltersChange}
        />
      </div>

      <div className="rounded-lg bg-white p-4 shadow-sm">
        {isLoading && <LoadingSpinner label="Loading products..." />}

        {!isLoading && error && (
          <ErrorState message={error} onRetry={loadProducts} />
        )}

        {!isLoading && !error && products.length === 0 && (
          <EmptyState message="No products match your filters." />
        )}

        {!isLoading && !error && products.length > 0 && (
          <>
            <ProductTable
              products={products}
              categories={categories}
              suppliers={suppliers}
              onEdit={openEditForm}
              onDelete={setDeletingProduct}
            />
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>

      <ProductForm
        isOpen={isFormOpen}
        product={editingProduct}
        categories={categories}
        suppliers={suppliers}
        isSubmitting={isSubmitting}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        onCategoryCreated={handleCategoryCreated}
        onSupplierCreated={handleSupplierCreated}
      />

      <ProductDeleteDialog
        product={deletingProduct}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingProduct(null)}
      />
    </div>
  );
}
