import { useQuery } from '@tanstack/react-query';
import apiClient, { unwrapApi } from '@/lib/apiClient';
import type { ApiResponse } from '@/types';
import { useAppMutation } from '@/reactQueryConfig/hooks/useAppMutation';

export type TransportRouteStatus = 'active' | 'inactive';

export interface TransportStop {
  name: string;
  time: string; // HH:mm
}

export interface TransportRoute {
  id: string;
  name: string;
  vehicleNo: string;
  driverName: string;
  driverPhone: string;
  startsAt: string;
  stops: TransportStop[];
  status: TransportRouteStatus;
  createdAt: string;
  updatedAt: string;
}

export interface RouteAssignment {
  id: string;
  routeId: string;
  student: string;
  rollNo: string;
  classId: string;
  section: string;
  stopName: string;
}

const API = '/transport';

interface BackendStop {
  id: string;
  name: string;
  time: string;
}

interface BackendRoute {
  id: string;
  name: string;
  vehicleNo: string;
  driverName: string;
  driverPhone: string;
  startsAt: string;
  status: TransportRouteStatus;
  stops?: BackendStop[];
  createdAt: string;
  updatedAt: string;
}

function toTransportRoute(r: BackendRoute): TransportRoute {
  return {
    id: r.id,
    name: r.name,
    vehicleNo: r.vehicleNo,
    driverName: r.driverName,
    driverPhone: r.driverPhone,
    startsAt: r.startsAt,
    status: r.status,
    stops: (r.stops ?? []).map((s) => ({ name: s.name, time: s.time })),
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

function toRouteAssignment(a: {
  id: string;
  routeId: string;
  student: string;
  rollNo: string;
  classId: string;
  className?: string;
  section?: string;
  stopName: string;
}): RouteAssignment {
  const m = (a.className ?? '').match(/(\d+)/);
  return {
    id: a.id,
    routeId: a.routeId,
    student: a.student,
    rollNo: a.rollNo,
    classId: m ? m[1] : a.classId,
    section: a.section ?? '',
    stopName: a.stopName,
  };
}

export const useGetRoutes = () =>
  useQuery({
    queryKey: [API, 'routes'],
    queryFn: async () => {
      const res = await apiClient
        .get<ApiResponse<BackendRoute[]>>('/transport/routes', { params: { limit: 500 } })
        .then(unwrapApi);
      return (res ?? []).map(toTransportRoute).sort((a, b) => a.name.localeCompare(b.name));
    },
  });

export const useGetRouteById = ({ routeId }: { routeId?: string }) =>
  useQuery({
    queryKey: [API, 'routes', routeId],
    queryFn: async () => {
      if (!routeId) return null;
      const res = await apiClient.get<ApiResponse<BackendRoute>>(`/transport/routes/${routeId}`).then(unwrapApi);
      return res ? toTransportRoute(res) : null;
    },
    enabled: !!routeId,
  });

export const useGetAssignmentsByRoute = ({ routeId }: { routeId?: string }) =>
  useQuery({
    queryKey: [API, 'assignments', routeId],
    queryFn: async () => {
      if (!routeId) return [];
      const res = await apiClient
        .get<
          ApiResponse<
            Array<{
              id: string;
              routeId: string;
              student: string;
              rollNo: string;
              classId: string;
              className?: string;
              section?: string;
              stopName: string;
            }>
          >
        >(`/transport/routes/${routeId}/assignments`)
        .then(unwrapApi);
      return (res ?? []).map(toRouteAssignment);
    },
    enabled: !!routeId,
  });

export const useCreateRoute = () =>
  useAppMutation<
    TransportRoute,
    Omit<TransportRoute, 'id' | 'createdAt' | 'updatedAt'>
  >({
    mutationFn: async (body) => {
      const created = await apiClient
        .post<ApiResponse<BackendRoute>>('/transport/routes', {
          name: body.name,
          vehicleNo: body.vehicleNo,
          driverName: body.driverName,
          driverPhone: body.driverPhone,
          startsAt: body.startsAt,
          status: body.status,
          stops: body.stops.map((s) => ({ name: s.name, time: s.time })),
        })
        .then(unwrapApi);
      return toTransportRoute(created);
    },
    successMsg: 'Route created successfully',
    errorMsg: 'Failed to create route',
    invalidateQueryKeys: [[API, 'routes']],
  });

export const useUpdateRoute = () =>
  useAppMutation<
    TransportRoute,
    { id: string } & Partial<Omit<TransportRoute, 'id' | 'createdAt'>>
  >({
    mutationFn: async (body) => {
      const updated = await apiClient
        .put<ApiResponse<BackendRoute>>(`/transport/routes/${body.id}`, {
          name: body.name,
          vehicleNo: body.vehicleNo,
          driverName: body.driverName,
          driverPhone: body.driverPhone,
          startsAt: body.startsAt,
          status: body.status,
          stops: body.stops?.map((s) => ({ name: s.name, time: s.time })) ?? [],
        })
        .then(unwrapApi);
      return toTransportRoute(updated);
    },
    successMsg: 'Route updated successfully',
    errorMsg: 'Failed to update route',
    invalidateQueryKeys: [[API, 'routes']],
  });

export const useDeleteRoute = () =>
  useAppMutation<{ id: string }, { id: string }>({
    mutationFn: async (body) => {
      await apiClient.delete(`/transport/routes/${body.id}`);
      return { id: body.id };
    },
    successMsg: 'Route deleted successfully',
    errorMsg: 'Failed to delete route',
    invalidateQueryKeys: [[API, 'routes']],
  });
