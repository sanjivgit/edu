import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { DiaryForm } from '../components/DiaryForm';
import { useCreateDiaryEntry } from '../services/diary.service';
import type { DiaryCreatePayload } from '../validations/diary.schema';

export default function DiaryCreatePage() {
  const navigate = useNavigate();
  const createMutation = useCreateDiaryEntry();

  const onSubmit = (values: DiaryCreatePayload) => {
    createMutation.mutate(
      {
        date: values.date,
        classId: values.classId,
        section: values.section,
        subject: values.subject,
        author: values.author,
        title: values.title,
        content: values.content,
        visibility: values.visibility,
        tags: values.tags ?? [],
        status: 'published',
      } as any,
      { onSuccess: (created) => navigate(`/diary/${created.id}`) }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Diary Entry"
        description="Write a new diary entry for a class"
        actions={
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/diary')}>
            Back
          </Button>
        }
      />

      <DiaryForm mode="create" onSubmit={onSubmit} isSubmitting={createMutation.isPending} />
    </div>
  );
}

