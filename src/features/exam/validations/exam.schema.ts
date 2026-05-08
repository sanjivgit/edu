import * as yup from 'yup';

export const examPaperSchema = yup.object({
  subject: yup.string().trim().required('Subject is required'),
  date: yup.string().required('Date is required'),
  startTime: yup.string().required('Start time is required'),
  durationMinutes: yup.number().typeError('Duration must be a number').integer().min(15).required('Duration is required'),
  totalMarks: yup.number().typeError('Total marks must be a number').integer().min(1).required('Total marks is required'),
});

export const examCreateSchema = yup.object({
  name: yup.string().trim().required('Exam name is required'),
  term: yup.string().oneOf(['term-1', 'term-2', 'final']).required('Term is required'),
  classId: yup.string().required('Class is required'),
  section: yup.string().required('Section is required'),
  papers: yup.array(examPaperSchema).min(1, 'Add at least one paper').required(),
  notes: yup.string().nullable().default(''),
});

export const examUpdateSchema = examCreateSchema.shape({
  id: yup.string().required('Exam id is required'),
  status: yup.string().oneOf(['draft', 'scheduled', 'completed']).required('Status is required'),
});

export type ExamCreatePayload = yup.InferType<typeof examCreateSchema>;
export type ExamUpdatePayload = yup.InferType<typeof examUpdateSchema>;

