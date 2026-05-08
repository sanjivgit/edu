import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks';
import { NoticesTable } from '../components/NoticesTable';
import { useDeleteNotice, useGetNotices, usePublishNotice } from '../services/noticeboard.service';

export default function NoticeboardListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManage = user?.role === 'superadmin' || user?.role === 'admin' || user?.role === 'teacher';
  const listQuery = useGetNotices();
  const publishMutation = usePublishNotice();
  const deleteMutation = useDeleteNotice();
  const data = listQuery.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Noticeboard"
        description="Post and manage school notices"
        actions={
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/noticeboard/create')} disabled={!canManage}>
            Create Notice
          </Button>
        }
      />

      <NoticesTable
        data={data}
        isLoading={listQuery.isLoading}
        onView={(row) => navigate(`/noticeboard/${row.id}`)}
        onEdit={canManage ? (row) => navigate(`/noticeboard/${row.id}/edit`) : undefined}
        onPublish={canManage ? (row) => publishMutation.mutate({ id: row.id }) : undefined}
        onDelete={canManage ? (row) => deleteMutation.mutate({ id: row.id }) : undefined}
      />
    </div>
  );
}

