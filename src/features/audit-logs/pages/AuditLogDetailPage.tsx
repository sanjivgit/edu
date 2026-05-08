import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { useGetAuditLogById } from '../services/auditLogs.service';

export default function AuditLogDetailPage() {
  const navigate = useNavigate();
  const { logId } = useParams();
  const detailQuery = useGetAuditLogById({ logId });
  const log = detailQuery.data;

  if (!log) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Audit Log"
          description="Audit log details"
          actions={
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/audit-logs')}>
              Back
            </Button>
          }
        />
        <Card>
          <div className="text-sm text-muted-foreground">{detailQuery.isLoading ? 'Loading...' : 'Log not found.'}</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Log Details"
        description="Audit log details"
        actions={
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/audit-logs')}>
            Back
          </Button>
        }
      />

      <Card className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Time</p>
            <p className="text-sm font-semibold">{new Date(log.at).toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Severity</p>
            <div className="mt-1">
              <StatusBadge status={log.severity} />
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Actor</p>
            <p className="text-sm font-semibold">{log.actor}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">IP</p>
            <p className="text-sm font-semibold font-mono">{log.ip}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Action</p>
            <p className="text-sm font-semibold font-mono">{log.action}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Module</p>
            <p className="text-sm font-semibold font-mono">{log.module}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Entity</p>
            <p className="text-sm font-semibold">{log.entity ?? '-'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Entity ID</p>
            <p className="text-sm font-semibold font-mono">{log.entityId ?? '-'}</p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs text-muted-foreground">Summary</p>
          <p className="text-sm mt-1">{log.summary}</p>
        </div>

        <div className="mt-4">
          <p className="text-xs text-muted-foreground">Meta</p>
          <pre className="mt-2 text-xs bg-muted/30 rounded-xl p-4 overflow-auto border border-border">
{JSON.stringify(log.meta, null, 2)}
          </pre>
        </div>
      </Card>
    </div>
  );
}

