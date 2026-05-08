import { ArrowLeft, Pencil } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { useGetDiaryEntryById } from '../services/diary.service';

const VIS_LABEL: Record<string, string> = {
  students: 'Students',
  parents: 'Parents',
  both: 'Both',
};

export default function DiaryDetailPage() {
  const navigate = useNavigate();
  const { entryId } = useParams();
  const detailQuery = useGetDiaryEntryById({ entryId });
  const entry = detailQuery.data;

  if (!entry) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Diary Entry"
          description="Diary entry details"
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Diary Entry"
        description="Diary entry details"
        actions={
          <>
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/diary')}>
              Back
            </Button>
            <Button size="sm" leftIcon={<Pencil className="h-4 w-4" />} onClick={() => navigate(`/diary/${entry.id}/edit`)}>
              Edit
            </Button>
          </>
        }
      />

      <Card className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Date</p>
            <p className="text-sm font-semibold">{new Date(entry.date).toLocaleDateString('en-IN')}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Class</p>
            <p className="text-sm font-semibold">{`Class ${entry.classId}-${entry.section}`}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Subject</p>
            <p className="text-sm font-semibold">{entry.subject}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <div className="mt-1">
              <StatusBadge status={entry.status} />
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Author</p>
            <p className="text-sm font-semibold">{entry.author}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Visibility</p>
            <p className="text-sm font-semibold">{VIS_LABEL[entry.visibility] ?? entry.visibility}</p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs text-muted-foreground">Title</p>
          <p className="text-sm font-semibold mt-1">{entry.title}</p>
        </div>

        <div className="mt-4">
          <p className="text-xs text-muted-foreground">Content</p>
          <p className="text-sm mt-1 whitespace-pre-line">{entry.content}</p>
        </div>
      </Card>
    </div>
  );
}

