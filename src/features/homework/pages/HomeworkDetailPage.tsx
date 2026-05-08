import { ArrowLeft, CheckCircle, Pencil } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { useAuth } from '@/hooks';
import { HomeworkSubmissionsTable } from '../components/HomeworkSubmissionsTable';
import { useCloseHomework, useGetHomeworkById, useGetHomeworkSubmissions } from '../services/homework.service';

export default function HomeworkDetailPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canEdit = user?.role === 'superadmin' || user?.role === 'admin' || user?.role === 'teacher';
  const { homeworkId } = useParams();

  const detailQuery = useGetHomeworkById({ homeworkId });
  const homework = detailQuery.data;
  const submissionsQuery = useGetHomeworkSubmissions({ homeworkId });
  const closeMutation = useCloseHomework();

  if (!homework) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Homework Details"
          description="Homework information and submissions"
          actions={
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/homework')}>
              Back
            </Button>
          }
        />
        <Card>
          <div className="text-sm text-muted-foreground">{detailQuery.isLoading ? 'Loading...' : 'Homework not found.'}</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Homework Details"
        description="Homework information and submissions"
        actions={
          <>
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/homework')}>
              Back
            </Button>
            {canEdit ? <Button size="sm" leftIcon={<Pencil className="h-4 w-4" />} onClick={() => navigate(`/homework/${homework.id}/edit`)}>
              Edit
            </Button> : null}
            {canEdit && homework.status !== 'closed' && (
              <Button
                size="sm"
                variant="outline"
                leftIcon={<CheckCircle className="h-4 w-4" />}
                onClick={() => closeMutation.mutate({ id: homework.id })}
                isLoading={closeMutation.isPending}
              >
                Close Homework
              </Button>
            )}
          </>
        }
      />

      <Card className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Title</p>
            <p className="text-sm font-semibold">{homework.title}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Class</p>
            <p className="text-sm font-semibold">{`Class ${homework.classId}-${homework.section}`}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Subject</p>
            <p className="text-sm font-semibold">{homework.subject}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <div className="mt-1">
              <StatusBadge status={homework.status} />
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Assigned</p>
            <p className="text-sm font-semibold">{new Date(homework.assignedDate).toLocaleDateString('en-IN')}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Due</p>
            <p className="text-sm font-semibold">{new Date(homework.dueDate).toLocaleDateString('en-IN')}</p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs text-muted-foreground">Description</p>
          <p className="text-sm mt-1 whitespace-pre-line">{homework.description}</p>
        </div>
      </Card>

      <HomeworkSubmissionsTable data={submissionsQuery.data ?? []} isLoading={submissionsQuery.isLoading} />
    </div>
  );
}

