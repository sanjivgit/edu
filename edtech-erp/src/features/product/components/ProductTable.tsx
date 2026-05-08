import { StatusBadge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import type { TableColumn } from '@/types';
import type { Product } from '../services/productService';

interface ProductTableProps {
  data: Product[];
  isLoading?: boolean;
}

export function ProductTable({ data, isLoading = false }: ProductTableProps) {
  const columns: TableColumn<Product>[] = [
    { key: 'name', header: 'Product', sortable: true, render: (_, row) => <span className="font-medium">{row.name}</span> },
    { key: 'sku', header: 'SKU' },
    { key: 'category', header: 'Category', sortable: true },
    { key: 'stock', header: 'Stock', align: 'center' },
    { key: 'price', header: 'Price', align: 'right', render: (_, row) => `Rs ${row.price.toLocaleString('en-IN')}` },
    { key: 'status', header: 'Status', render: (_, row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      total={data.length}
      isLoading={isLoading}
      searchPlaceholder="Search products..."
    />
  );
}
