import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { AttendanceSessionsTable } from '../components/AttendanceSessionsTable';
import { useGetSessions } from '../services/attendance.service';

export default function AttendanceHistoryPage() {
  const navigate = useNavigate();
  const sessionsQuery = useGetSessions();
  const sessions = sessionsQuery.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance History"
        description="Previously saved attendance sessions"
        actions={
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/attendance')}>
            Back to Marking
          </Button>
        }
      />

      <AttendanceSessionsTable
        data={sessions}
        isLoading={sessionsQuery.isLoading}
        onView={(session) => navigate(`/attendance/sessions/${session.id}`)}
      />
    </div>
  );
}

