import { useEffect, useMemo, useState } from 'react';
import { ClipboardCheck, Download, History } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SelectInput } from '@/components/ui/Input';
import { useAuth } from '@/hooks';
import { AttendanceStatsCards } from '../components/AttendanceStatsCards';
import { AttendanceRosterTable } from '../components/AttendanceRosterTable';
import { attendanceFilterSchema, type AttendanceFilterPayload } from '../validations/attendance.schema';
import {
  type AttendanceStatus,
  useGetRoster,
  useSaveAttendanceSession,
} from '../services/attendance.service';

export default function AttendanceMarkPage() {
  const { user } = useAuth();
  const canEdit = user?.role === 'superadmin' || user?.role === 'admin' || user?.role === 'teacher';
  const form = useForm<AttendanceFilterPayload>({
    resolver: yupResolver(attendanceFilterSchema),
    defaultValues: {
      classId: '10',
      section: 'A',
      date: new Date().toISOString().split('T')[0],
    },
  });

  const classId = form.watch('classId');
  const section = form.watch('section');
  const date = form.watch('date');

  const rosterQuery = useGetRoster({ classId, section });
  const students = rosterQuery.data ?? [];

  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const saveMutation = useSaveAttendanceSession();

  useEffect(() => {
    if (!students.length) return;
    setAttendance((prev) => {
      const next = { ...prev };
      students.forEach((s) => {
        if (!next[s.id]) next[s.id] = 'present';
      });
      return next;
    });
  }, [students]);

  const counts = useMemo(() => {
    return Object.values(attendance).reduce(
      (acc, s) => {
        acc[s] = (acc[s] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  }, [attendance]);

  const markAll = (status: 'present' | 'absent') => {
    setAttendance(Object.fromEntries(students.map((s) => [s.id, status])) as Record<string, AttendanceStatus>);
  };

  const onSave = async () => {
    const ok = await form.trigger();
    if (!ok) return;
    saveMutation.mutate({
      classId,
      section,
      date,
      entries: students.map((s) => ({ studentId: s.id, status: attendance[s.id] ?? 'present' })),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Management"
        description="Mark and track student attendance"
        actions={
          <>
            <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>
              Export
            </Button>
            <Button variant="outline" size="sm" leftIcon={<History className="h-4 w-4" />} asChild>
              <Link to="/attendance/history">History</Link>
            </Button>
            <Button size="sm" leftIcon={<ClipboardCheck className="h-4 w-4" />} onClick={onSave} isLoading={saveMutation.isPending} disabled={!canEdit}>
              Save Attendance
            </Button>
          </>
        }
      />

      <AttendanceStatsCards present={counts.present ?? 0} absent={counts.absent ?? 0} late={counts.late ?? 0} isLoading={rosterQuery.isLoading} />

      <Card>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3 flex-wrap">
            <SelectInput
              options={Array.from({ length: 12 }, (_, i) => ({ label: `Class ${i + 1}`, value: `${i + 1}` }))}
              value={classId}
              onChange={(e) => form.setValue('classId', e.target.value)}
              label=""
              placeholder="Select Class"
              className="w-36"
            />
            <SelectInput
              options={['A', 'B', 'C', 'D'].map((s) => ({ label: `Section ${s}`, value: s }))}
              value={section}
              onChange={(e) => form.setValue('section', e.target.value)}
              label=""
              placeholder="Section"
              className="w-36"
            />
            <input
              type="date"
              value={date}
              onChange={(e) => form.setValue('date', e.target.value)}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={() => markAll('present')} disabled={!canEdit}>
              Mark All Present
            </Button>
            <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => markAll('absent')} disabled={!canEdit}>
              Mark All Absent
            </Button>
          </div>
        </div>

        <AttendanceRosterTable
          students={students}
          attendance={attendance}
          readOnly={!canEdit}
          onMark={(id, status) => setAttendance((prev) => ({ ...prev, [id]: status }))}
        />
      </Card>
    </div>
  );
}

