import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { HomeworkForm } from '../components/HomeworkForm';
import { useCreateHomework } from '../services/homework.service';
import type { CreateHomeworkPayload } from '../validations/homework.schema';

export default function HomeworkCreatePage() {
  const navigate = useNavigate();
  const createMutation = useCreateHomework();

  const onSubmit = (values: CreateHomeworkPayload) => {
    createMutation.mutate(
      {
        title: values.title,
        description: values.description,
        classId: values.classId,
        section: values.section,
        subject: values.subject,
        assignedDate: values.assignedDate,
        dueDate: values.dueDate,
        academicYearId: values.academicYearId ?? null,
        attachments: values.attachments ?? [],
        status: 'assigned',
      } as any,
      { onSuccess: (created) => navigate(`/homework/${created.id}`) }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Homework"
        description="Assign homework for a class and subject"
        actions={
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/homework')}>
            Back
          </Button>
        }
      />

      <HomeworkForm mode="create" onSubmit={onSubmit} isSubmitting={createMutation.isPending} />
    </div>
  );
}

