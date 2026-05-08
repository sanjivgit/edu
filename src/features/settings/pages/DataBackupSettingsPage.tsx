import { Database } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks';

export default function DataBackupSettingsPage() {
  const { success } = useToast();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data & Backup</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Database className="h-7 w-7 text-primary/60" />
          </div>
          <p className="font-display font-semibold">Data Management</p>
          <p className="text-sm text-muted-foreground max-w-xs">Export data, schedule backups, and manage retention policies.</p>
          <Button size="sm" variant="outline" className="mt-1" onClick={() => success('Coming Soon', 'Feature under development')}>
            Configure
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

