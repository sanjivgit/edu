import { Card } from '@/components/ui/Card';

interface ClassStatsCardsProps {
  totalClasses: number;
  totalSections: number;
  activeClasses: number;
  totalStudents: number;
}

export function ClassStatsCards({
  totalClasses,
  totalSections,
  activeClasses,
  totalStudents,
}: ClassStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border-0 bg-blue-50 dark:bg-blue-900/20">
        <p className="text-sm text-muted-foreground">Total Classes</p>
        <p className="mt-1 text-3xl font-display font-bold text-blue-600">{totalClasses}</p>
      </Card>
      <Card className="border-0 bg-violet-50 dark:bg-violet-900/20">
        <p className="text-sm text-muted-foreground">Total Sections</p>
        <p className="mt-1 text-3xl font-display font-bold text-violet-600">{totalSections}</p>
      </Card>
      <Card className="border-0 bg-emerald-50 dark:bg-emerald-900/20">
        <p className="text-sm text-muted-foreground">Active Classes</p>
        <p className="mt-1 text-3xl font-display font-bold text-emerald-600">{activeClasses}</p>
      </Card>
      <Card className="border-0 bg-amber-50 dark:bg-amber-900/20">
        <p className="text-sm text-muted-foreground">Students Enrolled</p>
        <p className="mt-1 text-3xl font-display font-bold text-amber-600">{totalStudents}</p>
      </Card>
    </div>
  );
}
