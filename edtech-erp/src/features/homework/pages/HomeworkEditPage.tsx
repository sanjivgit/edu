import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { HomeworkForm } from '../components/HomeworkForm';
import { useGetHomeworkById, useUpdateHomework } from '../services/homework.service';
import type { UpdateHomeworkPayload } from '../validations/homework.schema';

export default function HomeworkEditPage() {
  const navigate = useNavigate();
  const { homeworkId } = useParams();
  const detailQuery = useGetHomeworkById({ homeworkId });
  const homework = detailQuery.data;
  const updateMutation = useUpdateHomework();

  useEffect(() => {
    // keep for future: could prefetch attachments etc
  }, []);

  if (!homework) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Edit Homework"
          description="Update homework details"
          actions={
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/homework')}>
              Back
            </Button>
          }
        />
        <Card>
          <div className="text-sm text-muted-foreground">{detailQuery.isLoading ? 'Loading...' : 'Homework not found.'}</div>
        </Card>
      </div>
    );
  }

  const onSubmit = (values: UpdateHomeworkPayload | any) => {
    updateMutation.mutate(
      {
        id: homework.id,
        title: values.title,
        description: values.description,
        classId: values.classId,
        section: values.section,
        subject: values.subject,
        assignedDate: values.assignedDate,
        dueDate: values.dueDate,
        status: values.status ?? homework.status,
        attachments: values.attachments ?? [],
      } as any,
      { onSuccess: (updated) => navigate(`/homework/${updated.id}`) }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Homework"
        description="Update homework details"
        actions={
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate(`/homework/${homework.id}`)}>
            Back
          </Button>
        }
      />

      <HomeworkForm mode="edit" defaultValues={{ ...homework, id: homework.id, status: homework.status }} onSubmit={onSubmit} isSubmitting={updateMutation.isPending} />
    </div>
  );
}

