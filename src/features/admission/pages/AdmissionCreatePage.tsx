import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AdmissionForm } from '../components/AdmissionForm';
import { useAddAdmission } from '../services/admission.service';

export default function AdmissionCreatePage() {
  const navigate = useNavigate();
  const addAdmission = useAddAdmission();

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Admission Application"
        description="Fill complete student and guardian details"
        actions={
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/admissions')}>
            Back to List
          </Button>
        }
      />
      <Card className="p-5">
        <AdmissionForm
          mode="create"
          isLoading={addAdmission.isPending}
          onSubmit={(payload) =>
            addAdmission.mutate(payload, {
              onSuccess: () => navigate('/admissions'),
            })
          }
        />
      </Card>
    </div>
  );
}
