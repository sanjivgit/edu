import * as yup from 'yup';

export const createStudentSchema = yup.object({
  rollNo: yup.string().trim().required('Roll No is required'),
  name: yup.string().trim().required('Student name is required'),
  email: yup.string().email('Invalid email').nullable(),
  phone: yup
    .string()
    .matches(/^[0-9]{10}$/, 'Enter valid 10-digit phone number')
    .nullable(),
  dob: yup.string().nullable(),
  gender: yup.string().oneOf(['male', 'female', 'other']).required('Gender is required'),
  address: yup.string().nullable(),
  admissionDate: yup.string().nullable(),
  status: yup.string().oneOf(['active', 'inactive', 'transferred']).required('Status is required'),
  classId: yup.string().trim().required('Class is required'),
  section: yup.string().trim().required('Section is required'),
  currentAcademicYearId: yup.string().nullable().optional(),
});

export const updateStudentSchema = createStudentSchema.shape({
  id: yup.string().required('Student id is required'),
});

export type CreateStudentPayload = yup.InferType<typeof createStudentSchema>;
export type UpdateStudentPayload = yup.InferType<typeof updateStudentSchema>;
