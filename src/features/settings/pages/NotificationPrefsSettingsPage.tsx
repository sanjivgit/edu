import { Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { useSettingsState } from '../hooks/useSettingsState';
import type { NotificationPrefsPayload } from '../validations/settings.schema';

const PREFS: Array<{ key: keyof NotificationPrefsPayload; label: string; desc: string }> = [
  { key: 'feeAlerts', label: 'Fee Payment Alerts', desc: 'When fees are paid or overdue' },
  { key: 'attendanceAlerts', label: 'Attendance Alerts', desc: 'Daily summary and absent notifications' },
  { key: 'homeworkAssignments', label: 'Homework Assignments', desc: 'New homework assigned to your class' },
  { key: 'examScheduleUpdates', label: 'Exam Schedule Updates', desc: 'Changes to exam timetable' },
  { key: 'noticeboardUpdates', label: 'Noticeboard Updates', desc: 'New announcements from administration' },
  { key: 'chatMessages', label: 'Chat Messages', desc: 'New messages from teachers and staff' },
  { key: 'systemAlerts', label: 'System Alerts', desc: 'Critical system notifications' },
  { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Weekly summary email every Monday' },
];

export default function NotificationPrefsSettingsPage() {
  const { draft, setDraft, isReady } = useSettingsState();
  if (!isReady || !draft) return null;

  const toggle = (key: keyof NotificationPrefsPayload) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        notifications: {
          ...prev.notifications,
          [key]: !prev.notifications[key],
        },
      };
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {PREFS.map((p) => {
            const enabled = !!draft.notifications[p.key];
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => toggle(p.key)}
                className="w-full flex items-center justify-between py-3.5 border-b border-border last:border-0 gap-4 text-left"
              >
                <div>
                  <p className="text-sm font-medium">{p.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.desc}</p>
                </div>
                <div className={cn('relative h-5 w-9 rounded-full flex-shrink-0 transition-colors', enabled ? 'bg-primary' : 'bg-muted')}>
                  <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform', enabled ? 'translate-x-4' : 'translate-x-0.5')} />
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

