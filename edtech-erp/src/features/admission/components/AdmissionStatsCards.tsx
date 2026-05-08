import { Card } from '@/components/ui/Card';

interface AdmissionStatsCardsProps {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export function AdmissionStatsCards({ total, pending, approved, rejected }: AdmissionStatsCardsProps) {
  const cards = [
    { label: 'Total Applications', value: total, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Pending Review', value: pending, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Approved', value: approved, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Rejected', value: rejected, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
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
