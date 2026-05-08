import { useQuery } from '@tanstack/react-query';
import { useAppMutation } from '@/reactQueryConfig/hooks/useAppMutation';
import { mockDelay } from '@/shared/utils';

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
let roleStore: RoleRecord[] = [];

function ensureSeed() {
  if (roleStore.length) return;
  const now = new Date().toISOString();
  roleStore = [
    {
      id: 'ROLE-1',
      name: 'Admin',
      description: 'Full access to all modules',
      isActive: true,
      permissions: PERMISSION_MODULES.map((m) => ({ module: m.module, actions: [...m.actions] })),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'ROLE-2',
      name: 'Teacher',
      description: 'Academic modules access',
      isActive: true,
      permissions: [
        { module: 'dashboard', actions: ['view'] },
        { module: 'attendance', actions: ['view', 'create', 'edit'] },
        { module: 'timetable', actions: ['view'] },
        { module: 'subjects', actions: ['view'] },
        { module: 'homework', actions: ['view', 'create', 'edit'] },
        { module: 'assessment', actions: ['view', 'create', 'edit'] },
        { module: 'exam', actions: ['view'] },
        { module: 'noticeboard', actions: ['view'] },
        { module: 'notifications', actions: ['view'] },
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'ROLE-3',
      name: 'Accountant',
      description: 'Fees and invoice management',
      isActive: true,
      permissions: [
        { module: 'dashboard', actions: ['view'] },
        { module: 'fees', actions: ['view', 'create', 'edit', 'export'] },
        { module: 'invoice', actions: ['view', 'create', 'edit', 'export'] },
        { module: 'reports', actions: ['view', 'export'] },
      ],
      createdAt: now,
      updatedAt: now,
    },
  ];
}

export const useGetRoles = () =>
  useQuery({
    queryKey: [API, 'list'],
    queryFn: async () => {
      await mockDelay(150);
      ensureSeed();
      return [...roleStore].sort((a, b) => a.name.localeCompare(b.name));
    },
  });

export const useGetRoleById = ({ roleId }: { roleId?: string }) =>
  useQuery({
    queryKey: [API, 'detail', roleId],
    queryFn: async () => {
      await mockDelay(120);
      ensureSeed();
      return roleStore.find((r) => r.id === roleId) ?? null;
    },
    enabled: !!roleId,
  });

export const useCreateRole = () =>
  useAppMutation({
    mutationFn: async (body: Omit<RoleRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
      await mockDelay(220);
      ensureSeed();
      const now = new Date().toISOString();
      const created: RoleRecord = {
        id: `ROLE-${roleStore.length + 1}`,
        createdAt: now,
        updatedAt: now,
        ...body,
      };
      roleStore = [created, ...roleStore];
      return created;
    },
    successMsg: 'Role created successfully',
    errorMsg: 'Failed to create role',
    invalidateQueryKeys: [[API, 'list']],
  });

export const useUpdateRole = () =>
  useAppMutation({
    mutationFn: async (body: { id: string } & Partial<Omit<RoleRecord, 'id' | 'createdAt'>>) => {
      await mockDelay(200);
      ensureSeed();
      const current = roleStore.find((r) => r.id === body.id);
      if (!current) throw new Error('Role not found');
      const next: RoleRecord = { ...current, ...body, updatedAt: new Date().toISOString() };
      roleStore = roleStore.map((r) => (r.id === body.id ? next : r));
      return next;
    },
    successMsg: 'Role updated successfully',
    errorMsg: 'Failed to update role',
    invalidateQueryKeys: [[API, 'list'], [API, 'detail']],
  });

export const useDeleteRole = () =>
  useAppMutation({
    mutationFn: async (body: { id: string }) => {
      await mockDelay(160);
      ensureSeed();
      roleStore = roleStore.filter((r) => r.id !== body.id);
      return { id: body.id };
    },
    successMsg: 'Role deleted successfully',
    errorMsg: 'Failed to delete role',
    invalidateQueryKeys: [[API, 'list']],
  });

