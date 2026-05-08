import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { NoticeForm } from '../components/NoticeForm';
import { useCreateNotice } from '../services/noticeboard.service';
import type { NoticeCreatePayload } from '../validations/noticeboard.schema';

export default function NoticeboardCreatePage() {
  const navigate = useNavigate();
  const createMutation = useCreateNotice();

  const onSubmit = (values: NoticeCreatePayload) => {
    createMutation.mutate(
      {
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
      { onSuccess: (created) => navigate(`/noticeboard/${created.id}`) }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Notice"
        description="Publish an announcement to students, parents, or staff"
        actions={
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/noticeboard')}>
            Back
          </Button>
        }
      />

      <NoticeForm mode="create" onSubmit={onSubmit} isSubmitting={createMutation.isPending} />
    </div>
  );
}

