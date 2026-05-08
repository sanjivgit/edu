import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { TeacherForm } from '../components/TeacherForm';
import { useGetTeacherById, useUpdateTeacher } from '../services/teachers.service';

export default function TeachersEditPage() {
  const navigate = useNavigate();
  const { id = '' } = useParams();
  const detailQuery = useGetTeacherById({ teacherId: id });
  const updateMutation = useUpdateTeacher();
  if (!detailQuery.isLoading && !detailQuery.data) return <Navigate to="/teachers" replace />;
  return (
    <div className="space-y-6">
      <PageHeader title="Edit Teacher" description="Update teacher profile details" />
      {detailQuery.data && (
        <TeacherForm
          mode="edit"
          defaultValues={detailQuery.data}
          isSubmitting={updateMutation.isPending}
          onSubmit={(values) =>
            updateMutation.mutate(values as any, {
              onSuccess: () => navigate('/teachers'),
            })
          }
        />
      )}
    </div>
  );
}

