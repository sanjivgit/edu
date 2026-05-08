import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { TeacherForm } from '../components/TeacherForm';
import { useCreateTeacher } from '../services/teachers.service';

export default function TeachersCreatePage() {
  const navigate = useNavigate();
  const createMutation = useCreateTeacher();
  return (
    <div className="space-y-6">
      <PageHeader title="Add Teacher" description="Create a new teacher profile" />
      <TeacherForm
        mode="create"
        isSubmitting={createMutation.isPending}
        onSubmit={(values) =>
          createMutation.mutate(values as any, {
            onSuccess: () => navigate('/teachers'),
          })
        }
      />
    </div>
  );
}

