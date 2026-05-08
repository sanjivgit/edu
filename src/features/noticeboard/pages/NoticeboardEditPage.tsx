import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { NoticeForm } from '../components/NoticeForm';
import { useGetNoticeById, useUpdateNotice } from '../services/noticeboard.service';
import type { NoticeUpdatePayload } from '../validations/noticeboard.schema';

export default function NoticeboardEditPage() {
  const navigate = useNavigate();
  const { noticeId } = useParams();
  const detailQuery = useGetNoticeById({ noticeId });
  const notice = detailQuery.data;
  const updateMutation = useUpdateNotice();

  if (!notice) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Edit Notice"
          description="Update notice details"
          actions={
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/noticeboard')}>
              Back
            </Button>
          }
        />
        <Card>
          <div className="text-sm text-muted-foreground">{detailQuery.isLoading ? 'Loading...' : 'Notice not found.'}</div>
        </Card>
      </div>
    );
  }

  const onSubmit = (values: NoticeUpdatePayload | any) => {
    updateMutation.mutate(
      {
        id: notice.id,
        title: values.title,
        message: values.message,
        category: values.category,
        publishAt: values.publishAt,
        expireAt: values.expireAt ?? '',
        audience: {
          scope: values.audience.scope,
          classId: values.audience.classId ?? '',
          section: values.audience.section ?? '',
        },
        status: values.status,
      },
      { onSuccess: (updated) => navigate(`/noticeboard/${updated.id}`) }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Notice"
        description="Update notice details"
        actions={
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate(`/noticeboard/${notice.id}`)}>
            Back
          </Button>
        }
      />

      <NoticeForm
        mode="edit"
        defaultValues={{ ...notice, id: notice.id, audience: { ...notice.audience } } as any}
        onSubmit={onSubmit}
        isSubmitting={updateMutation.isPending}
      />
    </div>
  );
}

