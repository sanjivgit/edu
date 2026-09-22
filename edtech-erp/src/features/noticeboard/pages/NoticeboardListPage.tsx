import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks';
import { NoticesTable } from '../components/NoticesTable';
import { useDeleteNotice, useGetNotices, usePublishNotice } from '../services/noticeboard.service';

export default function NoticeboardListPage() {
  const navigate = useNavigate();
  const { isTeachingStaff } = useAuth();
  const listQuery = useGetNotices();
  const publishMutation = usePublishNotice();
  const deleteMutation = useDeleteNotice();
  const data = listQuery.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Noticeboard"
        description={isTeachingStaff ? 'Post and manage school notices' : 'View school notices'}
        actions={
          isTeachingStaff ? (
            <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/noticeboard/create')}>
              Create Notice
            </Button>
          ) : undefined
        }
      />

      <NoticesTable
        data={data}
        isLoading={listQuery.isLoading}
        onView={(row) => navigate(`/noticeboard/${row.id}`)}
        onEdit={isTeachingStaff ? (row) => navigate(`/noticeboard/${row.id}/edit`) : undefined}
        onPublish={isTeachingStaff ? (row) => publishMutation.mutate({ id: row.id }) : undefined}
        onDelete={isTeachingStaff ? (row) => deleteMutation.mutate({ id: row.id }) : undefined}
      />
    </div>
  );
}

