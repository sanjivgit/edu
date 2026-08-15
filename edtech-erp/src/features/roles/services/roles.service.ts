import { useQuery } from '@tanstack/react-query';
import apiClient, { unwrapApi } from '@/lib/apiClient';
import type { ApiResponse } from '@/types';
import { useAppMutation } from '@/reactQueryConfig/hooks/useAppMutation';

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'export';

export interface RolePermission {
  module: string;
  actions: PermissionAction[];
}

export interface RoleRecord {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  permissions: RolePermission[];
  createdAt: string;
  updatedAt: string;
}

export const PERMISSION_MODULES: Array<{ module: string; label: string; actions: PermissionAction[] }> = [
  { module: 'dashboard', label: 'Dashboard', actions: ['view'] },
  { module: 'classes', label: 'Classes', actions: ['view', 'create', 'edit', 'delete'] },
  { module: 'admission', label: 'Admissions', actions: ['view', 'create', 'edit', 'delete', 'approve', 'export'] },
  { module: 'fees', label: 'Fees', actions: ['view', 'create', 'edit', 'export'] },
  { module: 'invoice', label: 'Invoices', actions: ['view', 'create', 'edit', 'delete', 'export'] },
  { module: 'attendance', label: 'Attendance', actions: ['view', 'create', 'edit', 'export'] },
  { module: 'timetable', label: 'Timetable', actions: ['view', 'create', 'edit', 'export'] },
  { module: 'subjects', label: 'Subjects', actions: ['view', 'create', 'edit', 'delete'] },
  { module: 'homework', label: 'Homework', actions: ['view', 'create', 'edit', 'delete'] },
  { module: 'assessment', label: 'Assessments', actions: ['view', 'create', 'edit', 'delete', 'export'] },
  { module: 'exam', label: 'Exams', actions: ['view', 'create', 'edit', 'delete', 'export'] },
  { module: 'noticeboard', label: 'Noticeboard', actions: ['view', 'create', 'edit', 'delete', 'export'] },
  { module: 'notifications', label: 'Notifications', actions: ['view', 'create', 'edit', 'delete', 'export'] },
  { module: 'reports', label: 'Reports', actions: ['view', 'export'] },
  { module: 'settings', label: 'Settings', actions: ['view', 'edit'] },
  { module: 'roles', label: 'Roles & Permissions', actions: ['view', 'create', 'edit', 'delete'] },
];

const API = '/roles';

interface BackendRole {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  permissions: RolePermission[];
  createdAt: string;
  updatedAt: string;
}

function toRoleRecord(r: BackendRole): RoleRecord {
  return {
    id: r.id,
    name: r.name,
    description: r.description ?? '',
    isActive: r.isActive,
    permissions: r.permissions ?? [],
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

export const useGetRoles = () =>
  useQuery({
    queryKey: [API, 'list'],
    queryFn: async () => {
      const res = await apiClient
        .get<ApiResponse<{ items: BackendRole[] }>>(API, { params: { limit: 500 } })
        .then(unwrapApi);
      return (res?.items ?? []).map(toRoleRecord).sort((a, b) => a.name.localeCompare(b.name));
    },
  });

export const useGetRoleById = ({ roleId }: { roleId?: string }) =>
  useQuery({
    queryKey: [API, 'detail', roleId],
    queryFn: async () => {
      if (!roleId) return null;
      const r = await apiClient.get<ApiResponse<BackendRole>>(`${API}/${roleId}`).then(unwrapApi);
      return r ? toRoleRecord(r) : null;
    },
    enabled: !!roleId,
  });

export const useCreateRole = () =>
  useAppMutation<
    RoleRecord,
    Omit<RoleRecord, 'id' | 'createdAt' | 'updatedAt'>
  >({
    mutationFn: async (body) => {
      const created = await apiClient
        .post<ApiResponse<BackendRole>>(API, {
          name: body.name,
          description: body.description ?? '',
          isActive: body.isActive,
          permissions: body.permissions,
        })
        .then(unwrapApi);
      return toRoleRecord(created);
    },
    successMsg: 'Role created successfully',
    errorMsg: 'Failed to create role',
    invalidateQueryKeys: [[API, 'list']],
  });

export const useUpdateRole = () =>
  useAppMutation<
    RoleRecord,
    { id: string } & Partial<Omit<RoleRecord, 'id' | 'createdAt'>>
  >({
    mutationFn: async (body) => {
      const updated = await apiClient
        .put<ApiResponse<BackendRole>>(`${API}/${body.id}`, {
          name: body.name,
          description: body.description ?? '',
          isActive: body.isActive,
          permissions: body.permissions ?? [],
        })
        .then(unwrapApi);
      return toRoleRecord(updated);
    },
    successMsg: 'Role updated successfully',
    errorMsg: 'Failed to update role',
    invalidateQueryKeys: [[API, 'list'], [API, 'detail']],
  });

export const useDeleteRole = () =>
  useAppMutation<{ id: string }, { id: string }>({
    mutationFn: async (body) => {
      await apiClient.delete(`${API}/${body.id}`);
      return { id: body.id };
    },
    successMsg: 'Role deleted successfully',
    errorMsg: 'Failed to delete role',
    invalidateQueryKeys: [[API, 'list']],
  });
