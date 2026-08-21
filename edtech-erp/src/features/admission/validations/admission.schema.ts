import * as yup from 'yup';

export const admissionCreateSchema = yup.object({
  academicYearId: yup.string().nullable().optional(),
  firstName: yup.string().trim().required('First name is required'),
  lastName: yup.string().trim().required('Last name is required'),
  dateOfBirth: yup.string().required('Date of birth is required'),
  gender: yup.string().oneOf(['male', 'female', 'other']).required('Gender is required'),
  classApplyingFor: yup.string().required('Class is required'),
  sectionPreference: yup.string().required('Section preference is required'),
  bloodGroup: yup.string().nullable().default(''),
  religion: yup.string().nullable().default(''),
  nationality: yup.string().required('Nationality is required'),
  motherTongue: yup.string().nullable().default(''),
  studentAadhaar: yup.string().nullable().default(''),
  previousSchool: yup.string().nullable().default(''),
  previousGrade: yup.string().nullable().default(''),
  tcNumber: yup.string().nullable().default(''),
  fatherName: yup.string().trim().required('Father name is required'),
  motherName: yup.string().trim().required('Mother name is required'),
  guardianName: yup.string().trim().nullable().default(''),
  relationToStudent: yup.string().nullable().default(''),
  parentPhone: yup
    .string()
    .matches(/^[0-9]{10}$/, 'Enter valid 10-digit phone number')
    .required('Parent phone is required'),
  alternatePhone: yup
    .string()
    .nullable()
    .test('is-valid-alt-phone', 'Enter valid 10-digit phone number', (val) => !val || /^[0-9]{10}$/.test(val)),
  parentEmail: yup.string().email('Invalid email').nullable().default(''),
  annualIncome: yup.number().typeError('Annual income must be a number').min(0).nullable().default(0),
  occupation: yup.string().nullable().default(''),
  addressLine1: yup.string().trim().required('Address line 1 is required'),
  addressLine2: yup.string().nullable().default(''),
  city: yup.string().required('City is required'),
  state: yup.string().required('State is required'),
  country: yup.string().required('Country is required'),
  pincode: yup
    .string()
    .matches(/^[0-9]{6}$/, 'Enter valid 6-digit pincode')
    .required('Pincode is required'),
  medicalConditions: yup.string().nullable().default(''),
  disabilities: yup.string().nullable().default(''),
  emergencyContactName: yup.string().required('Emergency contact name is required'),
  emergencyContactPhone: yup
    .string()
    .matches(/^[0-9]{10}$/, 'Enter valid 10-digit phone number')
    .required('Emergency contact phone is required'),
  transportRequired: yup.boolean().required(),
  hostelRequired: yup.boolean().required(),
});

export const admissionUpdateSchema = admissionCreateSchema.shape({
  id: yup.string().required('Application id is required'),
  status: yup.string().oneOf(['pending', 'approved', 'rejected']).required('Status is required'),
});

export type AdmissionCreatePayload = yup.InferType<typeof admissionCreateSchema>;
export type AdmissionUpdatePayload = yup.InferType<typeof admissionUpdateSchema>;
