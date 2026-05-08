import * as yup from 'yup';

export const auditLogsFilterSchema = yup.object({
  fromDate: yup.string().nullable().default(''),
  toDate: yup.string().nullable().default(''),
  actor: yup.string().nullable().default(''),
  action: yup.string().nullable().default(''),
  module: yup.string().nullable().default(''),
  severity: yup.string().oneOf(['', 'info', 'warning', 'critical']).default(''),
});

export type AuditLogsFilterPayload = yup.InferType<typeof auditLogsFilterSchema>;

