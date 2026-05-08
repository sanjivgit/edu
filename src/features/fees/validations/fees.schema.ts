import * as yup from 'yup';

export const recordPaymentSchema = yup.object({
  student: yup.string().trim().required('Student roll no / name is required'),
  feeType: yup.string().oneOf(['tuition', 'transport', 'lab', 'library', 'exam']).required('Fee type is required'),
  amount: yup.number().typeError('Amount must be a number').min(1, 'Amount must be at least 1').required('Amount is required'),
  paymentMode: yup.string().oneOf(['cash', 'online', 'cheque', 'dd']).required('Payment mode is required'),
  paymentDate: yup.string().required('Payment date is required'),
  referenceId: yup.string().trim().nullable().default(''),
});

export type RecordPaymentPayload = yup.InferType<typeof recordPaymentSchema>;
