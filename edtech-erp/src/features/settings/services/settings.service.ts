import { useQuery } from '@tanstack/react-query';
import { useAppMutation } from '@/reactQueryConfig/hooks/useAppMutation';
import { mockDelay } from '@/shared/utils';
import type { SettingsPayload } from '../validations/settings.schema';

const API = '/settings';

let settingsStore: SettingsPayload | null = null;

function ensureSeed() {
  if (settingsStore) return;
  settingsStore = {
    institution: {
      name: 'Delhi Public School — Sector 12',
      shortCode: 'DPS-SEC12',
      registrationNo: 'REG/2009/DL/00542',
      type: 'school',
      academicYear: '2024–2025',
      contactEmail: 'admin@dps-sec12.edu.in',
      phone: '+91 11 4567 8900',
      website: 'https://dps-sec12.edu.in',
    },
    profile: {
      fullName: 'Admin User',
      email: 'admin@educore.io',
      phone: '+91 98765 43210',
      language: 'en',
    },
    notifications: {
      feeAlerts: true,
      attendanceAlerts: true,
      homeworkAssignments: true,
      examScheduleUpdates: true,
      noticeboardUpdates: false,
      chatMessages: true,
      systemAlerts: false,
      weeklyDigest: false,
    },
  };
}

export const useGetSettings = () =>
  useQuery({
    queryKey: [API, 'all'],
    queryFn: async () => {
      await mockDelay(120);
      ensureSeed();
      return settingsStore!;
    },
  });

export const useSaveSettings = () =>
  useAppMutation({
    mutationFn: async (body: SettingsPayload) => {
      await mockDelay(200);
      ensureSeed();
      settingsStore = { ...body };
      return settingsStore;
    },
    successMsg: 'Settings updated successfully',
    errorMsg: 'Failed to update settings',
    invalidateQueryKeys: [[API, 'all']],
  });

