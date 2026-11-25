import { apiClient } from "./client";
import type {
  Category,
  CategoryCreate,
  CategoryUpdate,
} from "../types/category";

export async function getCategories(): Promise<Category[]> {
  const response = await apiClient.get<Category[]>("/categories");
  return response.data;
}

export async function getCategory(categoryId: number): Promise<Category> {
  const response = await apiClient.get<Category>(`/categories/${categoryId}`);
  return response.data;
}

export async function createCategory(
  payload: CategoryCreate
): Promise<Category> {
  const response = await apiClient.post<Category>("/categories", payload);
  return response.data;
}

export async function updateCategory(
  categoryId: number,
  payload: CategoryUpdate
): Promise<Category> {
  const response = await apiClient.put<Category>(
    `/categories/${categoryId}`,
    payload
  );
  return response.data;
}

export async function deleteCategory(categoryId: number): Promise<Category> {
  const response = await apiClient.delete<Category>(
    `/categories/${categoryId}`
  );
  return response.data;
}
