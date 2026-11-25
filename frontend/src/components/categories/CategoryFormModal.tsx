import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "../common/Modal";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import type { Category } from "../../types/category";

interface CategoryFormModalProps {
  isOpen: boolean;
  category: Category | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: { name: string; description: string }) => void;
}

export function CategoryFormModal({
  isOpen,
  category,
  isSubmitting,
  onClose,
  onSubmit,
}: CategoryFormModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName(category?.name ?? "");
      setDescription(category?.description ?? "");
      setNameError("");
    }
  }, [isOpen, category]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!name.trim()) {
      setNameError("Name is required");
      return;
    }

    onSubmit({ name: name.trim(), description: description.trim() });
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category ? "Edit Category" : "Add Category"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="category-form" isLoading={isSubmitting}>
            {category ? "Save Changes" : "Create Category"}
          </Button>
        </>
      }
    >
      <form id="category-form" className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <Input
          id="category-name"
          label="Name"
          value={name}
          error={nameError}
          onChange={(event) => setName(event.target.value)}
        />
        <Input
          id="category-description"
          label="Description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </form>
    </Modal>
  );
}
