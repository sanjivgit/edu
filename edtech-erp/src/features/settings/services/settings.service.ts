import { useQuery } from '@tanstack/react-query';
import apiClient, { unwrapApi } from '@/lib/apiClient';
import type { ApiResponse } from '@/types';
import { useAppSelector } from '@/hooks/useAppDispatch';
import { useAppMutation } from '@/reactQueryConfig/hooks/useAppMutation';
import type { SettingsPayload } from '../validations/settings.schema';

const API = '/settings';

interface BackendSystem {
  institution?: {
    institutionName?: string;
    shortCode?: string;
    registrationNo?: string;
    institutionType?: string;
    academicYearId?: string | null;
    contactEmail?: string;
    phone?: string;
    website?: string;
  };
  profile?: { fullName?: string };
  notifications?: Record<string, boolean>;
  systemConfig?: Record<string, unknown>;
}

const NOTIF_KEYS = [
  'feeAlerts',
  'attendanceAlerts',
  'homeworkAssignments',
  'examScheduleUpdates',
  'noticeboardUpdates',
  'chatMessages',
  'systemAlerts',
  'weeklyDigest',
] as const;

function toSettingsPayload(b: BackendSystem, user: { name?: string; email?: string; phone?: string } | null): SettingsPayload {
  const inst = b.institution ?? {};
  const notif = b.notifications ?? {};
  const notifications = {} as Record<string, boolean>;
  for (const key of NOTIF_KEYS) notifications[key] = !!notif[key];
  return {
    institution: {
      name: inst.institutionName ?? '',
      shortCode: inst.shortCode ?? '',
      registrationNo: inst.registrationNo ?? '',
      type: (inst.institutionType as SettingsPayload['institution']['type']) ?? 'school',
      academicYear: inst.academicYearId ?? '',
      contactEmail: inst.contactEmail ?? '',
      phone: inst.phone ?? '',
      website: inst.website ?? '',
    },
    profile: {
      fullName: b.profile?.fullName ?? user?.name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      language: 'en',
    },
    notifications: notifications as SettingsPayload['notifications'],
  };
}

export const useGetSettings = () => {
  const user = useAppSelector((s) => s.auth.user);
  return useQuery({
    queryKey: [API, 'system'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<BackendSystem>>(`${API}/system`).then(unwrapApi);
      return toSettingsPayload(res ?? {}, user);
    },
  });
};

export const useSaveSettings = () =>
  useAppMutation<SettingsPayload, SettingsPayload>({
    mutationFn: async (body) => {
      const saved = await apiClient
        .put<ApiResponse<BackendSystem>>(`${API}/system`, {
          institution: {
            institutionName: body.institution.name,
            shortCode: body.institution.shortCode,
            registrationNo: body.institution.registrationNo,
            institutionType: body.institution.type,
            contactEmail: body.institution.contactEmail,
            phone: body.institution.phone,
            website: body.institution.website,
          },
          notifications: body.notifications,
        })
        .then(unwrapApi);
      return toSettingsPayload(saved ?? {}, null);
    },
    successMsg: 'Settings updated successfully',
    errorMsg: 'Failed to update settings',
    invalidateQueryKeys: [[API, 'system']],
  });
