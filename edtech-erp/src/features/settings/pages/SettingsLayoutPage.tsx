import { Save } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks';
import { SettingsTabsNav } from '../components/SettingsTabsNav';
import { useSettingsState } from '../hooks/useSettingsState';
import { useSaveSettings } from '../services/settings.service';

export default function SettingsLayoutPage() {
  const { success } = useToast();
  const { draft } = useSettingsState();
  const saveMutation = useSaveSettings();

  const onSave = () => {
    if (!draft) return;
    saveMutation.mutate(draft, {
      onSuccess: () => success('Saved', 'Settings updated successfully'),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Configure institution, profile, and system preferences"
        actions={
          <Button leftIcon={<Save className="h-4 w-4" />} onClick={onSave} isLoading={saveMutation.isPending}>
            Save Changes
          </Button>
        }
      />
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-52 flex-shrink-0">
          <SettingsTabsNav />
        </div>
        <div className="flex-1 min-w-0 space-y-5">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

