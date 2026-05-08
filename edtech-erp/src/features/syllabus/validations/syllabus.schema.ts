import * as yup from 'yup';

export const syllabusAttachmentSchema = yup.object({
  name: yup.string().trim().required('Attachment name is required'),
  url: yup.string().trim().required('Attachment URL is required'),
});

export const createSyllabusSchema = yup.object({
  title: yup.string().trim().required('Title is required'),
  classId: yup.string().required('Class is required'),
  section: yup.string().required('Section is required'),
  subject: yup.string().trim().required('Subject is required'),
  term: yup.string().oneOf(['term-1', 'term-2', 'final']).required('Term is required'),
  description: yup.string().nullable().default(''),
  attachments: yup.array(syllabusAttachmentSchema).default([]).required(),
  status: yup.string().oneOf(['draft', 'published']).required('Status is required'),
});

export const updateSyllabusSchema = createSyllabusSchema.shape({
  id: yup.string().required('Syllabus id is required'),
});

export type CreateSyllabusPayload = yup.InferType<typeof createSyllabusSchema>;
export type UpdateSyllabusPayload = yup.InferType<typeof updateSyllabusSchema>;
export type SyllabusAttachmentPayload = yup.InferType<typeof syllabusAttachmentSchema>;

