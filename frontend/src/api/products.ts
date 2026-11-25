import { apiClient } from "./client";
import type {
  Product,
  ProductCreate,
  ProductListResponse,
  ProductQueryParams,
  ProductUpdate,
} from "../types/product";

export async function getProducts(
  params: ProductQueryParams
): Promise<ProductListResponse> {
  const response = await apiClient.get<ProductListResponse>("/products", {
    params,
  });
  return response.data;
}

export async function getProduct(productId: number): Promise<Product> {
  const response = await apiClient.get<Product>(`/products/${productId}`);
  return response.data;
}

export async function createProduct(
  payload: ProductCreate
): Promise<Product> {
  const response = await apiClient.post<Product>("/products", payload);
  return response.data;
}

export async function updateProduct(
  productId: number,
  payload: ProductUpdate
): Promise<Product> {
  const response = await apiClient.put<Product>(
    `/products/${productId}`,
    payload
  );
  return response.data;
}

export async function deleteProduct(productId: number): Promise<Product> {
  const response = await apiClient.delete<Product>(`/products/${productId}`);
  return response.data;
}
