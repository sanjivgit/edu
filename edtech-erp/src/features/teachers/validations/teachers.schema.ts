import * as yup from 'yup';

export const createTeacherSchema = yup.object({
  fullName: yup.string().trim().required('Full name is required'),
  employeeCode: yup.string().trim().required('Employee code is required'),
  subject: yup.string().trim().required('Subject is required'),
  phone: yup.string().matches(/^[0-9]{10}$/, 'Enter valid 10-digit phone number').required('Phone is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  classTeacherOf: yup.string().nullable().default(''),
  status: yup.string().oneOf(['active', 'inactive']).required('Status is required'),
});

export const updateTeacherSchema = createTeacherSchema.shape({
  id: yup.string().required('Teacher id is required'),
});

export type CreateTeacherPayload = yup.InferType<typeof createTeacherSchema>;
export type UpdateTeacherPayload = yup.InferType<typeof updateTeacherSchema>;

