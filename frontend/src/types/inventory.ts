export type TransactionType = "STOCK_IN" | "STOCK_OUT";

export interface InventoryTransaction {
  id: number;
  product_id: number;
  transaction_type: TransactionType;
  quantity: number;
  previous_quantity: number;
  new_quantity: number;
  reference: string | null;
  notes: string | null;
  created_at: string;
}

export interface StockInCreate {
  product_id: number;
  quantity: number;
  reference?: string | null;
  notes?: string | null;
}

export interface StockOutCreate {
  product_id: number;
  quantity: number;
  reference?: string | null;
  notes?: string | null;
}

export interface InventoryTransactionQueryParams {
  product_id?: number;
}
