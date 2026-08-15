import { describe, it, expect } from 'vitest';
import { waitFor } from '@testing-library/react';
import { renderHookWithProviders } from '@/test/utils';
import { useGetAuditLogs, useGetAuditLogById } from '@/features/audit-logs/services/auditLogs.service';

describe('audit-logs integration', () => {
  it('loads the audit log list, mapped to records and sorted newest first', async () => {
    const { result } = renderHookWithProviders(() => useGetAuditLogs({ filters: {} }));

    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 });

    const logs = result.current.data ?? [];
    expect(logs.length).toBeGreaterThanOrEqual(2);
    expect(logs[0].id).toBe('log-2');
    expect(logs[0]).toMatchObject({
      actor: 'Teacher One',
      action: 'CREATE',
      module: 'homework',
      summary: 'Created homework assignment',
      severity: 'info',
      ip: '',
    });
    expect(new Date(logs[0].at).getTime()).toBeGreaterThanOrEqual(new Date(logs[1].at).getTime());
  });

  it('filters the list client-side by date range', async () => {
    const { result } = renderHookWithProviders(() =>
      useGetAuditLogs({ filters: { fromDate: '2024-06-02' } })
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 });

    const logs = result.current.data ?? [];
    expect(logs).toHaveLength(1);
    expect(logs[0].id).toBe('log-2');
  });

  it('filters the list client-side by actor and module', async () => {
    const { result } = renderHookWithProviders(() =>
      useGetAuditLogs({ filters: { actor: 'teacher', module: 'homework' } })
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 });

    const logs = result.current.data ?? [];
    expect(logs).toHaveLength(1);
    expect(logs[0].actor).toBe('Teacher One');
  });

  it('maps the raw audit-log detail shape (actor/summary/meta/createdAt)', async () => {
    const { result } = renderHookWithProviders(() => useGetAuditLogById({ logId: 'log-9' }));

    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 });

    const log = result.current.data;
    expect(log).not.toBeNull();
    expect(log).toMatchObject({
      id: 'log-9',
      actor: 'Teacher One',
      action: 'CREATE',
      module: 'homework',
      entityId: 'hw-42',
      summary: 'Created homework assignment',
    });
    expect(log?.meta).toEqual({ priority: 'high' });
    expect(log?.at).toBe('2024-06-02T12:00:00.000Z');
  });
});
