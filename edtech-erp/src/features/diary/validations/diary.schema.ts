import * as yup from 'yup';

export const diaryCreateSchema = yup.object({
  date: yup.string().required('Date is required'),
  classId: yup.string().required('Class is required'),
  section: yup.string().required('Section is required'),
  subject: yup.string().trim().required('Subject is required'),
  author: yup.string().trim().required('Author is required'),
  title: yup.string().trim().required('Title is required'),
  content: yup.string().trim().required('Content is required'),
  visibility: yup.string().oneOf(['students', 'parents', 'both']).required('Visibility is required'),
  tags: yup.array(yup.string().trim()).default([]).required(),
});

export const diaryUpdateSchema = diaryCreateSchema.shape({
  id: yup.string().required('Diary entry id is required'),
  status: yup.string().oneOf(['draft', 'published']).required('Status is required'),
});

export type DiaryCreatePayload = yup.InferType<typeof diaryCreateSchema>;
export type DiaryUpdatePayload = yup.InferType<typeof diaryUpdateSchema>;

