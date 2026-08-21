import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { SyllabusForm } from '../components/SyllabusForm';
import { useCreateSyllabus } from '../services/syllabus.service';
import type { CreateSyllabusPayload } from '../validations/syllabus.schema';
import type { SyllabusAttachment } from '../services/syllabus.service';

export default function SyllabusCreatePage() {
  const navigate = useNavigate();
  const createMutation = useCreateSyllabus();

  const onSubmit = (values: CreateSyllabusPayload, attachments: SyllabusAttachment[]) => {
    createMutation.mutate(
      {
        title: values.title,
        classId: values.classId,
        section: values.section,
        subject: values.subject,
        academicYearId: (values as any).academicYearId ?? null,
        term: values.term,
        description: values.description ?? '',
        attachments,
        status: values.status,
      },
      { onSuccess: (created) => navigate(`/syllabus/${created.id}`) }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Syllabus"
        description="Create a new syllabus document"
        actions={
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/syllabus')}>
            Back
          </Button>
        }
      />

      <SyllabusForm mode="create" onSubmit={onSubmit} isSubmitting={createMutation.isPending} />
    </div>
  );
}

