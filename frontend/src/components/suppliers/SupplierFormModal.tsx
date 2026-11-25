import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "../common/Modal";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import type { Supplier } from "../../types/supplier";

export interface SupplierFormValues {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface SupplierFormModalProps {
  isOpen: boolean;
  supplier: Supplier | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: SupplierFormValues) => void;
}

export function SupplierFormModal({
  isOpen,
  supplier,
  isSubmitting,
  onClose,
  onSubmit,
}: SupplierFormModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName(supplier?.name ?? "");
      setEmail(supplier?.email ?? "");
      setPhone(supplier?.phone ?? "");
      setAddress(supplier?.address ?? "");
      setNameError("");
    }
  }, [isOpen, supplier]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!name.trim()) {
      setNameError("Name is required");
      return;
    }

    onSubmit({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
    });
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={supplier ? "Edit Supplier" : "Add Supplier"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="supplier-form" isLoading={isSubmitting}>
            {supplier ? "Save Changes" : "Create Supplier"}
          </Button>
        </>
      }
    >
      <form
        id="supplier-form"
        className="flex flex-col gap-4"
        onSubmit={handleSubmit}
      >
        <Input
          id="supplier-name"
          label="Name"
          value={name}
          error={nameError}
          onChange={(event) => setName(event.target.value)}
        />
        <Input
          id="supplier-email"
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Input
          id="supplier-phone"
          label="Phone"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
        />
        <Input
          id="supplier-address"
          label="Address"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
        />
      </form>
    </Modal>
  );
}
