import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ExamForm } from '../components/ExamForm';
import { useGetExamById, useUpdateExam } from '../services/exam.service';
import type { ExamUpdatePayload } from '../validations/exam.schema';
import type { ExamPaper } from '../services/exam.service';

export default function ExamEditPage() {
  const navigate = useNavigate();
  const { examId } = useParams();
  const detailQuery = useGetExamById({ examId });
  const exam = detailQuery.data;
  const updateMutation = useUpdateExam();

  if (!exam) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Edit Exam"
          description="Update exam schedule and papers"
          actions={
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/exam')}>
              Back
            </Button>
          }
        />
        <Card>
          <div className="text-sm text-muted-foreground">{detailQuery.isLoading ? 'Loading...' : 'Exam not found.'}</div>
        </Card>
      </div>
    );
  }

  const onSubmit = (values: ExamUpdatePayload | any, papers: ExamPaper[]) => {
    updateMutation.mutate(
      {
        id: exam.id,
        name: values.name,
        term: values.term,
        classId: values.classId,
        section: values.section,
        status: values.status ?? exam.status,
        papers,
        notes: values.notes ?? '',
      },
      { onSuccess: (updated) => navigate(`/exam/${updated.id}`) }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Exam"
        description="Update exam schedule and papers"
        actions={
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate(`/exam/${exam.id}`)}>
            Back
          </Button>
        }
      />

      <ExamForm mode="edit" defaultValues={{ ...exam, id: exam.id, status: exam.status, papers: exam.papers }} onSubmit={onSubmit} isSubmitting={updateMutation.isPending} />
    </div>
  );
}

