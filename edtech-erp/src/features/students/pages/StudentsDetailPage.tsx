import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { useAuth } from '@/hooks';
import { useGetStudentById } from '../services/students.service';

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium mt-0.5">{value || '—'}</p>
    </div>
  );
}

export default function StudentsDetailPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canEdit = user?.role === 'superadmin' || user?.role === 'admin';
  const { id = '' } = useParams();
  const detailQuery = useGetStudentById({ studentId: id });

  if (!detailQuery.isLoading && !detailQuery.data) return <Navigate to="/students" replace />;
  const student = detailQuery.data;
  if (!student) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Details"
        description="View student profile information"
        actions={
          canEdit ? (
            <Button size="sm" onClick={() => navigate(`/students/${student.id}/edit`)}>
              Edit
            </Button>
          ) : undefined
        }
      />
      <Card className="p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            {student.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold">{student.name}</p>
            <p className="text-xs text-muted-foreground">{student.rollNo}</p>
          </div>
          <div className="ml-auto">
            <StatusBadge status={student.status} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Class" value={`Class ${student.classId}-${student.section}`} />
          <Field label="Gender" value={student.gender ? student.gender.charAt(0).toUpperCase() + student.gender.slice(1) : ''} />
          <Field label="Date of Birth" value={student.dob ? new Date(student.dob).toLocaleDateString('en-IN') : ''} />
          <Field label="Phone" value={student.phone} />
          <Field label="Email" value={student.email} />
          <Field label="Admission Date" value={student.admissionDate ? new Date(student.admissionDate).toLocaleDateString('en-IN') : ''} />
          <Field label="Parent" value={student.parentName} />
          <Field label="Address" value={student.address} />
        </div>
      </Card>
    </div>
  );
}
