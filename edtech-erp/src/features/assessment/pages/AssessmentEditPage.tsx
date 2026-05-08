import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AssessmentForm } from '../components/AssessmentForm';
import { useGetAssessmentById, useUpdateAssessment } from '../services/assessment.service';
import type { AssessmentUpdatePayload } from '../validations/assessment.schema';

export default function AssessmentEditPage() {
  const navigate = useNavigate();
  const { assessmentId } = useParams();
  const detailQuery = useGetAssessmentById({ assessmentId });
  const assessment = detailQuery.data;
  const updateMutation = useUpdateAssessment();

  if (!assessment) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Edit Assessment"
          description="Update assessment details"
          actions={
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/assessment')}>
              Back
            </Button>
          }
        />
        <Card>
          <div className="text-sm text-muted-foreground">{detailQuery.isLoading ? 'Loading...' : 'Assessment not found.'}</div>
        </Card>
      </div>
    );
  }

  const onSubmit = (values: AssessmentUpdatePayload | any) => {
    updateMutation.mutate(
      {
        id: assessment.id,
        title: values.title,
        type: values.type,
        classId: values.classId,
        section: values.section,
        subject: values.subject,
        totalMarks: values.totalMarks,
        date: values.date,
        instructions: values.instructions ?? '',
        status: values.status ?? assessment.status,
      },
      { onSuccess: (updated) => navigate(`/assessment/${updated.id}`) }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Assessment"
        description="Update assessment details"
        actions={
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate(`/assessment/${assessment.id}`)}>
            Back
          </Button>
        }
      />

      <AssessmentForm mode="edit" defaultValues={{ ...assessment, id: assessment.id, status: assessment.status }} onSubmit={onSubmit} isSubmitting={updateMutation.isPending} />
    </div>
  );
}

