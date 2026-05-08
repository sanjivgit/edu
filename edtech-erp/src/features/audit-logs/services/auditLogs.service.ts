import { useQuery } from '@tanstack/react-query';
import { mockDelay } from '@/shared/utils';

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
let auditStore: AuditLogRecord[] = [];

function ensureSeed() {
  if (auditStore.length) return;
  const now = Date.now();
  const iso = (ms: number) => new Date(ms).toISOString();
  auditStore = [
    {
      id: 'LOG-1',
      at: iso(now - 1000 * 60 * 12),
      actor: 'Admin User',
      action: 'CREATE',
      module: 'invoice',
      entity: 'Invoice',
      entityId: 'INV-3',
      ip: '10.0.0.21',
      severity: 'info',
      summary: 'Created invoice INV-2026-0003',
      meta: { amount: 3000, student: 'Riya Singh (012)' },
    },
    {
      id: 'LOG-2',
      at: iso(now - 1000 * 60 * 30),
      actor: 'Teacher',
      action: 'UPDATE',
      module: 'attendance',
      entity: 'AttendanceSession',
      entityId: 'ATT-101',
      ip: '10.0.0.54',
      severity: 'info',
      summary: 'Saved attendance for Class 10-A',
      meta: { present: 15, absent: 2, late: 1 },
    },
    {
      id: 'LOG-3',
      at: iso(now - 1000 * 60 * 55),
      actor: 'System',
      action: 'FAILED_LOGIN',
      module: 'auth',
      entity: 'User',
      entityId: 'unknown',
      ip: '172.16.0.9',
      severity: 'warning',
      summary: 'Failed login attempt detected',
      meta: { email: 'unknown@domain.com' },
    },
    {
      id: 'LOG-4',
      at: iso(now - 1000 * 60 * 90),
      actor: 'Admin User',
      action: 'DELETE',
      module: 'noticeboard',
      entity: 'Notice',
      entityId: 'NTC-9',
      ip: '10.0.0.21',
      severity: 'critical',
      summary: 'Deleted notice NTC-9',
      meta: { reason: 'Duplicate content' },
    },
  ];
}

export const useGetAuditLogs = ({ filters }: { filters: { fromDate?: string; toDate?: string; actor?: string; action?: string; module?: string; severity?: string } }) =>
  useQuery({
    queryKey: [API, 'list', filters],
    queryFn: async () => {
      await mockDelay(180);
      ensureSeed();
      const f = filters ?? {};
      const from = f.fromDate ? new Date(f.fromDate).getTime() : -Infinity;
      const to = f.toDate ? new Date(f.toDate).getTime() + 1000 * 60 * 60 * 24 : Infinity;
      const actor = (f.actor ?? '').toLowerCase();
      const action = (f.action ?? '').toLowerCase();
      const module = (f.module ?? '').toLowerCase();
      const severity = (f.severity ?? '').toLowerCase();

      return auditStore
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
      await mockDelay(120);
      ensureSeed();
      return auditStore.find((l) => l.id === logId) ?? null;
    },
    enabled: !!logId,
  });

