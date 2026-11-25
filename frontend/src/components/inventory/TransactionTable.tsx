import type { InventoryTransaction } from "../../types/inventory";
import type { Product } from "../../types/product";
import { Table, type TableColumn } from "../common/Table";
import { Badge } from "../common/Badge";
import { formatDateTime } from "../../utils/format";

interface TransactionTableProps {
  transactions: InventoryTransaction[];
  products: Product[];
}

export function TransactionTable({
  transactions,
  products,
}: TransactionTableProps) {
  function productName(productId: number) {
    return (
      products.find((product) => product.id === productId)?.product_name ??
      `#${productId}`
    );
  }

  const columns: TableColumn<InventoryTransaction>[] = [
    { header: "ID", accessor: (row) => row.id },
    { header: "Product", accessor: (row) => productName(row.product_id) },
    {
      header: "Type",
      accessor: (row) => (
        <Badge variant={row.transaction_type === "STOCK_IN" ? "success" : "danger"}>
          {row.transaction_type === "STOCK_IN" ? "Stock In" : "Stock Out"}
        </Badge>
      ),
    },
    { header: "Quantity", accessor: (row) => row.quantity },
    { header: "Previous", accessor: (row) => row.previous_quantity },
    { header: "New", accessor: (row) => row.new_quantity },
    { header: "Reference", accessor: (row) => row.reference ?? "—" },
    { header: "Notes", accessor: (row) => row.notes ?? "—" },
    { header: "Date", accessor: (row) => formatDateTime(row.created_at) },
  ];

  return (
    <Table
      columns={columns}
      rows={transactions}
      getRowKey={(row) => row.id}
    />
  );
}
