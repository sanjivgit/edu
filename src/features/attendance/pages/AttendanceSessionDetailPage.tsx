import { useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AttendanceStatsCards } from '../components/AttendanceStatsCards';
import { AttendanceRosterTable } from '../components/AttendanceRosterTable';
import { useGetRoster, useGetSessionById, type AttendanceStatus } from '../services/attendance.service';

export default function AttendanceSessionDetailPage() {
  const navigate = useNavigate();
  const { sessionId } = useParams();

  const sessionQuery = useGetSessionById({ sessionId });
  const session = sessionQuery.data;

  const rosterQuery = useGetRoster({ classId: session?.classId, section: session?.section });
  const students = rosterQuery.data ?? [];

  const attendance = useMemo(() => {
    const map: Record<string, AttendanceStatus> = {};
    (session?.entries ?? []).forEach((e) => {
      map[e.studentId] = e.status;
    });
    return map;
  }, [session?.entries]);

  const counts = useMemo(() => {
    return Object.values(attendance).reduce(
      (acc, s) => {
        acc[s] = (acc[s] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  }, [attendance]);

  if (!session) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Attendance Session"
          description="Session details"
          actions={
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/attendance/history')}>
              Back
            </Button>
          }
        />
        <Card>
          <div className="text-sm text-muted-foreground">
            {sessionQuery.isLoading ? 'Loading...' : 'Session not found.'}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Session Details"
        description={`Class ${session.classId} · Section ${session.section} · ${new Date(session.date).toLocaleDateString('en-IN')}`}
        actions={
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/attendance/history')}>
            Back to History
          </Button>
        }
      />

      <AttendanceStatsCards present={counts.present ?? 0} absent={counts.absent ?? 0} late={counts.late ?? 0} isLoading={rosterQuery.isLoading} />

      <Card>
        <AttendanceRosterTable students={students} attendance={attendance} onMark={() => {}} readOnly />
      </Card>
    </div>
  );
}

