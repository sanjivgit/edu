import * as yup from 'yup';

export const createSubjectSchema = yup.object({
  name: yup.string().trim().required('Subject name is required'),
  code: yup.string().trim().required('Subject code is required'),
  category: yup.string().oneOf(['core', 'language', 'elective', 'lab', 'sports', 'arts']).required('Category is required'),
  classId: yup.string().required('Class is required'),
  weeklyPeriods: yup.number().typeError('Weekly periods must be a number').integer().min(0).required('Weekly periods is required'),
  teacher: yup.string().trim().required('Teacher is required'),
  isActive: yup.boolean().required(),
});

export const updateSubjectSchema = createSubjectSchema.shape({
  id: yup.string().required('Subject id is required'),
});

export type CreateSubjectPayload = yup.InferType<typeof createSubjectSchema>;
export type UpdateSubjectPayload = yup.InferType<typeof updateSubjectSchema>;
