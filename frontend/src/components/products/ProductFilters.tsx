import { useEffect, useState } from "react";
import { Input } from "../common/Input";
import { Select } from "../common/Select";
import type { Category } from "../../types/category";
import type { Supplier } from "../../types/supplier";
import { useDebounce } from "../../hooks/useDebounce";

export interface ProductFilterValues {
  search: string;
  categoryId: string;
  supplierId: string;
}

interface ProductFiltersProps {
  categories: Category[];
  suppliers: Supplier[];
  onChange: (values: ProductFilterValues) => void;
}

export function ProductFilters({
  categories,
  suppliers,
  onChange,
}: ProductFiltersProps) {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    onChange({ search: debouncedSearch, categoryId, supplierId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, categoryId, supplierId]);

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-[220px] flex-1">
        <Input
          id="product-search"
          label="Search"
          placeholder="Search by name or SKU"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      <div className="w-48">
        <Select
          id="product-category-filter"
          label="Category"
          placeholder="All categories"
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
          options={categories.map((category) => ({
            value: category.id,
            label: category.name,
          }))}
        />
      </div>
      <div className="w-48">
        <Select
          id="product-supplier-filter"
          label="Supplier"
          placeholder="All suppliers"
          value={supplierId}
          onChange={(event) => setSupplierId(event.target.value)}
          options={suppliers.map((supplier) => ({
            value: supplier.id,
            label: supplier.name,
          }))}
        />
      </div>
    </div>
  );
}
