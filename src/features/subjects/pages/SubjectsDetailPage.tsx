import { ArrowLeft, Pencil } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { useGetSubjectById } from '../services/subjects.service';

const CATEGORY_LABEL: Record<string, string> = {
  core: 'Core',
  language: 'Language',
  elective: 'Elective',
  lab: 'Lab',
  sports: 'Sports',
  arts: 'Arts',
};

export default function SubjectsDetailPage() {
  const navigate = useNavigate();
  const { subjectId } = useParams();
  const detailQuery = useGetSubjectById({ subjectId });
  const subject = detailQuery.data;

  if (!subject) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Subject Details"
          description="Subject information"
          actions={
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/subjects')}>
              Back
            </Button>
          }
        />
        <Card>
          <div className="text-sm text-muted-foreground">{detailQuery.isLoading ? 'Loading...' : 'Subject not found.'}</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subject Details"
        description="Subject information"
        actions={
          <>
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/subjects')}>
              Back
            </Button>
            <Button size="sm" leftIcon={<Pencil className="h-4 w-4" />} onClick={() => navigate(`/subjects/${subject.id}/edit`)}>
              Edit
            </Button>
          </>
        }
      />

      <Card className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Subject</p>
            <p className="text-sm font-semibold">{subject.name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Code</p>
            <p className="text-sm font-semibold font-mono">{subject.code}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Category</p>
            <p className="text-sm font-semibold">{CATEGORY_LABEL[subject.category] ?? subject.category}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <div className="mt-1">
              <StatusBadge status={subject.isActive ? 'active' : 'inactive'} />
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Class</p>
            <p className="text-sm font-semibold">{`Class ${subject.classId}`}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Weekly Periods</p>
            <p className="text-sm font-semibold font-mono">{subject.weeklyPeriods}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Teacher</p>
            <p className="text-sm font-semibold">{subject.teacher}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

