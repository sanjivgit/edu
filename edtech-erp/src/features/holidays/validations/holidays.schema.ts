import * as yup from 'yup';

export const holidayCreateSchema = yup.object({
  title: yup.string().trim().required('Title is required'),
  type: yup.string().oneOf(['holiday', 'event', 'exam', 'closure']).required('Type is required'),
  startDate: yup.string().required('Start date is required'),
  endDate: yup.string().required('End date is required'),
  isFullDay: yup.boolean().required(),
  description: yup.string().nullable().default(''),
  appliesTo: yup.string().oneOf(['all', 'students', 'staff']).required('Applies to is required'),
});

export const holidayUpdateSchema = holidayCreateSchema.shape({
  id: yup.string().required('Holiday id is required'),
  status: yup.string().oneOf(['planned', 'announced', 'cancelled']).required('Status is required'),
});

export type HolidayCreatePayload = yup.InferType<typeof holidayCreateSchema>;
export type HolidayUpdatePayload = yup.InferType<typeof holidayUpdateSchema>;

