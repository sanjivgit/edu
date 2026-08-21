import { ArrowLeft, Pencil } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { useAuth } from '@/hooks';
import { ExamPapersTable } from '../components/ExamPapersTable';
import { ExamResultsTable } from '../components/ExamResultsTable';
import { useGetExamById, useGetExamResults } from '../services/exam.service';

const TERM_LABEL: Record<string, string> = {
  'term-1': 'Term 1',
  'term-2': 'Term 2',
  final: 'Final',
};

export default function ExamDetailPage() {
  const navigate = useNavigate();
  const { examId } = useParams();
  const { isManagement } = useAuth();
  const detailQuery = useGetExamById({ examId });
  const exam = detailQuery.data;
  const resultsQuery = useGetExamResults({ examId });

  if (!exam) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Exam Details"
          description="Exam schedule and results"
          actions={
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/exam')}>
              Back
            </Button>
          }
        />
        <Card>
          <div className="text-sm text-muted-foreground">{detailQuery.isLoading ? 'Loading...' : 'Exam not found.'}</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exam Details"
        description="Exam schedule and results"
        actions={
          <>
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/exam')}>
              Back
            </Button>
            {isManagement && (
              <Button size="sm" leftIcon={<Pencil className="h-4 w-4" />} onClick={() => navigate(`/exam/${exam.id}/edit`)}>
                Edit
              </Button>
            )}
          </>
        }
      />

      <Card className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Exam</p>
            <p className="text-sm font-semibold">{exam.name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Term</p>
            <p className="text-sm font-semibold">{TERM_LABEL[exam.term] ?? exam.term}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Class</p>
            <p className="text-sm font-semibold">{`Class ${exam.classId}-${exam.section}`}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <div className="mt-1">
              <StatusBadge status={exam.status} />
            </div>
          </div>
        </div>

        {exam.notes && (
          <div className="mt-4">
            <p className="text-xs text-muted-foreground">Notes</p>
            <p className="text-sm mt-1 whitespace-pre-line">{exam.notes}</p>
          </div>
        )}
      </Card>

      <ExamPapersTable papers={exam.papers} onChange={() => {}} readOnly />

      <ExamResultsTable data={resultsQuery.data ?? []} isLoading={resultsQuery.isLoading} />
    </div>
  );
}

