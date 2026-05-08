import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input, SelectInput } from '@/components/ui/Input';
import { useAuth, useToast } from '@/hooks';
import { profileSettingsSchema, type ProfileSettingsPayload } from '../validations/settings.schema';
import { useSettingsState } from '../hooks/useSettingsState';

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  const { success } = useToast();
  const { draft, setDraft, isReady } = useSettingsState();

  const defaults = useMemo(() => draft?.profile, [draft]);

  const form = useForm<ProfileSettingsPayload>({
    resolver: yupResolver(profileSettingsSchema),
    values: (defaults as ProfileSettingsPayload) ?? undefined,
  });

  if (!isReady) return null;

  const onBlurSync = () => {
    const v = form.getValues();
    setDraft((prev) => (prev ? { ...prev, profile: v } : prev));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-5 mb-6 p-4 bg-muted/30 rounded-xl">
          <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-display font-bold text-xl">
            {user?.name?.charAt(0) ?? 'A'}
          </div>
          <div>
            <p className="font-display font-semibold">{user?.name}</p>
            <p className="text-sm text-muted-foreground capitalize">
              {user?.role} · {user?.email}
            </p>
            <Badge variant="success" dot className="mt-1">
              Active
            </Badge>
          </div>
          <Button size="sm" variant="outline" className="ml-auto" onClick={() => success('Upload', 'Select a photo')}>
            Change Photo
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" onBlur={onBlurSync}>
          <Input label="Full Name" {...form.register('fullName')} />
          <Input label="Email" type="email" {...form.register('email')} />
          <Input label="Phone" {...form.register('phone')} />
          <SelectInput
            label="Language"
            options={[
              { label: 'English', value: 'en' },
              { label: 'Hindi', value: 'hi' },
            ]}
            value={form.watch('language')}
            onChange={(e) => {
              form.setValue('language', e.target.value as ProfileSettingsPayload['language'], { shouldValidate: true });
              onBlurSync();
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

