import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DiaryForm } from '../components/DiaryForm';
import { useGetDiaryEntryById, useUpdateDiaryEntry } from '../services/diary.service';
import type { DiaryUpdatePayload } from '../validations/diary.schema';

export default function DiaryEditPage() {
  const navigate = useNavigate();
  const { entryId } = useParams();
  const detailQuery = useGetDiaryEntryById({ entryId });
  const entry = detailQuery.data;
  const updateMutation = useUpdateDiaryEntry();

  if (!entry) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Edit Diary Entry"
          description="Update diary entry"
          actions={
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/diary')}>
              Back
            </Button>
          }
        />
        <Card>
          <div className="text-sm text-muted-foreground">{detailQuery.isLoading ? 'Loading...' : 'Diary entry not found.'}</div>
        </Card>
      </div>
    );
  }

  const onSubmit = (values: DiaryUpdatePayload | any) => {
    updateMutation.mutate(
      {
        id: entry.id,
        date: values.date,
        classId: values.classId,
        section: values.section,
        subject: values.subject,
        author: values.author,
        title: values.title,
        content: values.content,
        visibility: values.visibility,
        tags: values.tags ?? [],
        status: values.status ?? entry.status,
      } as any,
      { onSuccess: (updated) => navigate(`/diary/${updated.id}`) }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Diary Entry"
        description="Update diary entry"
        actions={
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate(`/diary/${entry.id}`)}>
            Back
          </Button>
        }
      />

      <DiaryForm
        mode="edit"
        defaultValues={{ ...entry, id: entry.id, status: entry.status } as any}
        onSubmit={onSubmit}
        isSubmitting={updateMutation.isPending}
      />
    </div>
  );
}

