import { ChevronLeft, ChevronRight, Download, Save } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SelectInput } from '@/components/ui/Input';
import { useToast } from '@/hooks';
import { TimetableGrid, TimetableLegend } from '../components/TimetableGrid';
import { TimetableStatsCards } from '../components/TimetableStatsCards';
import { useTimetableFilters } from '../hooks/useTimetableFilters';
import { useGetTimetable } from '../services/timetable.service';
import type { TimetableDay } from '../services/timetable.service';

export default function TimetableEditPage() {
  const navigate = useNavigate();
  const { success } = useToast();
  const { classId: cls, section: sec, week, setClassId: setCls, setSection: setSec, setWeek } = useTimetableFilters();

  const ttQuery = useGetTimetable({ classId: cls, section: sec, week });
  const record = ttQuery.data ?? null;

  const goAssign = (day: TimetableDay, periodId: number, subject?: string, teacher?: string) => {
    const sp = new URLSearchParams();
    sp.set('classId', cls);
    sp.set('section', sec);
    sp.set('week', String(week));
    sp.set('day', day);
    sp.set('periodId', String(periodId));
    if (subject) sp.set('subject', subject);
    if (teacher) sp.set('teacher', teacher);
    navigate(`/timetable/assign?${sp.toString()}`);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Timetable Management"
        description="View and manage class schedules and period assignments"
        actions={
          <>
            <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />} onClick={() => success('Export', 'PDF export started')}>
              Export PDF
            </Button>
            <Button variant="outline" size="sm" leftIcon={<Save className="h-4 w-4" />} asChild>
              <Link to="/timetable">Done</Link>
            </Button>
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
        onCellClick={({ day, periodId, subject, teacher }) => goAssign(day, periodId, subject, teacher)}
      />

      <TimetableStatsCards />
    </div>
  );
}

