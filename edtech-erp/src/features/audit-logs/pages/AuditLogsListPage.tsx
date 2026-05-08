import { Download } from 'lucide-react';
import { useMemo } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, SelectInput } from '@/components/ui/Input';
import { useToast } from '@/hooks';
import { AuditLogsTable } from '../components/AuditLogsTable';
import { useGetAuditLogs } from '../services/auditLogs.service';
import { auditLogsFilterSchema, type AuditLogsFilterPayload } from '../validations/auditLogs.schema';

export default function AuditLogsListPage() {
  const navigate = useNavigate();
  const { success } = useToast();

  const form = useForm<AuditLogsFilterPayload>({
    resolver: yupResolver(auditLogsFilterSchema),
    defaultValues: {
      fromDate: '',
      toDate: '',
      actor: '',
      action: '',
      module: '',
      severity: '',
    },
  });

  const fromDate = form.watch('fromDate') ?? '';
  const toDate = form.watch('toDate') ?? '';
  const actor = form.watch('actor') ?? '';
  const action = form.watch('action') ?? '';
  const module = form.watch('module') ?? '';
  const severity = form.watch('severity') ?? '';

  const filters = useMemo(
    () => ({ fromDate, toDate, actor, action, module, severity }),
    [fromDate, toDate, actor, action, module, severity]
  );

  const listQuery = useGetAuditLogs({ filters });
  const data = listQuery.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="View system activity and audit trail"
        actions={
          <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />} onClick={() => success('Export', 'Audit logs export started')}>
            Export
          </Button>
        }
      />

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <Input label="From" type="date" value={fromDate} onChange={(e) => form.setValue('fromDate', e.target.value)} />
          <Input label="To" type="date" value={toDate} onChange={(e) => form.setValue('toDate', e.target.value)} />
          <Input label="Actor" value={actor} onChange={(e) => form.setValue('actor', e.target.value)} placeholder="e.g. Admin" />
          <Input label="Action" value={action} onChange={(e) => form.setValue('action', e.target.value)} placeholder="e.g. UPDATE" />
          <Input label="Module" value={module} onChange={(e) => form.setValue('module', e.target.value)} placeholder="e.g. fees" />
          <SelectInput
            label="Severity"
            options={[
              { label: 'All', value: '' },
              { label: 'Info', value: 'info' },
              { label: 'Warning', value: 'warning' },
              { label: 'Critical', value: 'critical' },
            ]}
            value={severity}
            onChange={(e) => form.setValue('severity', e.target.value as any)}
          />
        </div>
      </Card>

      <AuditLogsTable
        data={data}
        isLoading={listQuery.isLoading}
        onView={(row) => navigate(`/audit-logs/${row.id}`)}
      />
    </div>
  );
}

