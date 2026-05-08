import { useForm } from 'react-hook-form';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, SelectInput } from '@/components/ui/Input';
import type { AcademicYearItem, ClassItem, PromotionRecord } from '../services/classes.service';

interface PromotionFormValues {
  fromClassId: string;
  toClassId: string;
  promotedCount: number;
  academicYearId: string;
}

export function PromotionPanel({
  classes,
  academicYears,
  promotions,
  isSubmitting = false,
  onSubmit,
}: {
  classes: ClassItem[];
  academicYears: AcademicYearItem[];
  promotions: PromotionRecord[];
  isSubmitting?: boolean;
  onSubmit: (values: PromotionFormValues) => void;
}) {
  const form = useForm<PromotionFormValues>({
    defaultValues: {
      fromClassId: classes[0]?.id ?? '',
      toClassId: classes[1]?.id ?? '',
      promotedCount: 1,
      academicYearId: academicYears.find((y) => y.status === 'active')?.id ?? academicYears[0]?.id ?? '',
    },
  });

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[380px,1fr] gap-6">
      <Card className="p-5 space-y-4">
        <h3 className="text-base font-semibold">Promote Students</h3>
        <SelectInput label="From Class" options={classes.map((c) => ({ label: c.name, value: c.id }))} value={form.watch('fromClassId')} onChange={(e) => form.setValue('fromClassId', e.target.value)} />
        <SelectInput label="To Class" options={classes.map((c) => ({ label: c.name, value: c.id }))} value={form.watch('toClassId')} onChange={(e) => form.setValue('toClassId', e.target.value)} />
        <Input label="Promoted Students" type="number" min={1} value={String(form.watch('promotedCount'))} onChange={(e) => form.setValue('promotedCount', Number(e.target.value))} />
        <SelectInput label="Academic Year" options={academicYears.map((y) => ({ label: y.name, value: y.id }))} value={form.watch('academicYearId')} onChange={(e) => form.setValue('academicYearId', e.target.value)} />
        <Button className="w-full" isLoading={isSubmitting} onClick={form.handleSubmit(onSubmit)}>Run Promotion</Button>
      </Card>
      <Card className="p-5">
        <h3 className="text-base font-semibold mb-4">Promotion History</h3>
        <div className="space-y-3">
          {promotions.length === 0 ? (
            <div className="text-sm text-muted-foreground">No promotions recorded yet.</div>
          ) : (
            promotions.map((item) => {
              const from = classes.find((c) => c.id === item.fromClassId)?.name ?? item.fromClassId;
              const to = classes.find((c) => c.id === item.toClassId)?.name ?? item.toClassId;
              const year = academicYears.find((y) => y.id === item.academicYearId)?.name ?? item.academicYearId;
              return (
                <div key={item.id} className="rounded-lg border p-3 text-sm">
                  <div className="font-medium">{from} to {to}</div>
                  <div className="text-muted-foreground">{item.promotedCount} students promoted in {year}</div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}

