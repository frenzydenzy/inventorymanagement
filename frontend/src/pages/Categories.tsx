import { useCallback, useEffect, useState } from "react";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../api/categories";
import type { Category } from "../types/category";
import { Button } from "../components/common/Button";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { ErrorState } from "../components/common/ErrorState";
import { EmptyState } from "../components/common/EmptyState";
import { ConfirmationDialog } from "../components/common/ConfirmationDialog";
import { CategoryTable } from "../components/categories/CategoryTable";
import { CategoryFormModal } from "../components/categories/CategoryFormModal";
import { useToast } from "../hooks/useToast";
import { getErrorMessage } from "../utils/format";

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const { showToast } = useToast();

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  function openCreateForm() {
    setEditingCategory(null);
    setIsFormOpen(true);
  }

  function openEditForm(category: Category) {
    setEditingCategory(category);
    setIsFormOpen(true);
  }

  async function handleFormSubmit(values: {
    name: string;
    description: string;
  }) {
    setIsSubmitting(true);

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, values);
        showToast("Category updated", "success");
      } else {
        await createCategory(values);
        showToast("Category created", "success");
      }

      setIsFormOpen(false);
      await loadCategories();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!deletingCategory) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteCategory(deletingCategory.id);
      showToast("Category deleted", "success");
      setDeletingCategory(null);
      await loadCategories();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Manage the product categories used across your catalog.
        </p>
        <Button onClick={openCreateForm}>+ Add Category</Button>
      </div>

      <div className="rounded-lg bg-white p-4 shadow-sm">
        {isLoading && <LoadingSpinner label="Loading categories..." />}

        {!isLoading && error && (
          <ErrorState message={error} onRetry={loadCategories} />
        )}

        {!isLoading && !error && categories.length === 0 && (
          <EmptyState message="No categories yet. Create your first category to get started." />
        )}

        {!isLoading && !error && categories.length > 0 && (
          <CategoryTable
            categories={categories}
            onEdit={openEditForm}
            onDelete={setDeletingCategory}
          />
        )}
      </div>

      <CategoryFormModal
        isOpen={isFormOpen}
        category={editingCategory}
        isSubmitting={isSubmitting}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <ConfirmationDialog
        isOpen={deletingCategory !== null}
        title="Delete Category"
        message={`Are you sure you want to delete "${deletingCategory?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingCategory(null)}
      />
    </div>
  );
}
