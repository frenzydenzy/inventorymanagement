import type { Supplier } from "../../types/supplier";
import { Table, type TableColumn } from "../common/Table";
import { Button } from "../common/Button";

interface SupplierTableProps {
  suppliers: Supplier[];
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
}

export function SupplierTable({
  suppliers,
  onEdit,
  onDelete,
}: SupplierTableProps) {
  const columns: TableColumn<Supplier>[] = [
    { header: "ID", accessor: (row) => row.id },
    { header: "Name", accessor: (row) => row.name },
    { header: "Email", accessor: (row) => row.email ?? "—" },
    { header: "Phone", accessor: (row) => row.phone ?? "—" },
    { header: "Address", accessor: (row) => row.address ?? "—" },
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
    <Table columns={columns} rows={suppliers} getRowKey={(row) => row.id} />
  );
}
