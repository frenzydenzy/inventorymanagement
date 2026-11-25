import { useCallback, useEffect, useState } from "react";
import { getProducts } from "../api/products";
import {
  getInventoryTransactions,
  stockIn,
  stockOut,
} from "../api/inventory";
import type { Product } from "../types/product";
import type { InventoryTransaction } from "../types/inventory";
import { Button } from "../components/common/Button";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { ErrorState } from "../components/common/ErrorState";
import { EmptyState } from "../components/common/EmptyState";
import {
  StockFormModal,
  type StockFormValues,
} from "../components/inventory/StockFormModal";
import { TransactionTable } from "../components/inventory/TransactionTable";
import { TransactionFilters } from "../components/inventory/TransactionFilters";
import { useToast } from "../hooks/useToast";
import { getErrorMessage } from "../utils/format";

const PRODUCT_FETCH_PAGE_SIZE = 200;

export function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [productFilter, setProductFilter] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stockModalMode, setStockModalMode] = useState<"in" | "out" | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showToast } = useToast();

  const loadProducts = useCallback(async () => {
    const data = await getProducts({ page: 1, page_size: PRODUCT_FETCH_PAGE_SIZE });
    setProducts(data.items);
  }, []);

  const loadTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getInventoryTransactions({
        product_id: productFilter ? Number(productFilter) : undefined,
      });
      setTransactions(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [productFilter]);

  useEffect(() => {
    loadProducts().catch((err) => {
      showToast(getErrorMessage(err), "error");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  async function handleStockSubmit(values: StockFormValues) {
    setIsSubmitting(true);

    try {
      if (stockModalMode === "in") {
        await stockIn(values);
        showToast("Stock added successfully", "success");
      } else {
        await stockOut(values);
        showToast("Stock removed successfully", "success");
      }

      setStockModalMode(null);
      await Promise.all([loadProducts(), loadTransactions()]);
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Track stock movements across all products.
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setStockModalMode("out")}>
            Stock Out
          </Button>
          <Button onClick={() => setStockModalMode("in")}>Stock In</Button>
        </div>
      </div>

      <div className="rounded-lg bg-white p-4 shadow-sm">
        <TransactionFilters
          products={products}
          productId={productFilter}
          onChange={setProductFilter}
        />
      </div>

      <div className="rounded-lg bg-white p-4 shadow-sm">
        {isLoading && <LoadingSpinner label="Loading transactions..." />}

        {!isLoading && error && (
          <ErrorState message={error} onRetry={loadTransactions} />
        )}

        {!isLoading && !error && transactions.length === 0 && (
          <EmptyState message="No inventory transactions recorded yet." />
        )}

        {!isLoading && !error && transactions.length > 0 && (
          <TransactionTable transactions={transactions} products={products} />
        )}
      </div>

      <StockFormModal
        isOpen={stockModalMode !== null}
        mode={stockModalMode ?? "in"}
        products={products}
        isSubmitting={isSubmitting}
        onClose={() => setStockModalMode(null)}
        onSubmit={handleStockSubmit}
      />
    </div>
  );
}
