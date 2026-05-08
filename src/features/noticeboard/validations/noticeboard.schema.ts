import * as yup from 'yup';

export const noticeAudienceSchema = yup.object({
  scope: yup.string().oneOf(['all', 'class', 'staff', 'parents']).required('Audience is required'),
  classId: yup.string().nullable().default(''),
  section: yup.string().nullable().default(''),
});

export const noticeCreateSchema = yup.object({
  title: yup.string().trim().required('Title is required'),
  message: yup.string().trim().required('Message is required'),
  category: yup.string().oneOf(['general', 'academic', 'event', 'urgent']).required('Category is required'),
  publishAt: yup.string().required('Publish date is required'),
  expireAt: yup.string().nullable().default(''),
  audience: noticeAudienceSchema.required(),
  status: yup.string().oneOf(['draft', 'published']).required(),
});

export const noticeUpdateSchema = noticeCreateSchema.shape({
  id: yup.string().required('Notice id is required'),
});

export type NoticeCreatePayload = yup.InferType<typeof noticeCreateSchema>;
export type NoticeUpdatePayload = yup.InferType<typeof noticeUpdateSchema>;
