import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SubjectForm } from '../components/SubjectForm';
import { useGetSubjectById, useUpdateSubject } from '../services/subjects.service';
import type { UpdateSubjectPayload } from '../validations/subjects.schema';

export default function SubjectsEditPage() {
  const navigate = useNavigate();
  const { subjectId } = useParams();
  const detailQuery = useGetSubjectById({ subjectId });
  const subject = detailQuery.data;
  const updateMutation = useUpdateSubject();

  if (!subject) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Edit Subject"
          description="Update subject info"
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

  const onSubmit = (values: UpdateSubjectPayload | any) => {
    updateMutation.mutate(
      {
        id: subject.id,
        name: values.name,
        code: values.code,
        category: values.category,
        classId: values.classId,
        weeklyPeriods: values.weeklyPeriods,
        teacher: values.teacher,
        isActive: values.isActive,
      },
      {
        onSuccess: (updated) => navigate(`/subjects/${updated.id}`),
      }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Subject"
        description="Update subject info"
        actions={
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate(`/subjects/${subject.id}`)}>
            Back
          </Button>
        }
      />

      <SubjectForm mode="edit" defaultValues={{ ...subject, id: subject.id }} onSubmit={onSubmit} isSubmitting={updateMutation.isPending} />
    </div>
  );
}

