import * as yup from 'yup';

export const rolePermissionSchema = yup.object({
  module: yup.string().trim().required(),
  actions: yup.array(yup.string().trim()).min(1).required(),
});

export const createRoleSchema = yup.object({
  name: yup.string().trim().required('Role name is required'),
  description: yup.string().nullable().default(''),
  isActive: yup.boolean().required(),
  permissions: yup.array(rolePermissionSchema).min(1, 'Select at least one permission').required(),
});

export const updateRoleSchema = createRoleSchema.shape({
  id: yup.string().required('Role id is required'),
});

export type CreateRolePayload = yup.InferType<typeof createRoleSchema>;
export type UpdateRolePayload = yup.InferType<typeof updateRoleSchema>;

