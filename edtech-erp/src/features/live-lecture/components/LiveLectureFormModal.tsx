import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input, SelectInput, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import type { LectureInput, LiveLectureRecord } from '../services/liveLecture.service';

interface LiveLectureFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: LectureInput) => void;
  isSubmitting?: boolean;
  initial?: LiveLectureRecord | null;
  classOptions: Array<{ label: string; value: string }>;
}

const EMPTY_FORM: LectureInput = {
  title: '',
  subject: '',
  classDisplay: '',
  section: '',
  description: '',
  date: '',
  time: '',
  durationMinutes: 0,
  meetingUrl: '',
};

export function LiveLectureFormModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  initial = null,
  classOptions,
}: LiveLectureFormModalProps) {
  const [form, setForm] = useState<LectureInput>(
    initial
      ? {
          title: initial.title,
          subject: initial.subject,
          classDisplay: initial.classDisplay,
          section: initial.section,
          description: initial.description,
          date: initial.scheduledAt,
          time: initial.time,
          durationMinutes: initial.durationMinutes,
          meetingUrl: initial.meetingUrl,
        }
      : EMPTY_FORM
  );

  const set = (patch: Partial<LectureInput>) => setForm((prev) => ({ ...prev, ...patch }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initial ? 'Edit Live Class' : 'Schedule Live Class'}
      description={initial ? 'Update the live session details.' : 'Create a new live learning session.'}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSubmit(form)} isLoading={isSubmitting}>
            {initial ? 'Save Changes' : 'Schedule'}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Title" required placeholder="e.g. Chapter 4 — Quadratic Equations" value={form.title} onChange={(e) => set({ title: e.target.value })} />
        <Input label="Subject" required placeholder="e.g. Mathematics" value={form.subject} onChange={(e) => set({ subject: e.target.value })} />
        <SelectInput
          label="Class"
          placeholder="All classes"
          options={[{ label: 'All Classes', value: '' }, ...classOptions]}
          value={form.classDisplay}
          onChange={(e) => set({ classDisplay: e.target.value })}
        />
        <Input label="Section" placeholder="e.g. A" value={form.section} onChange={(e) => set({ section: e.target.value })} />
        <Input label="Date" type="date" required value={form.date} onChange={(e) => set({ date: e.target.value })} />
        <Input label="Time" type="time" required value={form.time} onChange={(e) => set({ time: e.target.value })} />
        <Input
          label="Duration (minutes)"
          type="number"
          min={5}
          placeholder="e.g. 45"
          value={String(form.durationMinutes || '')}
          onChange={(e) => set({ durationMinutes: Number(e.target.value) })}
        />
        <Input label="Meeting URL" placeholder="https://meet.example.com/abc" value={form.meetingUrl} onChange={(e) => set({ meetingUrl: e.target.value })} />
        <div className="sm:col-span-2">
          <Textarea label="Description" placeholder="Optional notes for participants..." rows={3} value={form.description} onChange={(e) => set({ description: e.target.value })} />
        </div>
      </div>
    </Modal>
  );
}
