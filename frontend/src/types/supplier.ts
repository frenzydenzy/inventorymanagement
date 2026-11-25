export interface Supplier {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
}

export interface SupplierCreate {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}

export interface SupplierUpdate {
  name?: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}
