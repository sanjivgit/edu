import { ArrowLeft, Pencil } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { SyllabusAttachmentsTable } from '../components/SyllabusAttachmentsTable';
import { useGetSyllabusById } from '../services/syllabus.service';

const TERM_LABEL: Record<string, string> = {
  'term-1': 'Term 1',
  'term-2': 'Term 2',
  final: 'Final',
};

export default function SyllabusDetailPage() {
  const navigate = useNavigate();
  const { syllabusId } = useParams();
  const detailQuery = useGetSyllabusById({ syllabusId });
  const item = detailQuery.data;

  if (!item) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Syllabus Details"
          description="Syllabus information"
          actions={
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/syllabus')}>
              Back
            </Button>
          }
        />
        <Card>
          <div className="text-sm text-muted-foreground">{detailQuery.isLoading ? 'Loading...' : 'Syllabus not found.'}</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Syllabus Details"
        description="Syllabus information"
        actions={
          <>
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/syllabus')}>
              Back
            </Button>
            <Button size="sm" leftIcon={<Pencil className="h-4 w-4" />} onClick={() => navigate(`/syllabus/${item.id}/edit`)}>
              Edit
            </Button>
          </>
        }
      />

      <Card className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Title</p>
            <p className="text-sm font-semibold">{item.title}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Class</p>
            <p className="text-sm font-semibold">{`Class ${item.classId}-${item.section}`}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Subject</p>
            <p className="text-sm font-semibold">{item.subject}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <div className="mt-1">
              <StatusBadge status={item.status} />
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Term</p>
            <p className="text-sm font-semibold">{TERM_LABEL[item.term] ?? item.term}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Files</p>
            <p className="text-sm font-semibold font-mono">{item.attachments.length}</p>
          </div>
        </div>

        {item.description && (
          <div className="mt-4">
            <p className="text-xs text-muted-foreground">Description</p>
            <p className="text-sm mt-1 whitespace-pre-line">{item.description}</p>
          </div>
        )}
      </Card>

      <SyllabusAttachmentsTable items={item.attachments} onChange={() => {}} readOnly />
    </div>
  );
}

