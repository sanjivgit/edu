import * as yup from 'yup';

export const reportsFilterSchema = yup.object({
  reportType: yup
    .string()
    .oneOf(['attendance', 'fees', 'performance', 'admissions'])
    .required('Report type is required'),
  fromDate: yup.string().required('From date is required'),
  toDate: yup.string().required('To date is required'),
  classId: yup.string().nullable().default(''),
  section: yup.string().nullable().default(''),
});

export type ReportsFilterPayload = yup.InferType<typeof reportsFilterSchema>;

