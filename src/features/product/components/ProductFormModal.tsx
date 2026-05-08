import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input, SelectInput } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import type { Product } from '../services/productService';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: Omit<Product, 'id'>) => void;
  isSubmitting?: boolean;
}

export function ProductFormModal({ isOpen, onClose, onSubmit, isSubmitting = false }: ProductFormModalProps) {
  const [form, setForm] = useState({
    name: '',
    sku: '',
    category: '',
    stock: '0',
    price: '0',
    status: 'active' as Product['status'],
  });

  const handleSubmit = () => {
    onSubmit({
      name: form.name.trim(),
      sku: form.sku.trim().toUpperCase(),
      category: form.category,
      stock: Number(form.stock),
      price: Number(form.price),
      status: form.status,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Product"
      description="Create a new product entry with stock details."
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={isSubmitting}>
            Save Product
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Product Name" required value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
        <Input label="SKU" required value={form.sku} onChange={(event) => setForm((prev) => ({ ...prev, sku: event.target.value }))} />
        <SelectInput
          label="Category"
          required
          placeholder="Select category"
          options={[
            { label: 'Hardware', value: 'Hardware' },
            { label: 'Lab', value: 'Lab' },
            { label: 'Sports', value: 'Sports' },
            { label: 'Library', value: 'Library' },
          ]}
          value={form.category}
          onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
        />
        <SelectInput
          label="Status"
          required
          options={[
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
          ]}
          value={form.status}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, status: event.target.value as Product['status'] }))
          }
        />
        <Input
          label="Stock"
          type="number"
          min={0}
          required
          value={form.stock}
          onChange={(event) => setForm((prev) => ({ ...prev, stock: event.target.value }))}
        />
        <Input
          label="Price"
          type="number"
          min={0}
          required
          value={form.price}
          onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
        />
      </div>
    </Modal>
  );
}
