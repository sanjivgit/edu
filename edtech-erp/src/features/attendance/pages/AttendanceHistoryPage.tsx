import { useMemo, useState } from 'react';
import { ArrowLeft, Download, Filter, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { AttendanceSessionsTable } from '../components/AttendanceSessionsTable';
import { useGetSessions, type AttendanceSession } from '../services/attendance.service';

function exportCsv(data: AttendanceSession[]) {
  const header = 'Date,Class,Section,Present,Absent,Late';
  const rows = data.map((s) => {
    const counts = s.entries.reduce(
      (acc, e) => { acc[e.status] += 1; return acc; },
      { present: 0, absent: 0, late: 0 }
    );
    return [
      new Date(s.date).toLocaleDateString('en-IN'),
      `Class ${s.classId}`,
      s.section,
      counts.present,
      counts.absent,
      counts.late,
    ].join(',');
  });
  const blob = new Blob([header + '\n' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'attendance-history.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function AttendanceHistoryPage() {
  const navigate = useNavigate();
  const sessionsQuery = useGetSessions();
  const sessions = sessionsQuery.data ?? [];

  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const hasFilters = classFilter || sectionFilter || dateFrom || dateTo;

  const filtered = useMemo(() => {
    return sessions.filter((s) => {
      if (classFilter && String(s.classId) !== classFilter) return false;
      if (sectionFilter && s.section !== sectionFilter) return false;
      if (dateFrom && s.date < dateFrom) return false;
      if (dateTo && s.date > dateTo) return false;
      return true;
    });
  }, [sessions, classFilter, sectionFilter, dateFrom, dateTo]);

  const clearFilters = () => {
    setClassFilter('');
    setSectionFilter('');
    setDateFrom('');
    setDateTo('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance History"
        description="Previously saved attendance sessions"
        actions={
          <>
            <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />} onClick={() => exportCsv(filtered)}>
              Export
            </Button>
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/attendance')}>
              Back to Marking
            </Button>
          </>
        }
      />

      <div className="flex items-center gap-3 flex-wrap rounded-lg border bg-card p-3">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Classes</option>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={String(i + 1)}>Class {i + 1}</option>
          ))}
        </select>
        <select
          value={sectionFilter}
          onChange={(e) => setSectionFilter(e.target.value)}
          className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Sections</option>
          {['A', 'B', 'C', 'D'].map((s) => (
            <option key={s} value={s}>Section {s}</option>
          ))}
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          placeholder="From"
          className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          placeholder="To"
          className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {hasFilters && (
          <Button variant="ghost" size="sm" leftIcon={<X className="h-4 w-4" />} onClick={clearFilters}>
            Clear Filters
          </Button>
        )}
      </div>

      <AttendanceSessionsTable
        data={filtered}
        isLoading={sessionsQuery.isLoading}
        onView={(session) => navigate(`/attendance/sessions/${session.id}`)}
      />
    </div>
  );
}

