import type { Category } from "../../types/category";
import { Table, type TableColumn } from "../common/Table";
import { Button } from "../common/Button";

interface CategoryTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export function CategoryTable({
  categories,
  onEdit,
  onDelete,
}: CategoryTableProps) {
  const columns: TableColumn<Category>[] = [
    { header: "ID", accessor: (row) => row.id },
    { header: "Name", accessor: (row) => row.name },
    {
      header: "Description",
      accessor: (row) => row.description ?? "—",
    },
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
    <Table columns={columns} rows={categories} getRowKey={(row) => row.id} />
  );
}
