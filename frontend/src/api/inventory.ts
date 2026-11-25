import { apiClient } from "./client";
import type {
  InventoryTransaction,
  InventoryTransactionQueryParams,
  StockInCreate,
  StockOutCreate,
} from "../types/inventory";

export async function stockIn(
  payload: StockInCreate
): Promise<InventoryTransaction> {
  const response = await apiClient.post<InventoryTransaction>(
    "/inventory/stock-in",
    payload
  );
  return response.data;
}

export async function stockOut(
  payload: StockOutCreate
): Promise<InventoryTransaction> {
  const response = await apiClient.post<InventoryTransaction>(
    "/inventory/stock-out",
    payload
  );
  return response.data;
}

export async function getInventoryTransactions(
  params: InventoryTransactionQueryParams
): Promise<InventoryTransaction[]> {
  const response = await apiClient.get<InventoryTransaction[]>(
    "/inventory/transactions",
    { params }
  );
  return response.data;
}

export async function getInventoryTransaction(
  transactionId: number
): Promise<InventoryTransaction> {
  const response = await apiClient.get<InventoryTransaction>(
    `/inventory/transactions/${transactionId}`
  );
  return response.data;
}
