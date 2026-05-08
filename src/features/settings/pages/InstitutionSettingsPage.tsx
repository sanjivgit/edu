import { Upload } from 'lucide-react';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input, SelectInput } from '@/components/ui/Input';
import { useToast } from '@/hooks';
import { institutionSettingsSchema, type InstitutionSettingsPayload } from '../validations/settings.schema';
import { useSettingsState } from '../hooks/useSettingsState';

export default function InstitutionSettingsPage() {
  const { success } = useToast();
  const { draft, setDraft, isReady } = useSettingsState();

  const defaults = useMemo(() => draft?.institution, [draft]);

  const form = useForm<InstitutionSettingsPayload>({
    resolver: yupResolver(institutionSettingsSchema),
    values: (defaults as InstitutionSettingsPayload) ?? undefined,
  });

  if (!isReady) return null;

  const onBlurSync = () => {
    const v = form.getValues();
    setDraft((prev) => (prev ? { ...prev, institution: v } : prev));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Institution Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" onBlur={onBlurSync}>
          <Input label="Institution Name" {...form.register('name')} />
          <Input label="Short Code" {...form.register('shortCode')} />
          <Input label="Registration No." {...form.register('registrationNo')} />
          <SelectInput
            label="Type"
            options={[
              { label: 'School', value: 'school' },
              { label: 'Coaching', value: 'coaching' },
              { label: 'College', value: 'college' },
            ]}
            value={form.watch('type')}
            onChange={(e) => {
              form.setValue('type', e.target.value as InstitutionSettingsPayload['type'], { shouldValidate: true });
              onBlurSync();
            }}
          />
          <Input label="Academic Year" {...form.register('academicYear')} />
          <Input label="Contact Email" type="email" {...form.register('contactEmail')} />
          <Input label="Phone" {...form.register('phone')} />
          <Input label="Website" {...form.register('website')} />
        </div>

        <div className="mt-5 pt-5 border-t border-border">
          <p className="text-sm font-semibold mb-3">Logo</p>
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-xl bg-primary/10 border-2 border-dashed border-primary/30 flex flex-col items-center justify-center text-primary/40">
              <Upload className="h-6 w-6" />
              <span className="text-[9px] mt-1">Logo</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">PNG or SVG · Recommended 200×200px</p>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Upload className="h-3.5 w-3.5" />}
                onClick={() => success('Upload Ready', 'Select your logo file')}
              >
                Upload
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

