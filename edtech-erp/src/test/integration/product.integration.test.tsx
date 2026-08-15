import { describe, it, expect } from 'vitest';
import { productService } from '@/features/product/services/productService';

describe('product integration', () => {
  it('loads products, converting Decimal price strings to numbers', async () => {
    const products = await productService.getProducts();

    expect(products.length).toBe(2);
    expect(products[0]).toMatchObject({
      id: 'prod-1',
      name: 'School Bag',
      sku: 'SB-001',
      category: 'Stationery',
      stock: 25,
      status: 'active',
    });
    expect(typeof products[0].price).toBe('number');
    expect(products[0].price).toBe(149.99);
    expect(products[1].price).toBe(45);
  });

  it('loads product stats with numeric values', async () => {
    const stats = await productService.getProductStats();

    expect(stats).toEqual({
      totalProducts: 10,
      activeProducts: 8,
      lowStockProducts: 3,
      inventoryValue: 45210.5,
    });
    expect(typeof stats.inventoryValue).toBe('number');
  });

  it('creates a product and returns the mapped record', async () => {
    const created = await productService.createProduct({
      name: 'New Product',
      sku: 'NP-001',
      category: 'Books',
      stock: 5,
      price: 299.5,
      status: 'active',
    });

    expect(created.id).toBe('prod-new');
    expect(created.name).toBe('New Product');
    expect(created.price).toBe(299.5);
    expect(created.stock).toBe(5);
  });
});
