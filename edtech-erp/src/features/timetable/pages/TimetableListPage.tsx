import { useState } from 'react';
import { useTimetableFilters } from '../hooks/useTimetableFilters';
import { Download, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SelectInput } from '@/components/ui/Input';
import { useAuth, useToast } from '@/hooks';
import { TimetableGrid, TimetableLegend } from '../components/TimetableGrid';
import { TimetableAssignModal } from '../components/TimetableAssignModal';
import { TimetableStatsCards } from '../components/TimetableStatsCards';
import { useGetTimetable } from '../services/timetable.service';
import type { TimetableAssignPayload } from '../validations/timetable.schema';

export default function TimetableListPage() {
  const { user } = useAuth();
  const canEdit = user?.role === 'superadmin' || user?.role === 'admin';
  const { success } = useToast();
  const { classId: cls, section: sec, week, setClassId: setCls, setSection: setSec, setWeek } = useTimetableFilters();
  const [editingCell, setEditingCell] = useState<TimetableAssignPayload | null>(null);

  const ttQuery = useGetTimetable({ classId: cls, section: sec, week });
  const record = ttQuery.data ?? null;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Timetable Management"
        description="View and manage class schedules and period assignments"
        actions={
          <>
            <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />} onClick={() => success('Export', 'PDF export started')} disabled={!canEdit}>
              Export PDF
            </Button>
            {canEdit ? <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setEditingCell({ classId: cls, section: sec, week, day: 'Monday', periodId: 1, subject: '', teacher: '' })}>Quick Edit</Button> : undefined}
          </>
        }
      />

      <Card className="flex flex-wrap items-center justify-between gap-4 py-3.5">
        <div className="flex items-center gap-3 flex-wrap">
          <SelectInput
            label=""
            options={Array.from({ length: 12 }, (_, i) => ({ label: `Class ${i + 1}`, value: `${i + 1}` }))}
            value={cls}
            onChange={(e) => setCls(e.target.value)}
            className="w-32"
          />
          <SelectInput
            label=""
            options={['A', 'B', 'C', 'D'].map((s) => ({ label: `Section ${s}`, value: s }))}
            value={sec}
            onChange={(e) => setSec(e.target.value)}
            className="w-32"
          />
          <div className="flex items-center gap-1">
            <Button size="icon-sm" variant="outline" onClick={() => setWeek((w) => w - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium px-3 min-w-[110px] text-center">
              {week === 0 ? 'Current Week' : week === 1 ? 'Next Week' : `Week +${week}`}
            </span>
            <Button size="icon-sm" variant="outline" onClick={() => setWeek((w) => w + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <TimetableLegend />
      </Card>

      <TimetableGrid
        record={record}
        onCellClick={({ day, periodId, subject, teacher, isEmpty }) => {
          if (!canEdit) {
            if (!isEmpty) success('Period', `${subject} — ${teacher}`);
            return;
          }
          setEditingCell({
            classId: cls,
            section: sec,
            week,
            day,
            periodId,
            subject: subject ?? '',
            teacher: teacher ?? '',
          });
        }}
      />

      <TimetableStatsCards />
      {editingCell ? <TimetableAssignModal isOpen={!!editingCell} onClose={() => setEditingCell(null)} defaultValues={editingCell} /> : null}
    </div>
  );
}

