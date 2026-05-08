import * as yup from 'yup';

export const institutionSettingsSchema = yup.object({
  name: yup.string().trim().required('Institution name is required'),
  shortCode: yup.string().trim().required('Short code is required'),
  registrationNo: yup.string().trim().required('Registration no is required'),
  type: yup.string().oneOf(['school', 'coaching', 'college']).required('Type is required'),
  academicYear: yup.string().trim().required('Academic year is required'),
  contactEmail: yup.string().email('Invalid email').required('Contact email is required'),
  phone: yup.string().trim().required('Phone is required'),
  website: yup.string().trim().nullable().default(''),
});

export const profileSettingsSchema = yup.object({
  fullName: yup.string().trim().required('Full name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().trim().required('Phone is required'),
  language: yup.string().oneOf(['en', 'hi']).required('Language is required'),
});

export const notificationPrefsSchema = yup.object({
  feeAlerts: yup.boolean().required(),
  attendanceAlerts: yup.boolean().required(),
  homeworkAssignments: yup.boolean().required(),
  examScheduleUpdates: yup.boolean().required(),
  noticeboardUpdates: yup.boolean().required(),
  chatMessages: yup.boolean().required(),
  systemAlerts: yup.boolean().required(),
  weeklyDigest: yup.boolean().required(),
});

export const settingsSchema = yup.object({
  institution: institutionSettingsSchema.required(),
  profile: profileSettingsSchema.required(),
  notifications: notificationPrefsSchema.required(),
});

export type InstitutionSettingsPayload = yup.InferType<typeof institutionSettingsSchema>;
export type ProfileSettingsPayload = yup.InferType<typeof profileSettingsSchema>;
export type NotificationPrefsPayload = yup.InferType<typeof notificationPrefsSchema>;
export type SettingsPayload = yup.InferType<typeof settingsSchema>;

