import { ArrowLeft, Pencil } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { formatNoticeAudience, useGetNoticeById } from '../services/noticeboard.service';

const CATEGORY_LABEL: Record<string, string> = {
  general: 'General',
  academic: 'Academic',
  event: 'Event',
  urgent: 'Urgent',
};

export default function NoticeboardDetailPage() {
  const navigate = useNavigate();
  const { noticeId } = useParams();
  const detailQuery = useGetNoticeById({ noticeId });
  const notice = detailQuery.data;

  if (!notice) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Notice Details"
          description="Notice information"
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notice Details"
        description="Notice information"
        actions={
          <>
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/noticeboard')}>
              Back
            </Button>
            <Button size="sm" leftIcon={<Pencil className="h-4 w-4" />} onClick={() => navigate(`/noticeboard/${notice.id}/edit`)}>
              Edit
            </Button>
          </>
        }
      />

      <Card className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Title</p>
            <p className="text-sm font-semibold">{notice.title}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Category</p>
            <p className="text-sm font-semibold">{CATEGORY_LABEL[notice.category] ?? notice.category}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Audience</p>
            <p className="text-sm font-semibold">{formatNoticeAudience(notice.audience)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <div className="mt-1">
              <StatusBadge status={notice.status} />
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Publish</p>
            <p className="text-sm font-semibold">{new Date(notice.publishAt).toLocaleDateString('en-IN')}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Views</p>
            <p className="text-sm font-semibold font-mono">{notice.views}</p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs text-muted-foreground">Message</p>
          <p className="text-sm mt-1 whitespace-pre-line">{notice.message}</p>
        </div>
      </Card>
    </div>
  );
}

