import { useCallback, useEffect, useState } from "react";
import {
  createSupplier,
  deleteSupplier,
  getSuppliers,
  updateSupplier,
} from "../api/suppliers";
import type { Supplier } from "../types/supplier";
import { Button } from "../components/common/Button";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { ErrorState } from "../components/common/ErrorState";
import { EmptyState } from "../components/common/EmptyState";
import { ConfirmationDialog } from "../components/common/ConfirmationDialog";
import { SupplierTable } from "../components/suppliers/SupplierTable";
import {
  SupplierFormModal,
  type SupplierFormValues,
} from "../components/suppliers/SupplierFormModal";
import { useToast } from "../hooks/useToast";
import { getErrorMessage } from "../utils/format";

export function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const { showToast } = useToast();

  const loadSuppliers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getSuppliers();
      setSuppliers(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  function openCreateForm() {
    setEditingSupplier(null);
    setIsFormOpen(true);
  }

  function openEditForm(supplier: Supplier) {
    setEditingSupplier(supplier);
    setIsFormOpen(true);
  }

  async function handleFormSubmit(values: SupplierFormValues) {
    setIsSubmitting(true);

    try {
      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, values);
        showToast("Supplier updated", "success");
      } else {
        await createSupplier(values);
        showToast("Supplier created", "success");
      }

      setIsFormOpen(false);
      await loadSuppliers();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!deletingSupplier) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteSupplier(deletingSupplier.id);
      showToast("Supplier deleted", "success");
      setDeletingSupplier(null);
      await loadSuppliers();
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
          Manage the suppliers that provide your products.
        </p>
        <Button onClick={openCreateForm}>+ Add Supplier</Button>
      </div>

      <div className="rounded-lg bg-white p-4 shadow-sm">
        {isLoading && <LoadingSpinner label="Loading suppliers..." />}

        {!isLoading && error && (
          <ErrorState message={error} onRetry={loadSuppliers} />
        )}

        {!isLoading && !error && suppliers.length === 0 && (
          <EmptyState message="No suppliers yet. Add your first supplier to get started." />
        )}

        {!isLoading && !error && suppliers.length > 0 && (
          <SupplierTable
            suppliers={suppliers}
            onEdit={openEditForm}
            onDelete={setDeletingSupplier}
          />
        )}
      </div>

      <SupplierFormModal
        isOpen={isFormOpen}
        supplier={editingSupplier}
        isSubmitting={isSubmitting}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <ConfirmationDialog
        isOpen={deletingSupplier !== null}
        title="Delete Supplier"
        message={`Are you sure you want to delete "${deletingSupplier?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingSupplier(null)}
      />
    </div>
  );
}
