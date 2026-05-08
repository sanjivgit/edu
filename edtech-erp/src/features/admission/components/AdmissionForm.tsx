import { useEffect, useMemo, useState } from 'react';
import { useForm, type FieldPath } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Input, SelectInput, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { AdmissionRecord } from '../services/admission.service';
import {
  admissionCreateSchema,
  admissionUpdateSchema,
  type AdmissionCreatePayload,
  type AdmissionUpdatePayload,
} from '../validations/admission.schema';

interface AdmissionFormProps {
  mode: 'create' | 'edit';
  initialData?: AdmissionRecord | null;
  onSubmit: (payload: Omit<AdmissionRecord, 'id' | 'appliedDate' | 'status'> | Omit<AdmissionRecord, 'id' | 'appliedDate'>) => void;
  isLoading?: boolean;
}

const classOptions = Array.from({ length: 12 }, (_, idx) => ({
  label: `Class ${idx + 1}`,
  value: `Class ${idx + 1}`,
}));

const sectionOptions = ['A', 'B', 'C', 'D'].map((item) => ({ label: `Section ${item}`, value: item }));

export function AdmissionForm({ mode, initialData = null, onSubmit, isLoading = false }: AdmissionFormProps) {
  const isEdit = mode === 'edit';
  const [step, setStep] = useState(0);

  type FormValues = AdmissionCreatePayload | AdmissionUpdatePayload;

  const form = useForm<FormValues>({
    resolver: yupResolver(isEdit ? admissionUpdateSchema : admissionCreateSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'male',
      classApplyingFor: '',
      sectionPreference: 'A',
      bloodGroup: '',
      religion: '',
      nationality: 'Indian',
      motherTongue: '',
      studentAadhaar: '',
      previousSchool: '',
      previousGrade: '',
      tcNumber: '',
      fatherName: '',
      motherName: '',
      guardianName: '',
      relationToStudent: '',
      parentPhone: '',
      alternatePhone: '',
      parentEmail: '',
      annualIncome: 0,
      occupation: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      country: 'India',
      pincode: '',
      medicalConditions: '',
      disabilities: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      transportRequired: false,
      hostelRequired: false,
      ...(isEdit ? { id: initialData?.id ?? '', status: initialData?.status ?? 'pending' } : {}),
    } as AdmissionCreatePayload | AdmissionUpdatePayload,
  });

  useEffect(() => {
    if (!initialData) return;
    form.reset({
      ...initialData,
      annualIncome: initialData.annualIncome ?? 0,
    } as AdmissionUpdatePayload);
    setStep(0);
  }, [initialData, form]);

  const submit = form.handleSubmit((values) => {
    if (isEdit) {
      const payload = values as AdmissionUpdatePayload;
      onSubmit({
        ...payload,
      } as any);
      return;
    }
    onSubmit(values as any);
  });

  const steps = useMemo(() => {
    const keys = <T extends FormValues>(arr: Array<FieldPath<T>>) => arr as Array<FieldPath<FormValues>>;

    return [
      {
        title: 'Student Details',
        description: 'Basic student information and admission preference',
        fields: keys([
          'firstName',
          'lastName',
          'dateOfBirth',
          'gender',
          'classApplyingFor',
          'sectionPreference',
          'nationality',
        ]),
      },
      {
        title: 'Parent / Guardian',
        description: 'Parent and guardian contact details',
        fields: keys([
          'fatherName',
          'motherName',
          'guardianName',
          'relationToStudent',
          'parentPhone',
          'alternatePhone',
          'parentEmail',
          'occupation',
          'annualIncome',
        ]),
      },
      {
        title: 'Address',
        description: 'Residential address for communication',
        fields: keys([
          'addressLine1',
          'addressLine2',
          'city',
          'state',
          'country',
          'pincode',
        ]),
      },
      {
        title: 'Medical & Facilities',
        description: 'Emergency contact, medical notes, and requirements',
        fields: keys([
          'emergencyContactName',
          'emergencyContactPhone',
          'medicalConditions',
          'disabilities',
          'transportRequired',
          'hostelRequired',
        ]),
      },
    ] as const;
  }, []);

  const isLastStep = step === steps.length - 1;

  const goNext = async () => {
    const ok = await form.trigger(steps[step]!.fields, { shouldFocus: true });
    if (!ok) return;
    setStep((s) => Math.min(steps.length - 1, s + 1));
  };

  const goBack = () => setStep((s) => Math.max(0, s - 1));

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Stepper */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Step {step + 1} of {steps.length}
            </p>
            <p className="font-display font-semibold text-lg mt-1">{steps[step]?.title}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{steps[step]?.description}</p>
          </div>
          <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Step content */}
      {step === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="First Name" required {...form.register('firstName')} error={form.formState.errors.firstName?.message} />
          <Input label="Last Name" required {...form.register('lastName')} error={form.formState.errors.lastName?.message} />
          <Input label="Date of Birth" type="date" required {...form.register('dateOfBirth')} error={form.formState.errors.dateOfBirth?.message} />
          <SelectInput
            label="Gender"
            options={[{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }, { label: 'Other', value: 'other' }]}
            value={form.watch('gender')}
            onChange={(event) => form.setValue('gender', event.target.value as 'male' | 'female' | 'other')}
            error={form.formState.errors.gender?.message}
          />
          <SelectInput
            label="Class Applying For"
            options={classOptions}
            value={form.watch('classApplyingFor')}
            onChange={(event) => form.setValue('classApplyingFor', event.target.value)}
            error={form.formState.errors.classApplyingFor?.message}
          />
          <SelectInput
            label="Section Preference"
            options={sectionOptions}
            value={form.watch('sectionPreference')}
            onChange={(event) => form.setValue('sectionPreference', event.target.value)}
            error={form.formState.errors.sectionPreference?.message}
          />
          <Input label="Nationality" required {...form.register('nationality')} error={form.formState.errors.nationality?.message} />
          <Input label="Student Aadhaar (optional)" {...form.register('studentAadhaar')} error={form.formState.errors.studentAadhaar?.message} />
          <Input label="Previous School (optional)" {...form.register('previousSchool')} />
          <Input label="Previous Grade (optional)" {...form.register('previousGrade')} />
          <Input label="Transfer Certificate No. (optional)" {...form.register('tcNumber')} />
        </div>
      )}

      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Father Name" required {...form.register('fatherName')} error={form.formState.errors.fatherName?.message} />
          <Input label="Mother Name" required {...form.register('motherName')} error={form.formState.errors.motherName?.message} />
          <Input label="Guardian Name (optional)" {...form.register('guardianName')} error={form.formState.errors.guardianName?.message} />
          <Input label="Relation to Student (optional)" {...form.register('relationToStudent')} error={form.formState.errors.relationToStudent?.message} />
          <Input label="Parent Phone" required {...form.register('parentPhone')} error={form.formState.errors.parentPhone?.message} />
          <Input label="Alternate Phone (optional)" {...form.register('alternatePhone')} error={form.formState.errors.alternatePhone?.message} />
          <Input label="Parent Email (optional)" type="email" {...form.register('parentEmail')} error={form.formState.errors.parentEmail?.message} />
          <Input label="Occupation (optional)" {...form.register('occupation')} error={form.formState.errors.occupation?.message} />
          <Input
            label="Annual Income (optional)"
            type="number"
            min={0}
            {...form.register('annualIncome', { valueAsNumber: true })}
            error={form.formState.errors.annualIncome?.message as string | undefined}
          />
        </div>
      )}

      {step === 2 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Address Line 1" required {...form.register('addressLine1')} error={form.formState.errors.addressLine1?.message} />
          <Input label="Address Line 2 (optional)" {...form.register('addressLine2')} error={form.formState.errors.addressLine2?.message} />
          <Input label="City" required {...form.register('city')} error={form.formState.errors.city?.message} />
          <Input label="State" required {...form.register('state')} error={form.formState.errors.state?.message} />
          <Input label="Country" required {...form.register('country')} error={form.formState.errors.country?.message} />
          <Input label="Pincode" required {...form.register('pincode')} error={form.formState.errors.pincode?.message} />
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Emergency Contact Name" required {...form.register('emergencyContactName')} error={form.formState.errors.emergencyContactName?.message} />
            <Input label="Emergency Contact Phone" required {...form.register('emergencyContactPhone')} error={form.formState.errors.emergencyContactPhone?.message} />
            <SelectInput
              label="Transport Required"
              options={[{ label: 'Yes', value: 'true' }, { label: 'No', value: 'false' }]}
              value={String(form.watch('transportRequired'))}
              onChange={(event) => form.setValue('transportRequired', event.target.value === 'true')}
            />
            <SelectInput
              label="Hostel Required"
              options={[{ label: 'Yes', value: 'true' }, { label: 'No', value: 'false' }]}
              value={String(form.watch('hostelRequired'))}
              onChange={(event) => form.setValue('hostelRequired', event.target.value === 'true')}
            />
          </div>
          <Textarea label="Medical Conditions (optional)" {...form.register('medicalConditions')} />
          <Textarea label="Disabilities (optional)" {...form.register('disabilities')} />
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <Button type="button" variant="outline" onClick={goBack} disabled={step === 0}>
          Back
        </Button>
        <div className="flex items-center gap-3">
          {!isLastStep ? (
            <Button type="button" onClick={goNext}>
              Next
            </Button>
          ) : (
            <Button type="submit" isLoading={isLoading}>
              {isEdit ? 'Update Application' : 'Submit Application'}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
