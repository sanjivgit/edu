import * as yup from 'yup';

export const invoiceItemSchema = yup.object({
  description: yup.string().trim().required('Item description is required'),
  quantity: yup.number().typeError('Quantity must be a number').integer().min(1).required('Quantity is required'),
  unitPrice: yup.number().typeError('Unit price must be a number').min(0).required('Unit price is required'),
});

export const createInvoiceSchema = yup.object({
  student: yup.string().trim().required('Student roll no / name is required'),
  classId: yup.string().required('Class is required'),
  section: yup.string().required('Section is required'),
  issueDate: yup.string().required('Issue date is required'),
  dueDate: yup.string().required('Due date is required'),
  items: yup.array(invoiceItemSchema).min(1, 'Add at least one item').required(),
  notes: yup.string().nullable().default(''),
});

export const updateInvoiceSchema = createInvoiceSchema.shape({
  id: yup.string().required('Invoice id is required'),
  status: yup.string().oneOf(['draft', 'issued', 'paid', 'overdue', 'cancelled']).required('Status is required'),
});

export type CreateInvoicePayload = yup.InferType<typeof createInvoiceSchema>;
export type UpdateInvoicePayload = yup.InferType<typeof updateInvoiceSchema>;
