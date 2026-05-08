import * as yup from 'yup';

export const timetableFilterSchema = yup.object({
  classId: yup.string().required('Class is required'),
  section: yup.string().required('Section is required'),
  week: yup.number().integer().min(0).required(),
});

export const timetableAssignSchema = yup.object({
  classId: yup.string().required('Class is required'),
  section: yup.string().required('Section is required'),
  week: yup.number().integer().min(0).required(),
  day: yup.string().oneOf(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']).required('Day is required'),
  periodId: yup.number().integer().min(1).max(10).required('Period is required'),
  subject: yup.string().trim().required('Subject is required'),
  teacher: yup.string().trim().required('Teacher is required'),
});

export type TimetableFilterPayload = yup.InferType<typeof timetableFilterSchema>;
export type TimetableAssignPayload = yup.InferType<typeof timetableAssignSchema>;
