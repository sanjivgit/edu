import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, SelectInput } from '@/components/ui/Input';
import { RouteStopsTable } from './RouteStopsTable';
import {
  transportRouteCreateSchema,
  transportRouteUpdateSchema,
  type TransportRouteCreatePayload,
  type TransportRouteUpdatePayload,
} from '../validations/transport.schema';
import type { TransportStop } from '../services/transport.service';

type Mode = 'create' | 'edit';

export function RouteForm({
  mode,
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: {
  mode: Mode;
  defaultValues?: Partial<TransportRouteCreatePayload & { id?: string }>;
  onSubmit: (values: TransportRouteCreatePayload | TransportRouteUpdatePayload, stops: TransportStop[]) => void;
  isSubmitting?: boolean;
}) {
  const form = useForm<TransportRouteCreatePayload | TransportRouteUpdatePayload>({
    resolver: yupResolver(mode === 'create' ? transportRouteCreateSchema : transportRouteUpdateSchema),
    defaultValues: {
      name: '',
      vehicleNo: '',
      driverName: '',
      driverPhone: '',
      startsAt: '07:10',
      stops: [],
      status: 'active',
      ...(defaultValues ?? {}),
    } as any,
  });

  const [stops, setStops] = useState<TransportStop[]>(
    (defaultValues?.stops as TransportStop[] | undefined) ?? [{ name: 'City Mall', time: '07:25' }]
  );

  const stopCount = useMemo(() => stops.length, [stops]);
  const errors = form.formState.errors as any;

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Route Name" placeholder="e.g. Route 1 - North" {...form.register('name' as any)} />
          <Input label="Vehicle No" placeholder="e.g. KA-01-AB-1234" {...form.register('vehicleNo' as any)} />
          <Input label="Stops" value={String(stopCount)} disabled />
          <Input label="Driver Name" placeholder="e.g. Ramesh Kumar" {...form.register('driverName' as any)} />
          <Input label="Driver Phone" placeholder="10-digit number" {...form.register('driverPhone' as any)} />
          <Input label="Start Time" type="time" {...form.register('startsAt' as any)} />
          <SelectInput
            label="Status"
            options={[
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ]}
            value={form.watch('status' as any) as any}
            onChange={(e) => form.setValue('status' as any, e.target.value as any, { shouldValidate: true })}
          />
        </div>

        {(errors?.name?.message ||
          errors?.vehicleNo?.message ||
          errors?.driverName?.message ||
          errors?.driverPhone?.message ||
          errors?.startsAt?.message ||
          errors?.stops?.message) && (
          <div className="mt-3 text-sm text-red-600">
            {errors?.name?.message ??
              errors?.vehicleNo?.message ??
              errors?.driverName?.message ??
              errors?.driverPhone?.message ??
              errors?.startsAt?.message ??
              errors?.stops?.message}
          </div>
        )}
      </Card>

      <RouteStopsTable stops={stops} onChange={setStops} />

      <div className="flex justify-end">
        <Button onClick={form.handleSubmit((v) => onSubmit(v as any, stops))} isLoading={isSubmitting}>
          {mode === 'create' ? 'Create Route' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}

