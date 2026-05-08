import { Card } from '@/components/ui/Card';
import type { ProductStats as ProductStatsType } from '../services/productService';

interface ProductStatsProps {
  stats?: ProductStatsType;
}

export function ProductStats({ stats }: ProductStatsProps) {
  const cards = [
    { label: 'Total Products', value: stats?.totalProducts ?? 0, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Active Products', value: stats?.activeProducts ?? 0, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Low Stock', value: stats?.lowStockProducts ?? 0, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Inventory Value', value: `Rs ${Number(stats?.inventoryValue ?? 0).toLocaleString('en-IN')}`, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((item) => (
        <Card key={item.label} className={`${item.bg} border-0`}>
          <p className="text-sm text-muted-foreground">{item.label}</p>
          <p className={`text-3xl font-display font-bold mt-1 ${item.color}`}>{item.value}</p>
        </Card>
      ))}
    </div>
  );
}
