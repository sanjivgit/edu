import { useQuery } from '@tanstack/react-query';
import { useAppMutation } from '@/reactQueryConfig/hooks/useAppMutation';
import { mockDelay } from '@/shared/utils';

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
let routeStore: TransportRoute[] = [];
let assignmentStore: RouteAssignment[] = [];

function ensureSeed() {
  if (routeStore.length) return;
  const now = new Date().toISOString();
  routeStore = [
    {
      id: 'R-1',
      name: 'Route 1 - North',
      vehicleNo: 'KA-01-AB-1234',
      driverName: 'Ramesh Kumar',
      driverPhone: '9876543210',
      startsAt: '07:10',
      stops: [
        { name: 'Green Park', time: '07:15' },
        { name: 'City Mall', time: '07:25' },
        { name: 'Library Circle', time: '07:35' },
      ],
      status: 'active',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'R-2',
      name: 'Route 2 - South',
      vehicleNo: 'KA-02-CD-7788',
      driverName: 'Suresh Singh',
      driverPhone: '9123456780',
      startsAt: '07:05',
      stops: [
        { name: 'Lake View', time: '07:10' },
        { name: 'Metro Station', time: '07:20' },
        { name: 'Market Road', time: '07:30' },
      ],
      status: 'active',
      createdAt: now,
      updatedAt: now,
    },
  ];

  assignmentStore = [
    { id: 'A-1', routeId: 'R-1', student: 'Aarav Sharma', rollNo: '010', classId: '10', section: 'A', stopName: 'City Mall' },
    { id: 'A-2', routeId: 'R-1', student: 'Priya Patel', rollNo: '011', classId: '10', section: 'A', stopName: 'Green Park' },
    { id: 'A-3', routeId: 'R-2', student: 'Riya Singh', rollNo: '012', classId: '10', section: 'A', stopName: 'Metro Station' },
  ];
}

export const useGetRoutes = () =>
  useQuery({
    queryKey: [API, 'routes'],
    queryFn: async () => {
      await mockDelay(150);
      ensureSeed();
      return [...routeStore].sort((a, b) => a.name.localeCompare(b.name));
    },
  });

export const useGetRouteById = ({ routeId }: { routeId?: string }) =>
  useQuery({
    queryKey: [API, 'routes', routeId],
    queryFn: async () => {
      await mockDelay(120);
      ensureSeed();
      return routeStore.find((r) => r.id === routeId) ?? null;
    },
    enabled: !!routeId,
  });

export const useGetAssignmentsByRoute = ({ routeId }: { routeId?: string }) =>
  useQuery({
    queryKey: [API, 'assignments', routeId],
    queryFn: async () => {
      await mockDelay(140);
      ensureSeed();
      return assignmentStore.filter((a) => a.routeId === routeId);
    },
    enabled: !!routeId,
  });

export const useCreateRoute = () =>
  useAppMutation({
    mutationFn: async (body: Omit<TransportRoute, 'id' | 'createdAt' | 'updatedAt'>) => {
      await mockDelay(220);
      ensureSeed();
      const now = new Date().toISOString();
      const created: TransportRoute = {
        id: `R-${routeStore.length + 1}`,
        createdAt: now,
        updatedAt: now,
        ...body,
      };
      routeStore = [created, ...routeStore];
      return created;
    },
    successMsg: 'Route created successfully',
    errorMsg: 'Failed to create route',
    invalidateQueryKeys: [[API, 'routes']],
  });

export const useUpdateRoute = () =>
  useAppMutation({
    mutationFn: async (body: { id: string } & Partial<Omit<TransportRoute, 'id' | 'createdAt'>>) => {
      await mockDelay(200);
      ensureSeed();
      const current = routeStore.find((r) => r.id === body.id);
      if (!current) throw new Error('Route not found');
      const next: TransportRoute = { ...current, ...body, updatedAt: new Date().toISOString() };
      routeStore = routeStore.map((r) => (r.id === body.id ? next : r));
      return next;
    },
    successMsg: 'Route updated successfully',
    errorMsg: 'Failed to update route',
    invalidateQueryKeys: [[API, 'routes']],
  });

export const useDeleteRoute = () =>
  useAppMutation({
    mutationFn: async (body: { id: string }) => {
      await mockDelay(160);
      ensureSeed();
      routeStore = routeStore.filter((r) => r.id !== body.id);
      assignmentStore = assignmentStore.filter((a) => a.routeId !== body.id);
      return { id: body.id };
    },
    successMsg: 'Route deleted successfully',
    errorMsg: 'Failed to delete route',
    invalidateQueryKeys: [[API, 'routes']],
  });

