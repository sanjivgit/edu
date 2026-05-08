import { ArrowLeft, Pencil } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { useGetHolidayById } from '../services/holidays.service';

const TYPE_LABEL: Record<string, string> = {
  holiday: 'Holiday',
  event: 'Event',
  exam: 'Exam',
  closure: 'Closure',
};

export default function HolidaysDetailPage() {
  const navigate = useNavigate();
  const { holidayId } = useParams();
  const detailQuery = useGetHolidayById({ holidayId });
  const holiday = detailQuery.data;

  if (!holiday) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Holiday Details"
          description="Holiday information"
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Holiday Details"
        description="Holiday information"
        actions={
          <>
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/holidays')}>
              Back
            </Button>
            <Button size="sm" leftIcon={<Pencil className="h-4 w-4" />} onClick={() => navigate(`/holidays/${holiday.id}/edit`)}>
              Edit
            </Button>
          </>
        }
      />

      <Card className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Title</p>
            <p className="text-sm font-semibold">{holiday.title}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Type</p>
            <p className="text-sm font-semibold">{TYPE_LABEL[holiday.type] ?? holiday.type}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <div className="mt-1">
              <StatusBadge status={holiday.status} />
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Applies To</p>
            <p className="text-sm font-semibold">{holiday.appliesTo.toUpperCase()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Start Date</p>
            <p className="text-sm font-semibold">{new Date(holiday.startDate).toLocaleDateString('en-IN')}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">End Date</p>
            <p className="text-sm font-semibold">{new Date(holiday.endDate).toLocaleDateString('en-IN')}</p>
          </div>
        </div>

        {holiday.description && (
          <div className="mt-4">
            <p className="text-xs text-muted-foreground">Description</p>
            <p className="text-sm mt-1 whitespace-pre-line">{holiday.description}</p>
          </div>
        )}
      </Card>
    </div>
  );
}

