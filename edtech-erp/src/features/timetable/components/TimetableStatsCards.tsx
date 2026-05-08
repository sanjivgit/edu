import { Card } from '@/components/ui/Card';

export function TimetableStatsCards({
  periodsPerWeek = '40',
  subjects = '8',
  teachers = '6',
  freePeriods = '4',
}: {
  periodsPerWeek?: string;
  subjects?: string;
  teachers?: string;
  freePeriods?: string;
}) {
  const stats = [
    { label: 'Periods/Week', value: periodsPerWeek, sub: 'Across 6 days' },
    { label: 'Subjects', value: subjects, sub: 'Active this term' },
    { label: 'Teachers', value: teachers, sub: 'Assigned' },
    { label: 'Free Periods', value: freePeriods, sub: 'Unassigned' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map((s) => (
        <Card key={s.label} className="text-center">
          <p className="text-2xl font-display font-bold text-primary">{s.value}</p>
          <p className="text-sm font-medium mt-1">{s.label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
        </Card>
      ))}
    </div>
  );
}

