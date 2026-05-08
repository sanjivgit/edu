import * as yup from 'yup';

export const classCreateSchema = yup.object({
  name: yup.string().trim().required('Class name is required'),
  code: yup.string().trim().required('Class code is required'),
  classTeacher: yup.string().trim().required('Class teacher is required'),
  sections: yup
    .number()
    .typeError('Sections must be a number')
    .min(1, 'At least 1 section is required')
    .required('Sections count is required'),
  capacity: yup
    .number()
    .typeError('Capacity must be a number')
    .min(1, 'Capacity should be greater than zero')
    .required('Capacity is required'),
});

export const classUpdateSchema = yup.object({
  id: yup.string().trim().required('Class id is required'),
  name: yup.string().trim().required('Class name is required'),
  code: yup.string().trim().required('Class code is required'),
  classTeacher: yup.string().trim().required('Class teacher is required'),
  sections: yup.number().typeError('Sections must be a number').min(1).required(),
  capacity: yup.number().typeError('Capacity must be a number').min(1).required(),
  status: yup.string().oneOf(['active', 'inactive']).required('Status is required'),
});

export const sectionCreateSchema = yup.object({
  classId: yup.string().trim().required('Class is required'),
  name: yup.string().trim().required('Section name is required'),
  roomNo: yup.string().trim().nullable().default(''),
  sectionTeacher: yup.string().trim().required('Section teacher is required'),
  students: yup
    .number()
    .typeError('Students must be a number')
    .min(0, 'Students cannot be negative')
    .required('Students count is required'),
});

export const sectionUpdateSchema = yup.object({
  id: yup.string().trim().required('Section id is required'),
  classId: yup.string().trim().required('Class is required'),
  name: yup.string().trim().required('Section name is required'),
  roomNo: yup.string().trim().nullable().default(''),
  sectionTeacher: yup.string().trim().required('Section teacher is required'),
  students: yup.number().typeError('Students must be a number').min(0).required(),
  status: yup.string().oneOf(['active', 'inactive']).required('Status is required'),
});

export type ClassCreatePayload = yup.InferType<typeof classCreateSchema>;
export type ClassUpdatePayload = yup.InferType<typeof classUpdateSchema>;
export type SectionCreatePayload = yup.InferType<typeof sectionCreateSchema>;
export type SectionUpdatePayload = yup.InferType<typeof sectionUpdateSchema>;
