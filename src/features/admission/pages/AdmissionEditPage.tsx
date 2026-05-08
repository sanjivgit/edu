import { ArrowLeft } from 'lucide-react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AdmissionForm } from '../components/AdmissionForm';
import { useEditAdmission, useGetAdmissionById } from '../services/admission.service';

export default function AdmissionEditPage() {
  const navigate = useNavigate();
  const { admissionId } = useParams();
  const admissionQuery = useGetAdmissionById({ admissionId });
  const editAdmission = useEditAdmission();

  if (!admissionId) return <Navigate to="/admissions" replace />;
  if (!admissionQuery.isLoading && !admissionQuery.data) return <Navigate to="/admissions" replace />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Admission Application"
        description="Update submitted applicant details"
        actions={
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/admissions')}>
            Back to List
          </Button>
        }
      />
      <Card className="p-5">
        {admissionQuery.data && (
          <AdmissionForm
            mode="edit"
            initialData={admissionQuery.data}
            isLoading={editAdmission.isPending}
            onSubmit={(payload) =>
              editAdmission.mutate(
                {
                  admissionId,
                  payload: payload as any,
                },
                {
                  onSuccess: () => navigate('/admissions'),
                }
              )
            }
          />
        )}
      </Card>
    </div>
  );
}
