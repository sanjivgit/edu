import { ArrowLeft } from 'lucide-react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { useGetAdmissionById } from '../services/admission.service';

function Field({ label, value }: { label: string; value?: string | number | boolean | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium mt-0.5">{String(value ?? 'N/A')}</p>
    </div>
  );
}

export default function AdmissionDetailPage() {
  const navigate = useNavigate();
  const { admissionId } = useParams();
  const admissionQuery = useGetAdmissionById({ admissionId });

  if (!admissionId) return <Navigate to="/admissions" replace />;
  if (!admissionQuery.isLoading && !admissionQuery.data) return <Navigate to="/admissions" replace />;

  const admission = admissionQuery.data;
  if (!admission) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Application — ${admission.id}`}
        description={`${admission.firstName} ${admission.lastName}`}
        badge={<StatusBadge status={admission.status} />}
        actions={
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/admissions')}>
            Back to List
          </Button>
        }
      />
      <Card className="p-5 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Date of Birth" value={new Date(admission.dateOfBirth).toLocaleDateString('en-IN')} />
          <Field label="Gender" value={admission.gender} />
          <Field label="Class Applying" value={`${admission.classApplyingFor} - ${admission.sectionPreference}`} />
          <Field label="Father Name" value={admission.fatherName} />
          <Field label="Mother Name" value={admission.motherName} />
          <Field label="Parent Phone" value={admission.parentPhone} />
          <Field label="Parent Email" value={admission.parentEmail} />
          <Field label="Emergency Contact" value={`${admission.emergencyContactName} (${admission.emergencyContactPhone})`} />
          <Field label="Applied Date" value={new Date(admission.appliedDate).toLocaleDateString('en-IN')} />
        </div>
        <div className="border-t border-border pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Address" value={`${admission.addressLine1}, ${admission.city}, ${admission.state} - ${admission.pincode}`} />
          <Field label="Transport Required" value={admission.transportRequired ? 'Yes' : 'No'} />
          <Field label="Hostel Required" value={admission.hostelRequired ? 'Yes' : 'No'} />
          <Field label="Medical Conditions" value={admission.medicalConditions} />
        </div>
      </Card>
    </div>
  );
}
