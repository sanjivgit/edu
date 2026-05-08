import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { ExamForm } from '../components/ExamForm';
import { useCreateExam } from '../services/exam.service';
import type { ExamCreatePayload } from '../validations/exam.schema';
import type { ExamPaper } from '../services/exam.service';

export default function ExamCreatePage() {
  const navigate = useNavigate();
  const createMutation = useCreateExam();

  const onSubmit = (values: ExamCreatePayload, papers: ExamPaper[]) => {
    createMutation.mutate(
      {
        name: values.name,
        term: values.term,
        classId: values.classId,
        section: values.section,
        papers,
        notes: values.notes ?? '',
        status: 'scheduled',
      },
      { onSuccess: (created) => navigate(`/exam/${created.id}`) }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Schedule Exam"
        description="Create an exam timetable and papers"
        actions={
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/exam')}>
            Back
          </Button>
        }
      />

      <ExamForm mode="create" onSubmit={onSubmit} isSubmitting={createMutation.isPending} />
    </div>
  );
}

