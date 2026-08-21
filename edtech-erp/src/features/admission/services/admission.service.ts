import { useQuery } from '@tanstack/react-query';
import apiClient, { unwrapApi } from '@/lib/apiClient';
import type { ApiResponse } from '@/types';
import { useAppMutation } from '@/reactQueryConfig/hooks/useAppMutation';

export type AdmissionStatus = 'pending' | 'approved' | 'rejected';

export interface AdmissionRecord {
  id: string;
  academicYearId?: string | null;
  academicYearName?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  classApplyingFor: string;
  sectionPreference: string;
  bloodGroup?: string;
  religion?: string;
  nationality: string;
  motherTongue?: string;
  studentAadhaar?: string;
  previousSchool?: string;
  previousGrade?: string;
  tcNumber?: string;
  fatherName: string;
  motherName: string;
  guardianName?: string;
  relationToStudent?: string;
  parentPhone: string;
  alternatePhone?: string;
  parentEmail?: string;
  annualIncome?: number;
  occupation?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  medicalConditions?: string;
  disabilities?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  transportRequired: boolean;
  hostelRequired: boolean;
  status: AdmissionStatus;
  appliedDate: string;
}

const API = '/admissions';

type BackendAdmission = Omit<AdmissionRecord, 'annualIncome'> & {
  annualIncome?: string | number | null;
  academicYear?: { id: string; name: string } | null;
  [key: string]: unknown;
};

function toAdmissionRecord(a: BackendAdmission): AdmissionRecord {
  const annualIncome = a.annualIncome;
  return {
    ...(a as unknown as AdmissionRecord),
    annualIncome: annualIncome == null || annualIncome === '' ? undefined : Number(annualIncome),
    gender: a.gender ?? 'male',
    country: a.country ?? 'India',
    academicYearId: a.academicYearId ?? a.academicYear?.id ?? null,
    academicYearName: a.academicYear?.name ?? '',
  };
}

export const useGetAdmissions = () =>
  useQuery({
    queryKey: [API, 'list'],
    queryFn: async () => {
      const res = await apiClient
        .get<ApiResponse<BackendAdmission[]>>('/admissions', { params: { limit: 500 } })
        .then(unwrapApi);
      return (res ?? []).map(toAdmissionRecord);
    },
  });

export const useGetAdmissionById = ({ admissionId }: { admissionId?: string }) =>
  useQuery({
    queryKey: [API, admissionId],
    queryFn: async () => {
      if (!admissionId) return null;
      const a = await apiClient.get<ApiResponse<BackendAdmission>>(`/admissions/${admissionId}`).then(unwrapApi);
      return toAdmissionRecord(a);
    },
    enabled: !!admissionId,
  });

export const useAddAdmission = () =>
  useAppMutation<AdmissionRecord, Omit<AdmissionRecord, 'id' | 'status' | 'appliedDate'>>({
    mutationFn: async (body) => {
      const payload: Record<string, unknown> = { ...body };
      Object.keys(payload).forEach((key) => {
        if (payload[key] === '') payload[key] = undefined;
      });
      const created = await apiClient
        .post<ApiResponse<BackendAdmission>>('/admissions', payload)
        .then(unwrapApi);
      return toAdmissionRecord(created);
    },
    successMsg: 'Admission application created successfully',
    errorMsg: 'Failed to create admission application',
    invalidateQueryKeys: [[API, 'list']],
  });

export const useEditAdmission = () =>
  useAppMutation<AdmissionRecord, { admissionId: string; payload: Omit<AdmissionRecord, 'id' | 'appliedDate'> }>({
    mutationFn: async ({ admissionId, payload }) => {
      const body: Record<string, unknown> = { ...payload };
      Object.keys(body).forEach((key) => {
        if (body[key] === '') body[key] = undefined;
      });
      const updated = await apiClient
        .put<ApiResponse<BackendAdmission>>(`/admissions/${admissionId}`, body)
        .then(unwrapApi);
      return toAdmissionRecord(updated);
    },
    successMsg: 'Admission application updated successfully',
    errorMsg: 'Failed to update admission application',
    invalidateQueryKeys: [[API, 'list']],
  });

export const useDeleteAdmission = () =>
  useAppMutation<{ id: string }, string>({
    mutationFn: async (admissionId: string) => {
      await apiClient.delete(`/admissions/${admissionId}`);
      return { id: admissionId };
    },
    successMsg: 'Admission application deleted successfully',
    errorMsg: 'Failed to delete admission application',
    invalidateQueryKeys: [[API, 'list']],
  });

export const useUpdateAdmissionStatus = () =>
  useAppMutation<AdmissionRecord, { admissionId: string; status: AdmissionStatus }>({
    mutationFn: async ({ admissionId, status }) => {
      const updated = await apiClient
        .patch<ApiResponse<BackendAdmission>>(`/admissions/${admissionId}/status`, { status })
        .then(unwrapApi);
      return toAdmissionRecord(updated);
    },
    successMsg: 'Application status updated',
    errorMsg: 'Failed to update application status',
    invalidateQueryKeys: [[API, 'list']],
  });
