import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { RouteForm } from '../components/RouteForm';
import { useGetRouteById, useUpdateRoute } from '../services/transport.service';
import type { TransportRouteUpdatePayload } from '../validations/transport.schema';
import type { TransportStop } from '../services/transport.service';

export default function TransportRouteEditPage() {
  const navigate = useNavigate();
  const { routeId } = useParams();
  const detailQuery = useGetRouteById({ routeId });
  const route = detailQuery.data;
  const updateMutation = useUpdateRoute();

  if (!route) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Edit Route"
          description="Update route details"
          actions={
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/transport')}>
              Back
            </Button>
          }
        />
        <Card>
          <div className="text-sm text-muted-foreground">{detailQuery.isLoading ? 'Loading...' : 'Route not found.'}</div>
        </Card>
      </div>
    );
  }

  const onSubmit = (values: TransportRouteUpdatePayload | any, stops: TransportStop[]) => {
    updateMutation.mutate(
      {
        id: route.id,
        name: values.name,
        vehicleNo: values.vehicleNo,
        driverName: values.driverName,
        driverPhone: values.driverPhone,
        startsAt: values.startsAt,
        stops,
        status: values.status,
      },
      { onSuccess: (updated) => navigate(`/transport/routes/${updated.id}`) }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Route"
        description="Update route details"
        actions={
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate(`/transport/routes/${route.id}`)}>
            Back
          </Button>
        }
      />

      <RouteForm
        mode="edit"
        defaultValues={{ ...route, id: route.id } as any}
        onSubmit={onSubmit}
        isSubmitting={updateMutation.isPending}
      />
    </div>
  );
}

