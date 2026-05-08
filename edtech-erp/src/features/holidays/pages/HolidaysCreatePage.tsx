import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { HolidayForm } from '../components/HolidayForm';
import { useCreateHoliday } from '../services/holidays.service';
import type { HolidayCreatePayload } from '../validations/holidays.schema';

export default function HolidaysCreatePage() {
  const navigate = useNavigate();
  const createMutation = useCreateHoliday();

  const onSubmit = (values: HolidayCreatePayload) => {
    createMutation.mutate(
      {
        title: values.title,
        type: values.type,
        startDate: values.startDate,
        endDate: values.endDate,
        isFullDay: values.isFullDay,
        description: values.description ?? '',
        appliesTo: values.appliesTo,
        status: 'announced',
      },
      { onSuccess: (created) => navigate(`/holidays/${created.id}`) }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Holiday"
        description="Create a new holiday or event"
        actions={
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/holidays')}>
            Back
          </Button>
        }
      />

      <HolidayForm mode="create" onSubmit={onSubmit} isSubmitting={createMutation.isPending} />
    </div>
  );
}

