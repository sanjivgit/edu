import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { HolidayForm } from '../components/HolidayForm';
import { useGetHolidayById, useUpdateHoliday } from '../services/holidays.service';
import type { HolidayUpdatePayload } from '../validations/holidays.schema';

export default function HolidaysEditPage() {
  const navigate = useNavigate();
  const { holidayId } = useParams();
  const detailQuery = useGetHolidayById({ holidayId });
  const holiday = detailQuery.data;
  const updateMutation = useUpdateHoliday();

  if (!holiday) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Edit Holiday"
          description="Update holiday details"
          actions={
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/holidays')}>
              Back
            </Button>
          }
        />
        <Card>
          <div className="text-sm text-muted-foreground">{detailQuery.isLoading ? 'Loading...' : 'Holiday not found.'}</div>
        </Card>
      </div>
    );
  }

  const onSubmit = (values: HolidayUpdatePayload | any) => {
    updateMutation.mutate(
      {
        id: holiday.id,
        title: values.title,
        type: values.type,
        startDate: values.startDate,
        endDate: values.endDate,
        isFullDay: values.isFullDay,
        description: values.description ?? '',
        appliesTo: values.appliesTo,
        status: values.status ?? holiday.status,
      },
      { onSuccess: (updated) => navigate(`/holidays/${updated.id}`) }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Holiday"
        description="Update holiday details"
        actions={
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate(`/holidays/${holiday.id}`)}>
            Back
          </Button>
        }
      />

      <HolidayForm
        mode="edit"
        defaultValues={{ ...holiday, id: holiday.id, status: holiday.status } as any}
        onSubmit={onSubmit}
        isSubmitting={updateMutation.isPending}
      />
    </div>
  );
}

