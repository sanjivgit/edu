import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Input';
import { PermissionsMatrix } from './PermissionsMatrix';
import { createRoleSchema, updateRoleSchema, type CreateRolePayload, type UpdateRolePayload } from '../validations/roles.schema';
import type { RolePermission } from '../services/roles.service';

type Mode = 'create' | 'edit';

export function RoleForm({
  mode,
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: {
  mode: Mode;
  defaultValues?: Partial<CreateRolePayload & { id?: string }>;
  onSubmit: (values: CreateRolePayload | UpdateRolePayload, permissions: RolePermission[]) => void;
  isSubmitting?: boolean;
}) {
  const form = useForm<CreateRolePayload | UpdateRolePayload>({
    resolver: yupResolver(mode === 'create' ? createRoleSchema : updateRoleSchema),
    defaultValues: {
      name: '',
      description: '',
      isActive: true,
      permissions: [],
      ...(defaultValues ?? {}),
    } as any,
  });

  const [permissions, setPermissions] = useState<RolePermission[]>(
    (defaultValues?.permissions as RolePermission[] | undefined) ?? []
  );

  const permCount = useMemo(() => permissions.reduce((sum, p) => sum + p.actions.length, 0), [permissions]);
  const errors = form.formState.errors as any;

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Role Name" placeholder="e.g. Librarian" {...form.register('name' as any)} />
          <Input label="Permissions Selected" value={String(permCount)} disabled />
          <Input label="Status" value={form.watch('isActive' as any) ? 'Active' : 'Inactive'} disabled />
        </div>

        <div className="mt-4">
          <Textarea label="Description (optional)" rows={3} placeholder="Role purpose..." {...form.register('description' as any)} />
        </div>

        {(errors?.name?.message || errors?.permissions?.message) && (
          <div className="mt-3 text-sm text-red-600">
            {errors?.name?.message ?? errors?.permissions?.message}
          </div>
        )}
      </Card>

      <PermissionsMatrix value={permissions} onChange={setPermissions} />

      <div className="flex justify-end">
        <Button onClick={form.handleSubmit((v) => onSubmit(v as any, permissions))} isLoading={isSubmitting}>
          {mode === 'create' ? 'Create Role' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}

