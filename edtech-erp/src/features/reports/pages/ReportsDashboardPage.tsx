import { Download } from 'lucide-react';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SelectInput } from '@/components/ui/Input';
import { useToast } from '@/hooks';
import { reportsFilterSchema, type ReportsFilterPayload } from '../validations/reports.schema';
import { useGetReports } from '../services/reports.service';
import { ReportsStatsCards } from '../components/ReportsStatsCards';
import { ReportsTrendChart } from '../components/ReportsTrendChart';
import { ReportsTopTable } from '../components/ReportsTopTable';

const REPORT_TYPES = [
  { label: 'Attendance', value: 'attendance' },
  { label: 'Fees', value: 'fees' },
  { label: 'Performance', value: 'performance' },
  { label: 'Admissions', value: 'admissions' },
];

export default function ReportsDashboardPage() {
  const { success } = useToast();
  const today = new Date();
  const toDate = today.toISOString().split('T')[0];
  const fromDate = new Date(today.getTime() - 1000 * 60 * 60 * 24 * 6).toISOString().split('T')[0];

  const form = useForm<ReportsFilterPayload>({
    resolver: yupResolver(reportsFilterSchema),
    defaultValues: {
      reportType: 'attendance',
      fromDate,
      toDate,
      classId: '',
      section: '',
    },
  });

  const reportType = form.watch('reportType');
  const from = form.watch('fromDate');
  const to = form.watch('toDate');
  const cls = form.watch('classId') ?? '';
  const sec = form.watch('section') ?? '';

  const filters = useMemo(
    () => ({
      reportType,
      fromDate: from,
      toDate: to,
      classId: cls,
      section: sec,
    }),
    [reportType, from, to, cls, sec]
  );

  const reportQuery = useGetReports({ filters: filters as any });
  const payload = reportQuery.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        description="Generate and view institutional reports"
        actions={
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="h-4 w-4" />}
            onClick={() => success('Export', 'Report export started')}
          >
            Export
          </Button>
        }
      />

      <Card className="flex flex-wrap items-center justify-between gap-4 py-3.5">
        <div className="flex items-center gap-3 flex-wrap">
          <SelectInput
            label=""
            options={REPORT_TYPES}
            value={form.watch('reportType')}
            onChange={(e) => form.setValue('reportType', e.target.value as any)}
            className="w-44"
          />
          <input
            type="date"
            value={form.watch('fromDate')}
            onChange={(e) => form.setValue('fromDate', e.target.value)}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            type="date"
            value={form.watch('toDate')}
            onChange={(e) => form.setValue('toDate', e.target.value)}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <SelectInput
            label=""
            options={[{ label: 'All Classes', value: '' }, ...Array.from({ length: 12 }, (_, i) => ({ label: `Class ${i + 1}`, value: `${i + 1}` }))]}
            value={form.watch('classId') ?? ''}
            onChange={(e) => form.setValue('classId', e.target.value)}
            className="w-36"
          />
          <SelectInput
            label=""
            options={[{ label: 'All Sections', value: '' }, ...['A', 'B', 'C', 'D'].map((s) => ({ label: `Section ${s}`, value: s }))]}
            value={form.watch('section') ?? ''}
            onChange={(e) => form.setValue('section', e.target.value)}
            className="w-36"
          />
        </div>

        <div className="text-xs text-muted-foreground">
          Filters apply instantly (mock)
        </div>
      </Card>

      <ReportsStatsCards
        totalStudents={payload?.summary.totalStudents ?? 0}
        avgAttendance={payload?.summary.avgAttendance ?? 0}
        totalCollected={payload?.summary.totalCollected ?? 0}
        newAdmissions={payload?.summary.newAdmissions ?? 0}
        isLoading={reportQuery.isLoading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ReportsTrendChart title="Trend (last range)" data={payload?.trend ?? []} />
        </div>
        <ReportsTopTable title="Highlights" rows={payload?.topRows ?? []} />
      </div>
    </div>
  );
}

