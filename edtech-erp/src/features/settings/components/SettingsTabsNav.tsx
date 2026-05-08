import { Building, User, Palette, Bell, Shield, Database } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

const TABS = [
  { id: 'institution', label: 'Institution', icon: Building, to: '/settings/institution' },
  { id: 'profile', label: 'My Profile', icon: User, to: '/settings/profile' },
  { id: 'theme', label: 'Theme', icon: Palette, to: '/settings/theme' },
  { id: 'notifications', label: 'Notifications', icon: Bell, to: '/settings/notifications' },
  { id: 'security', label: 'Security', icon: Shield, to: '/settings/security' },
  { id: 'data', label: 'Data & Backup', icon: Database, to: '/settings/data' },
];

export function SettingsTabsNav() {
  const location = useLocation();
  const active = location.pathname.split('/').pop() ?? 'institution';

  return (
    <Card padding="sm">
      <nav className="space-y-0.5">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <Link
              key={tab.id}
              to={tab.to}
              className={cn(
                'flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left',
                isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </Card>
  );
}

