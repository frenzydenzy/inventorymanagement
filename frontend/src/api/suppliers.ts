import { apiClient } from "./client";
import type {
  Supplier,
  SupplierCreate,
  SupplierUpdate,
} from "../types/supplier";

export async function getSuppliers(): Promise<Supplier[]> {
  const response = await apiClient.get<Supplier[]>("/suppliers");
  return response.data;
}

export async function getSupplier(supplierId: number): Promise<Supplier> {
  const response = await apiClient.get<Supplier>(`/suppliers/${supplierId}`);
  return response.data;
}

export async function createSupplier(
  payload: SupplierCreate
): Promise<Supplier> {
  const response = await apiClient.post<Supplier>("/suppliers", payload);
  return response.data;
}

export async function updateSupplier(
  supplierId: number,
  payload: SupplierUpdate
): Promise<Supplier> {
  const response = await apiClient.put<Supplier>(
    `/suppliers/${supplierId}`,
    payload
  );
  return response.data;
}

export async function deleteSupplier(supplierId: number): Promise<Supplier> {
  const response = await apiClient.delete<Supplier>(
    `/suppliers/${supplierId}`
  );
  return response.data;
}
