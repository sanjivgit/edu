import * as yup from 'yup';

export const assessmentCreateSchema = yup.object({
  academicYearId: yup.string().nullable().optional(),
  title: yup.string().trim().required('Title is required'),
  type: yup.string().oneOf(['quiz', 'assignment', 'unit-test', 'project']).required('Type is required'),
  classId: yup.string().required('Class is required'),
  section: yup.string().required('Section is required'),
  subject: yup.string().trim().required('Subject is required'),
  totalMarks: yup.number().typeError('Total marks must be a number').integer().min(1).required('Total marks is required'),
  date: yup.string().required('Date is required'),
  instructions: yup.string().nullable().default(''),
});

export const assessmentUpdateSchema = assessmentCreateSchema.shape({
  id: yup.string().required('Assessment id is required'),
  status: yup.string().oneOf(['draft', 'published', 'closed']).required('Status is required'),
});

export type AssessmentCreatePayload = yup.InferType<typeof assessmentCreateSchema>;
export type AssessmentUpdatePayload = yup.InferType<typeof assessmentUpdateSchema>;

