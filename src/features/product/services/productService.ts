import { mockDelay } from '@/shared/utils';

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

let productStore: Product[] = [
  { id: 'PRD-001', name: 'Smart Classroom Board', sku: 'SCB-1001', category: 'Hardware', stock: 14, price: 35999, status: 'active' },
  { id: 'PRD-002', name: 'Science Lab Kit', sku: 'SLK-2003', category: 'Lab', stock: 8, price: 12999, status: 'active' },
  { id: 'PRD-003', name: 'Sports Equipment Set', sku: 'SES-3100', category: 'Sports', stock: 22, price: 8999, status: 'active' },
  { id: 'PRD-004', name: 'Library RFID Scanner', sku: 'LRS-0091', category: 'Library', stock: 3, price: 15499, status: 'inactive' },
  { id: 'PRD-005', name: 'Projector Mount Kit', sku: 'PMK-4550', category: 'Hardware', stock: 5, price: 4999, status: 'active' },
];

function calculateStats(list: Product[]): ProductStats {
  return {
    totalProducts: list.length,
    activeProducts: list.filter((item) => item.status === 'active').length,
    lowStockProducts: list.filter((item) => item.stock <= 5).length,
    inventoryValue: list.reduce((sum, item) => sum + item.stock * item.price, 0),
  };
}

export const productService = {
  async getProducts(): Promise<Product[]> {
    await mockDelay(300);
    return [...productStore];
  },

  async getProductStats(): Promise<ProductStats> {
    await mockDelay(200);
    return calculateStats(productStore);
  },

  async createProduct(payload: Omit<Product, 'id'>): Promise<Product> {
    await mockDelay(300);
    const created: Product = {
      id: `PRD-${String(productStore.length + 1).padStart(3, '0')}`,
      ...payload,
    };
    productStore = [...productStore, created];
    return created;
  },
};
