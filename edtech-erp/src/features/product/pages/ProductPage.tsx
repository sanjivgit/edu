import { useState } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks';
import { ProductFormModal } from '../components/ProductFormModal';
import { ProductStats } from '../components/ProductStats';
import { ProductTable } from '../components/ProductTable';
import { useCreateProduct, useProducts, useProductStats } from '../hooks/useProducts';
import type { Product } from '../services/productService';

export default function ProductPage() {
  const { warning } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const productsQuery = useProducts();
  const statsQuery = useProductStats();
  const createProduct = useCreateProduct();

  const handleCreate = (payload: Omit<Product, 'id'>) => {
    if (!payload.name || !payload.sku || !payload.category) {
      warning('Missing fields', 'Please fill all required product details.');
      return;
    }

    createProduct.mutate(payload, {
      onSuccess: () => setModalOpen(false),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Management"
        description="Manage school inventory products with stock and pricing details"
        actions={
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setModalOpen(true)}>
            Add Product
          </Button>
        }
      />

      <ProductStats stats={statsQuery.data} />

      <ProductTable data={productsQuery.data ?? []} isLoading={productsQuery.isLoading} />

      <ProductFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
        isSubmitting={createProduct.isPending}
      />
    </div>
  );
}
