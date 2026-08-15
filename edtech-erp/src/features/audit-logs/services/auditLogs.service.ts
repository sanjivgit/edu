import { useQuery } from '@tanstack/react-query';
import apiClient, { unwrapApi } from '@/lib/apiClient';
import type { ApiResponse } from '@/types';

export type AuditSeverity = 'info' | 'warning' | 'critical';

export interface AuditLogRecord {
  id: string;
  at: string; // ISO datetime
  actor: string;
  action: string;
  module: string;
  entity?: string;
  entityId?: string;
  ip: string;
  severity: AuditSeverity;
  summary: string;
  meta: Record<string, unknown>;
}

const API = '/audit-logs';

interface BackendAuditLogRaw {
  id: string;
  actor?: string;
  action?: string;
  module?: string;
  entityId?: string | null;
  summary?: string;
  meta?: Record<string, unknown> | null;
  createdAt?: string;
}

interface BackendAuditLog {
  id: string;
  user: string;
  action: string;
  module: string;
  entityId?: string | null;
  description: string;
  metadata?: Record<string, unknown> | null;
  timestamp: string;
  createdAt: string;
}

function toAuditLogRecord(l: BackendAuditLog): AuditLogRecord {
  return {
    id: l.id,
    at: l.timestamp ?? l.createdAt,
    actor: l.user,
    action: l.action,
    module: l.module,
    entityId: l.entityId ?? undefined,
    ip: '',
    severity: 'info',
    summary: l.description,
    meta: l.metadata ?? {},
  };
}

export const useGetAuditLogs = ({ filters }: { filters: { fromDate?: string; toDate?: string; actor?: string; action?: string; module?: string; severity?: string } }) =>
  useQuery({
    queryKey: [API, 'list', filters],
    queryFn: async () => {
      const f = filters ?? {};
      const res = await apiClient
        .get<ApiResponse<{ items: BackendAuditLog[] }>>(API, {
          params: {
            limit: 500,
            ...(f.module ? { module: f.module } : {}),
          },
        })
        .then(unwrapApi);

      const from = f.fromDate ? new Date(f.fromDate).getTime() : -Infinity;
      const to = f.toDate ? new Date(f.toDate).getTime() + 1000 * 60 * 60 * 24 : Infinity;
      const actor = (f.actor ?? '').toLowerCase();
      const action = (f.action ?? '').toLowerCase();
      const module = (f.module ?? '').toLowerCase();
      const severity = (f.severity ?? '').toLowerCase();

      const items = Array.isArray(res) ? res : res?.items ?? [];

      return items
        .map(toAuditLogRecord)
        .filter((l) => {
          const at = new Date(l.at).getTime();
          if (at < from || at > to) return false;
          if (actor && !l.actor.toLowerCase().includes(actor)) return false;
          if (action && !l.action.toLowerCase().includes(action)) return false;
          if (module && !l.module.toLowerCase().includes(module)) return false;
          if (severity && l.severity.toLowerCase() !== severity) return false;
          return true;
        })
        .sort((a, b) => b.at.localeCompare(a.at));
    },
  });

export const useGetAuditLogById = ({ logId }: { logId?: string }) =>
  useQuery({
    queryKey: [API, 'detail', logId],
    queryFn: async () => {
      if (!logId) return null;
      const raw = await apiClient
        .get<ApiResponse<BackendAuditLogRaw>>(`${API}/${logId}`)
        .then(unwrapApi);
      if (!raw) return null;
      return toAuditLogRecord({
        id: raw.id,
        user: raw.actor ?? '',
        action: raw.action ?? '',
        module: raw.module ?? '',
        entityId: raw.entityId,
        description: raw.summary ?? '',
        metadata: raw.meta ?? {},
        timestamp: raw.createdAt ?? '',
        createdAt: raw.createdAt ?? '',
      });
    },
    enabled: !!logId,
  });
