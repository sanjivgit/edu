import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks';
import { DiaryTable } from '../components/DiaryTable';
import { useDeleteDiaryEntry, useGetDiaryEntries, usePublishDiaryEntry } from '../services/diary.service';

export default function DiaryListPage() {
  const navigate = useNavigate();
  const { isTeachingStaff } = useAuth();
  const listQuery = useGetDiaryEntries();
  const publishMutation = usePublishDiaryEntry();
  const deleteMutation = useDeleteDiaryEntry();
  const data = listQuery.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Diary"
        description={isTeachingStaff ? 'Student and teacher diary entries' : 'View diary entries'}
        actions={
          isTeachingStaff ? (
            <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/diary/create')}>
              Create Entry
            </Button>
          ) : undefined
        }
      />

      <DiaryTable
        data={data}
        isLoading={listQuery.isLoading}
        onView={(row) => navigate(`/diary/${row.id}`)}
        onEdit={isTeachingStaff ? (row) => navigate(`/diary/${row.id}/edit`) : undefined}
        onPublish={isTeachingStaff ? (row) => publishMutation.mutate({ id: row.id }) : undefined}
        onDelete={isTeachingStaff ? (row) => deleteMutation.mutate({ id: row.id }) : undefined}
      />
    </div>
  );
}

