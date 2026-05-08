import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { RouteForm } from '../components/RouteForm';
import { useCreateRoute } from '../services/transport.service';
import type { TransportRouteCreatePayload } from '../validations/transport.schema';
import type { TransportStop } from '../services/transport.service';

export default function TransportRouteCreatePage() {
  const navigate = useNavigate();
  const createMutation = useCreateRoute();

  const onSubmit = (values: TransportRouteCreatePayload, stops: TransportStop[]) => {
    createMutation.mutate(
      {
        name: values.name,
        vehicleNo: values.vehicleNo,
        driverName: values.driverName,
        driverPhone: values.driverPhone,
        startsAt: values.startsAt,
        stops,
        status: values.status,
      },
      { onSuccess: (created) => navigate(`/transport/routes/${created.id}`) }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Route"
        description="Create a new transport route with stops"
        actions={
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/transport')}>
            Back
          </Button>
        }
      />

      <RouteForm mode="create" onSubmit={onSubmit} isSubmitting={createMutation.isPending} />
    </div>
  );
}

