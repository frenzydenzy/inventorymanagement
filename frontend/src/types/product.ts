import type { PaginatedResponse } from "./common";

export interface Product {
  id: number;
  product_name: string;
  price: number;
  quantity: number;
  category_id: number;
  supplier_id: number;
  sku: string;
  description: string | null;
}

export interface ProductCreate {
  product_name: string;
  price: number;
  quantity: number;
  category_name: string;
  supplier_id: number;
  sku: string;
  description?: string | null;
}

export interface ProductUpdate {
  product_name?: string;
  price?: number;
  quantity?: number;
  category_name?: string;
  supplier_id?: number;
  sku?: string;
  description?: string | null;
}

export interface ProductQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  category_id?: number;
  supplier_id?: number;
  min_price?: number;
  max_price?: number;
}

export type ProductListResponse = PaginatedResponse<Product>;
