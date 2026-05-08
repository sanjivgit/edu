import * as yup from 'yup';

export const createHomeworkSchema = yup.object({
  title: yup.string().trim().required('Title is required'),
  description: yup.string().trim().required('Description is required'),
  classId: yup.string().required('Class is required'),
  section: yup.string().required('Section is required'),
  subject: yup.string().trim().required('Subject is required'),
  assignedDate: yup.string().required('Assigned date is required'),
  dueDate: yup.string().required('Due date is required'),
  attachments: yup.array(yup.string().trim()).default([]).required(),
});

export const updateHomeworkSchema = createHomeworkSchema.shape({
  id: yup.string().required('Homework id is required'),
  status: yup.string().oneOf(['draft', 'assigned', 'closed']).required('Status is required'),
});

export type CreateHomeworkPayload = yup.InferType<typeof createHomeworkSchema>;
export type UpdateHomeworkPayload = yup.InferType<typeof updateHomeworkSchema>;

