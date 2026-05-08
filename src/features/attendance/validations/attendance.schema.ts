import * as yup from 'yup';

export const attendanceFilterSchema = yup.object({
  classId: yup.string().required('Class is required'),
  section: yup.string().required('Section is required'),
  date: yup.string().required('Date is required'),
});

export const attendanceEntrySchema = yup.object({
  studentId: yup.string().required(),
  status: yup.string().oneOf(['present', 'absent', 'late']).required(),
});

export const saveAttendanceSchema = attendanceFilterSchema.shape({
  entries: yup.array(attendanceEntrySchema).min(1).required(),
});

export type AttendanceFilterPayload = yup.InferType<typeof attendanceFilterSchema>;
export type SaveAttendancePayload = yup.InferType<typeof saveAttendanceSchema>;
