import { ArrowLeft, Pencil } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { AssignmentsTable } from '../components/AssignmentsTable';
import { RouteStopsTable } from '../components/RouteStopsTable';
import { useGetAssignmentsByRoute, useGetRouteById } from '../services/transport.service';

export default function TransportRouteDetailPage() {
  const navigate = useNavigate();
  const { routeId } = useParams();
  const detailQuery = useGetRouteById({ routeId });
  const route = detailQuery.data;
  const assignmentsQuery = useGetAssignmentsByRoute({ routeId });

  if (!route) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Route Details"
          description="Route information and assignments"
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Route Details"
        description="Route information and assignments"
        actions={
          <>
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/transport')}>
              Back
            </Button>
            <Button size="sm" leftIcon={<Pencil className="h-4 w-4" />} onClick={() => navigate(`/transport/routes/${route.id}/edit`)}>
              Edit
            </Button>
          </>
        }
      />

      <Card className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Route</p>
            <p className="text-sm font-semibold">{route.name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Vehicle</p>
            <p className="text-sm font-semibold font-mono">{route.vehicleNo}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Driver</p>
            <p className="text-sm font-semibold">{route.driverName}</p>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">{route.driverPhone}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <div className="mt-1">
              <StatusBadge status={route.status} />
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Start Time</p>
            <p className="text-sm font-semibold font-mono">{route.startsAt}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Stops</p>
            <p className="text-sm font-semibold font-mono">{route.stops.length}</p>
          </div>
        </div>
      </Card>

      <RouteStopsTable stops={route.stops} onChange={() => {}} readOnly />

      <AssignmentsTable data={assignmentsQuery.data ?? []} isLoading={assignmentsQuery.isLoading} />
    </div>
  );
}

