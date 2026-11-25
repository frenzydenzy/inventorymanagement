import type { Product } from "../../types/product";
import type { Category } from "../../types/category";
import type { Supplier } from "../../types/supplier";
import { Table, type TableColumn } from "../common/Table";
import { Button } from "../common/Button";
import { formatCurrency } from "../../utils/format";

interface ProductTableProps {
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductTable({
  products,
  categories,
  suppliers,
  onEdit,
  onDelete,
}: ProductTableProps) {
  function categoryName(categoryId: number) {
    return (
      categories.find((category) => category.id === categoryId)?.name ??
      "Unknown"
    );
  }

  function supplierName(supplierId: number) {
    return (
      suppliers.find((supplier) => supplier.id === supplierId)?.name ??
      "Unknown"
    );
  }

  const columns: TableColumn<Product>[] = [
    { header: "SKU", accessor: (row) => row.sku },
    { header: "Name", accessor: (row) => row.product_name },
    { header: "Price", accessor: (row) => formatCurrency(row.price) },
    { header: "Quantity", accessor: (row) => row.quantity },
    { header: "Category", accessor: (row) => categoryName(row.category_id) },
    { header: "Supplier", accessor: (row) => supplierName(row.supplier_id) },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => onEdit(row)}>
            Edit
          </Button>
          <Button variant="danger" size="sm" onClick={() => onDelete(row)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Table columns={columns} rows={products} getRowKey={(row) => row.id} />
  );
}
