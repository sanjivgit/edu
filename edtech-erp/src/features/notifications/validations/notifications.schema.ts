import * as yup from 'yup';

export const notificationCreateSchema = yup.object({
  title: yup.string().trim().required('Title is required'),
  message: yup.string().trim().required('Message is required'),
  channel: yup.string().oneOf(['in-app', 'email', 'sms', 'whatsapp']).required('Channel is required'),
  priority: yup.string().oneOf(['low', 'normal', 'high']).required('Priority is required'),
  audience: yup.string().oneOf(['all', 'class', 'staff', 'parents']).required('Audience is required'),
  classId: yup.string().nullable().default(''),
  section: yup.string().nullable().default(''),
  scheduleAt: yup.string().nullable().default(''),
});

export const notificationUpdateSchema = notificationCreateSchema.shape({
  id: yup.string().required('Notification id is required'),
  status: yup.string().oneOf(['queued', 'sent', 'failed', 'cancelled']).required('Status is required'),
});

export type NotificationCreatePayload = yup.InferType<typeof notificationCreateSchema>;
export type NotificationUpdatePayload = yup.InferType<typeof notificationUpdateSchema>;
