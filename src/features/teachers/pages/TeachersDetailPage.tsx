import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/hooks';
import { useGetTeacherById } from '../services/teachers.service';

export default function TeachersDetailPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canEdit = user?.role === 'superadmin' || user?.role === 'admin';
  const { id = '' } = useParams();
  const detailQuery = useGetTeacherById({ teacherId: id });
  if (!detailQuery.isLoading && !detailQuery.data) return <Navigate to="/teachers" replace />;
  const teacher = detailQuery.data;
  if (!teacher) return null;
  return (
    <div className="space-y-6">
      <PageHeader
        title="Teacher Details"
        description="View teacher profile and allocations"
        actions={canEdit ? <Button size="sm" onClick={() => navigate(`/teachers/${teacher.id}/edit`)}>Edit</Button> : undefined}
      />
      <Card className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div><span className="text-muted-foreground">Name:</span> {teacher.fullName}</div>
        <div><span className="text-muted-foreground">Employee Code:</span> {teacher.employeeCode}</div>
        <div><span className="text-muted-foreground">Subject:</span> {teacher.subject}</div>
        <div><span className="text-muted-foreground">Phone:</span> {teacher.phone}</div>
        <div><span className="text-muted-foreground">Email:</span> {teacher.email}</div>
        <div><span className="text-muted-foreground">Class Teacher Of:</span> {teacher.classTeacherOf || '-'}</div>
      </Card>
    </div>
  );
}

