import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { SubjectForm } from '../components/SubjectForm';
import { useCreateSubject } from '../services/subjects.service';
import type { CreateSubjectPayload } from '../validations/subjects.schema';

export default function SubjectsCreatePage() {
  const navigate = useNavigate();
  const createMutation = useCreateSubject();

  const onSubmit = (values: CreateSubjectPayload) => {
    createMutation.mutate(
      {
        name: values.name,
        code: values.code,
        category: values.category,
        classId: values.classId,
        weeklyPeriods: values.weeklyPeriods,
        teacher: values.teacher,
        isActive: values.isActive,
      },
      {
        onSuccess: (created) => navigate(`/subjects/${created.id}`),
      }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Subject"
        description="Create a new subject and assign teacher"
        actions={
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/subjects')}>
            Back
          </Button>
        }
      />

      <SubjectForm mode="create" onSubmit={onSubmit} isSubmitting={createMutation.isPending} />
    </div>
  );
}

