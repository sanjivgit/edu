import { useQuery } from '@tanstack/react-query';
import { useAppMutation } from '@/reactQueryConfig/hooks/useAppMutation';
import { mockDelay } from '@/shared/utils';

export type AdmissionStatus = 'pending' | 'approved' | 'rejected';

export interface AdmissionRecord {
  id: string;
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
  status: any;
  appliedDate: string;
}

const API = '/admissions';

let admissionStore: AdmissionRecord[] = Array.from({ length: 20 }, (_, idx) => ({
  id: `ADM-${1000 + idx}`,
  firstName: ['Aarav', 'Priya', 'Riya', 'Arjun', 'Sneha', 'Rahul', 'Kavya', 'Vikram'][idx % 8],
  lastName: ['Sharma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Verma', 'Nair', 'Mehta'][idx % 8],
  dateOfBirth: new Date(2013, idx % 12, (idx % 27) + 1).toISOString().split('T')[0],
  gender: idx % 2 === 0 ? 'male' : 'female',
  classApplyingFor: `Class ${(idx % 10) + 1}`,
  sectionPreference: ['A', 'B', 'C'][idx % 3],
  nationality: 'Indian',
  fatherName: `Father ${idx + 1}`,
  motherName: `Mother ${idx + 1}`,
  parentPhone: `98${String(10000000 + idx * 1723).slice(0, 8)}`,
  parentEmail: `parent${idx + 1}@mail.com`,
  addressLine1: `House ${idx + 20}, Main Road`,
  city: 'Ahmedabad',
  state: 'Gujarat',
  country: 'India',
  pincode: '380001',
  emergencyContactName: `Guardian ${idx + 1}`,
  emergencyContactPhone: `97${String(10000000 + idx * 1399).slice(0, 8)}`,
  transportRequired: idx % 2 === 0,
  hostelRequired: false,
  status: ['pending', 'approved', 'rejected', 'pending'][idx % 4],
  appliedDate: new Date(2026, 1, (idx % 28) + 1).toISOString().split('T')[0],
}));

export const useGetAdmissions = () =>
  useQuery({
    queryKey: [API, 'list'],
    queryFn: async () => {
      await mockDelay(200);
      return [...admissionStore];
    },
  });

export const useGetAdmissionById = ({ admissionId }: { admissionId?: string }) =>
  useQuery({
    queryKey: [API, admissionId],
    queryFn: async () => {
      await mockDelay(120);
      return admissionStore.find((item) => item.id === admissionId) ?? null;
    },
    enabled: !!admissionId,
  });

export const useAddAdmission = () =>
  useAppMutation({
    mutationFn: async (body: Omit<AdmissionRecord, 'id' | 'status' | 'appliedDate'>) => {
      await mockDelay(200);
      const created: AdmissionRecord = {
        ...body,
        id: `ADM-${1000 + admissionStore.length}`,
        status: 'pending',
        appliedDate: new Date().toISOString().split('T')[0],
      };
      admissionStore = [...admissionStore, created];
      return created;
    },
    successMsg: 'Admission application created successfully',
    errorMsg: 'Failed to create admission application',
    invalidateQueryKeys: [[API, 'list']],
  });

export const useEditAdmission = () =>
  useAppMutation({
    mutationFn: async (body: { admissionId: string; payload: Omit<AdmissionRecord, 'id' | 'appliedDate'> }) => {
      await mockDelay(200);
      admissionStore = admissionStore.map((item) =>
        item.id === body.admissionId
          ? { ...item, ...body.payload }
          : item
      );
      return admissionStore.find((item) => item.id === body.admissionId)!;
    },
    successMsg: 'Admission application updated successfully',
    errorMsg: 'Failed to update admission application',
    invalidateQueryKeys: [[API, 'list']],
  });

export const useDeleteAdmission = () =>
  useAppMutation({
    mutationFn: async (admissionId: string) => {
      await mockDelay(180);
      admissionStore = admissionStore.filter((item) => item.id !== admissionId);
      return { id: admissionId };
    },
    successMsg: 'Admission application deleted successfully',
    errorMsg: 'Failed to delete admission application',
    invalidateQueryKeys: [[API, 'list']],
  });

export const useUpdateAdmissionStatus = () =>
  useAppMutation({
    mutationFn: async (body: { admissionId: string; status: AdmissionStatus }) => {
      await mockDelay(120);
      admissionStore = admissionStore.map((item) =>
        item.id === body.admissionId ? { ...item, status: body.status } : item
      );
      return admissionStore.find((item) => item.id === body.admissionId)!;
    },
    successMsg: 'Application status updated',
    errorMsg: 'Failed to update application status',
    invalidateQueryKeys: [[API, 'list']],
  });
