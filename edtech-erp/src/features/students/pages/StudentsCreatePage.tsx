import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { StudentForm } from '../components/StudentForm';
import { useCreateStudent } from '../services/students.service';

export default function StudentsCreatePage() {
  const navigate = useNavigate();
  const createMutation = useCreateStudent();
  return (
    <div className="space-y-6">
      <PageHeader title="Add Student" description="Create a new student profile" />
      <StudentForm
        mode="create"
        isSubmitting={createMutation.isPending}
        onSubmit={(values) =>
          createMutation.mutate(values as any, {
            onSuccess: () => navigate('/students'),
          })
        }
      />
    </div>
  );
}
