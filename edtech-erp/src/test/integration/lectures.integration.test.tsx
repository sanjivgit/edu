import { describe, it, expect } from 'vitest';
import { act, waitFor } from '@testing-library/react';
import { renderHookWithProviders } from '@/test/utils';
import {
  useGetLiveLectures,
  useCreateLiveLecture,
} from '@/features/live-lecture/services/liveLecture.service';
import {
  useGetRecordedLectures,
  getAssetUrl,
} from '@/features/recorded-lecture/services/recordedLecture.service';

describe('lectures integration', () => {
  it('loads live lectures, resolving class ids to display names', async () => {
    const { result } = renderHookWithProviders(() => useGetLiveLectures());

    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 });

    const lectures = result.current.data ?? [];
    expect(lectures.length).toBeGreaterThanOrEqual(1);
    const first = lectures[0];
    expect(first).toMatchObject({
      id: 'lec-1',
      title: 'Algebra Basics',
      subject: 'Mathematics',
      classDisplay: '10',
      section: 'A',
      durationMinutes: 45,
      meetingUrl: 'https://meet.example.com/abc',
      status: 'scheduled',
      hostName: 'Rahul Sir',
    });
    expect(first.scheduledAt).toBe('2024-06-05');
    expect(first.time).toMatch(/^\d{2}:\d{2}$/);
  });

  it('loads recorded lectures with their attachments', async () => {
    const { result } = renderHookWithProviders(() => useGetRecordedLectures());

    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 });

    const lectures = result.current.data ?? [];
    expect(lectures.length).toBeGreaterThanOrEqual(1);
    const first = lectures[0];
    expect(first.id).toBe('rec-1');
    expect(first.status).toBe('published');
    expect(first.attachments).toEqual([{ name: 'video.mp4', url: '/uploads/lecture-1.mp4' }]);
    expect(first.classDisplay).toBe('10');
  });

  it('builds absolute asset urls from relative upload paths', () => {
    expect(getAssetUrl('/uploads/lecture-1.mp4')).toBe('http://localhost:4000/uploads/lecture-1.mp4');
    expect(getAssetUrl('https://cdn.example.com/v.mp4')).toBe('https://cdn.example.com/v.mp4');
    expect(getAssetUrl('')).toBe('');
    expect(getAssetUrl(undefined)).toBe('');
  });

  it('creates a live lecture via POST /lectures/live', async () => {
    const { result } = renderHookWithProviders(() => useCreateLiveLecture());

    await act(async () => {
      result.current.mutate({
        title: 'New Live Class',
        subject: 'Physics',
        classDisplay: '10',
        section: 'B',
        description: 'Kinematics',
        date: '2024-06-10',
        time: '11:00',
        durationMinutes: 60,
        meetingUrl: 'https://meet.example.com/new',
      });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 });

    expect(result.current.data?.title).toBe('New Live Class');
    expect(result.current.data?.subject).toBe('Physics');
    expect(result.current.data?.status).toBe('scheduled');
  });
});
