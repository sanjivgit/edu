import { useAppMutation } from '@/reactQueryConfig/hooks/useAppMutation';
import { useAppQuery } from '@/reactQueryConfig/hooks/useAppQuery';
import { productService, type Product } from '../services/productService';

export const PRODUCT_QUERY_KEYS = {
  all: ['products'] as const,
  stats: ['products', 'stats'] as const,
};

export function useProducts() {
  return useAppQuery({
    queryKey: PRODUCT_QUERY_KEYS.all,
    queryFn: productService.getProducts,
  });
}

export function useProductStats() {
  return useAppQuery({
    queryKey: PRODUCT_QUERY_KEYS.stats,
    queryFn: productService.getProductStats,
  });
}

export function useCreateProduct() {
  return useAppMutation({
    mutationFn: (payload: Omit<Product, 'id'>) => productService.createProduct(payload),
    successMsg: 'Product created successfully.',
    errorMsg: 'Could not create product.',
    invalidateQueryKeys: [PRODUCT_QUERY_KEYS.all, PRODUCT_QUERY_KEYS.stats],
  });
}
