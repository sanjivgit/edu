import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { StudentForm } from '../components/StudentForm';
import { useGetStudentById, useUpdateStudent } from '../services/students.service';

export default function StudentsEditPage() {
  const navigate = useNavigate();
  const { id = '' } = useParams();
  const detailQuery = useGetStudentById({ studentId: id });
  const updateMutation = useUpdateStudent();

  if (!detailQuery.isLoading && !detailQuery.data) return <Navigate to="/students" replace />;
  const student = detailQuery.data;
  if (!student) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Student" description="Update student profile information" />
      <StudentForm
        mode="edit"
        defaultValues={{ ...student, id: student.id } as any}
        isSubmitting={updateMutation.isPending}
        onSubmit={(values) =>
          updateMutation.mutate(values as any, {
            onSuccess: (updated) => navigate(`/students/${updated.id}`),
          })
        }
      />
    </div>
  );
}
