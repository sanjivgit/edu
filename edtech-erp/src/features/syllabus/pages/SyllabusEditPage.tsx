import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SyllabusForm } from '../components/SyllabusForm';
import { useGetSyllabusById, useUpdateSyllabus } from '../services/syllabus.service';
import type { UpdateSyllabusPayload } from '../validations/syllabus.schema';
import type { SyllabusAttachment } from '../services/syllabus.service';

export default function SyllabusEditPage() {
  const navigate = useNavigate();
  const { syllabusId } = useParams();
  const detailQuery = useGetSyllabusById({ syllabusId });
  const item = detailQuery.data;
  const updateMutation = useUpdateSyllabus();

  if (!item) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Edit Syllabus"
          description="Update syllabus details"
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

  const onSubmit = (values: UpdateSyllabusPayload | any, attachments: SyllabusAttachment[]) => {
    updateMutation.mutate(
      {
        id: item.id,
        title: values.title,
        classId: values.classId,
        section: values.section,
        subject: values.subject,
        term: values.term,
        description: values.description ?? '',
        attachments,
        status: values.status,
      },
      { onSuccess: (updated) => navigate(`/syllabus/${updated.id}`) }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Syllabus"
        description="Update syllabus details"
        actions={
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate(`/syllabus/${item.id}`)}>
            Back
          </Button>
        }
      />

      <SyllabusForm
        mode="edit"
        defaultValues={{ ...item, id: item.id } as any}
        onSubmit={onSubmit}
        isSubmitting={updateMutation.isPending}
      />
    </div>
  );
}

