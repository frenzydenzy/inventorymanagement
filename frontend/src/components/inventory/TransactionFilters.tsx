import { Select } from "../common/Select";
import type { Product } from "../../types/product";

interface TransactionFiltersProps {
  products: Product[];
  productId: string;
  onChange: (productId: string) => void;
}

export function TransactionFilters({
  products,
  productId,
  onChange,
}: TransactionFiltersProps) {
  return (
    <div className="w-64">
      <Select
        id="transaction-product-filter"
        label="Filter by product"
        placeholder="All products"
        value={productId}
        onChange={(event) => onChange(event.target.value)}
        options={products.map((product) => ({
          value: product.id,
          label: product.product_name,
        }))}
      />
    </div>
  );
}
