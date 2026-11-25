import { useCallback, useEffect, useState } from "react";
import { getProducts } from "../api/products";
import { getCategories } from "../api/categories";
import { getSuppliers } from "../api/suppliers";
import { getInventoryTransactions } from "../api/inventory";
import type { InventoryTransaction } from "../types/inventory";
import type { Product } from "../types/product";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { ErrorState } from "../components/common/ErrorState";
import { EmptyState } from "../components/common/EmptyState";
import { TransactionTable } from "../components/inventory/TransactionTable";
import { getErrorMessage } from "../utils/format";

interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalSuppliers: number;
  lowStockCount: number;
}

const LOW_STOCK_THRESHOLD = 10;
const RECENT_TRANSACTIONS_LIMIT = 5;

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat-card rounded-lg p-5">
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
    </div>
  );
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [productPage, categories, suppliers, allTransactions] =
        await Promise.all([
          getProducts({ page: 1, page_size: 200 }),
          getCategories(),
          getSuppliers(),
          getInventoryTransactions({}),
        ]);

      const lowStockCount = productPage.items.filter(
        (product) => product.quantity <= LOW_STOCK_THRESHOLD
      ).length;

      setProducts(productPage.items);
      setStats({
        totalProducts: productPage.total,
        totalCategories: categories.length,
        totalSuppliers: suppliers.length,
        lowStockCount,
      });
      setTransactions(allTransactions.slice(0, RECENT_TRANSACTIONS_LIMIT));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (isLoading) {
    return <LoadingSpinner label="Loading dashboard..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadDashboard} />;
  }

  return (
    <div className="dashboard-page flex flex-col gap-6">
      <div className="dashboard-intro">
        <p className="eyebrow">Operations overview</p>
        <h2 className="dashboard-heading">Keep every item accounted for.</h2>
        <p className="dashboard-copy">A clear view of your catalog, partners, and latest stock movement.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Products" value={stats?.totalProducts ?? 0} />
        <StatCard label="Categories" value={stats?.totalCategories ?? 0} />
        <StatCard label="Suppliers" value={stats?.totalSuppliers ?? 0} />
        <StatCard label="Low Stock Items" value={stats?.lowStockCount ?? 0} />
      </div>

      <div className="surface-panel rounded-lg p-4">
        <h2 className="section-title mb-3">
          Recent Inventory Activity
        </h2>
        {transactions.length === 0 ? (
          <EmptyState message="No inventory activity yet." />
        ) : (
          <TransactionTable transactions={transactions} products={products} />
        )}
      </div>
    </div>
  );
}
