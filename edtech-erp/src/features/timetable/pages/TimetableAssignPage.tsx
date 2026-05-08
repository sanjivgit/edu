import { ArrowLeft, Save } from 'lucide-react';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, SelectInput } from '@/components/ui/Input';
import { timetableAssignSchema, type TimetableAssignPayload } from '../validations/timetable.schema';
import { useAssignTimetableCell } from '../services/timetable.service';

const SUBJECTS = ['Mathematics', 'Science', 'English', 'Hindi', 'History', 'Computer', 'PE', 'Art'];
const TEACHERS = ['Mr. Verma', 'Ms. Joshi', 'Mr. Iyer', 'Ms. Nair', 'Ms. Gupta', 'Mr. Shah', 'Mr. Singh', 'Ms. Patel'];

export default function TimetableAssignPage() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();

  const defaults = useMemo(() => {
    const classId = sp.get('classId') ?? '10';
    const section = sp.get('section') ?? 'A';
    const week = Number(sp.get('week') ?? '0');
    const day = (sp.get('day') ?? 'Monday') as TimetableAssignPayload['day'];
    const periodId = Number(sp.get('periodId') ?? '1');
    const subject = sp.get('subject') ?? '';
    const teacher = sp.get('teacher') ?? '';
    return { classId, section, week, day, periodId, subject, teacher };
  }, [sp]);

  const form = useForm<TimetableAssignPayload>({
    resolver: yupResolver(timetableAssignSchema),
    defaultValues: defaults,
  });

  const assignMutation = useAssignTimetableCell();

  const onSubmit = (values: TimetableAssignPayload) => {
    assignMutation.mutate(
      {
        classId: values.classId,
        section: values.section,
        week: values.week,
        day: values.day,
        periodId: values.periodId,
        subject: values.subject,
        teacher: values.teacher,
      },
      {
        onSuccess: () => navigate('/timetable/edit'),
      }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assign Period"
        description="Set subject and teacher for the selected slot"
        actions={
          <>
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate(-1)}>
              Back
            </Button>
            <Button size="sm" leftIcon={<Save className="h-4 w-4" />} onClick={form.handleSubmit(onSubmit)} isLoading={assignMutation.isPending}>
              Save
            </Button>
          </>
        }
      />

      <Card className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectInput
            label="Subject"
            options={SUBJECTS.map((s) => ({ label: s, value: s }))}
            value={form.watch('subject')}
            onChange={(e) => form.setValue('subject', e.target.value, { shouldValidate: true })}
          />
          <SelectInput
            label="Teacher"
            options={TEACHERS.map((t) => ({ label: t, value: t }))}
            value={form.watch('teacher')}
            onChange={(e) => form.setValue('teacher', e.target.value, { shouldValidate: true })}
          />

          <Input label="Day" value={form.watch('day')} disabled />
          <Input label="Period" value={`P${form.watch('periodId')}`} disabled />
        </div>

        {(form.formState.errors.subject?.message || form.formState.errors.teacher?.message) && (
          <div className="mt-3 text-sm text-red-600">
            {form.formState.errors.subject?.message ?? form.formState.errors.teacher?.message}
          </div>
        )}
      </Card>
    </div>
  );
}

