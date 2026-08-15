import apiClient, { unwrapApi } from '@/lib/apiClient';
import type { ApiResponse } from '@/types';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  price: number;
  status: 'active' | 'inactive';
}

export interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  inventoryValue: number;
}

interface BackendProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  price: number | string;
  status: 'active' | 'inactive';
}

function toProduct(p: BackendProduct): Product {
  return {
    id: p.id,
    name: p.name,
    sku: p.sku,
    category: p.category,
    stock: Number(p.stock),
    price: Number(p.price),
    status: p.status,
  };
}

export const productService = {
  async getProducts(): Promise<Product[]> {
    const res = await apiClient
      .get<ApiResponse<{ items: BackendProduct[] }>>('/products', { params: { limit: 500 } })
      .then(unwrapApi);
    const items = Array.isArray(res) ? res : res?.items ?? [];
    return items.map(toProduct);
  },

  async getProductStats(): Promise<ProductStats> {
    const res = await apiClient.get<ApiResponse<ProductStats>>('/products/stats').then(unwrapApi);
    return {
      totalProducts: Number(res?.totalProducts ?? 0),
      activeProducts: Number(res?.activeProducts ?? 0),
      lowStockProducts: Number(res?.lowStockProducts ?? 0),
      inventoryValue: Number(res?.inventoryValue ?? 0),
    };
  },

  async createProduct(payload: Omit<Product, 'id'>): Promise<Product> {
    const created = await apiClient
      .post<ApiResponse<BackendProduct>>('/products', payload)
      .then(unwrapApi);
    return toProduct(created);
  },
};
