import { ArrowLeft, Pencil } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { AssessmentResultsTable } from '../components/AssessmentResultsTable';
import { useGetAssessmentById, useGetAssessmentResults } from '../services/assessment.service';

export default function AssessmentDetailPage() {
  const navigate = useNavigate();
  const { assessmentId } = useParams();
  const detailQuery = useGetAssessmentById({ assessmentId });
  const assessment = detailQuery.data;
  const resultsQuery = useGetAssessmentResults({ assessmentId });

  if (!assessment) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Assessment Details"
          description="Assessment info and results"
          actions={
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/assessment')}>
              Back
            </Button>
          }
        />
        <Card>
          <div className="text-sm text-muted-foreground">{detailQuery.isLoading ? 'Loading...' : 'Assessment not found.'}</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assessment Details"
        description="Assessment info and results"
        actions={
          <>
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/assessment')}>
              Back
            </Button>
            <Button size="sm" leftIcon={<Pencil className="h-4 w-4" />} onClick={() => navigate(`/assessment/${assessment.id}/edit`)}>
              Edit
            </Button>
          </>
        }
      />

      <Card className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Title</p>
            <p className="text-sm font-semibold">{assessment.title}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Type</p>
            <p className="text-sm font-semibold">{assessment.type.replace('-', ' ')}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Class</p>
            <p className="text-sm font-semibold">{`Class ${assessment.classId}-${assessment.section}`}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <div className="mt-1">
              <StatusBadge status={assessment.status} />
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Subject</p>
            <p className="text-sm font-semibold">{assessment.subject}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Date</p>
            <p className="text-sm font-semibold">{new Date(assessment.date).toLocaleDateString('en-IN')}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Marks</p>
            <p className="text-sm font-semibold font-mono">{assessment.totalMarks}</p>
          </div>
        </div>

        {assessment.instructions && (
          <div className="mt-4">
            <p className="text-xs text-muted-foreground">Instructions</p>
            <p className="text-sm mt-1 whitespace-pre-line">{assessment.instructions}</p>
          </div>
        )}
      </Card>

      <AssessmentResultsTable data={resultsQuery.data ?? []} isLoading={resultsQuery.isLoading} />
    </div>
  );
}

