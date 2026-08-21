import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { AssessmentForm } from '../components/AssessmentForm';
import { useCreateAssessment } from '../services/assessment.service';
import type { AssessmentCreatePayload } from '../validations/assessment.schema';

export default function AssessmentCreatePage() {
  const navigate = useNavigate();
  const createMutation = useCreateAssessment();

  const onSubmit = (values: AssessmentCreatePayload) => {
    createMutation.mutate(
      {
        title: values.title,
        type: values.type,
        classId: values.classId,
        section: values.section,
        subject: values.subject,
        totalMarks: values.totalMarks,
        date: values.date,
        instructions: values.instructions ?? '',
        academicYearId: values.academicYearId ?? null,
        status: 'published',
      },
      { onSuccess: (created) => navigate(`/assessment/${created.id}`) }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Assessment"
        description="Create a new assessment"
        actions={
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/assessment')}>
            Back
          </Button>
        }
      />

      <AssessmentForm mode="create" onSubmit={onSubmit} isSubmitting={createMutation.isPending} />
    </div>
  );
}

