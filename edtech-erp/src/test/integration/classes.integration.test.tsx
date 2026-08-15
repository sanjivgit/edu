import { describe, it, expect } from 'vitest';
import { act, waitFor } from '@testing-library/react';
import { renderHookWithProviders } from '@/test/utils';
import {
  useGetClasses,
  useGetSections,
  useAddClass,
  usePromoteStudents,
  useGetPromotions,
} from '@/features/classes/services/classes.service';
import { resolveClassId, resolveClassDisplayMap } from '@/features/common/services/lookups.service';

describe('classes integration', () => {
  it('loads classes, mapping nested teacher/section counts to the UI shape', async () => {
    const { result } = renderHookWithProviders(() => useGetClasses());

    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 });

    const classes = result.current.data ?? [];
    expect(classes.length).toBeGreaterThanOrEqual(1);
    expect(classes[0]).toMatchObject({
      id: 'class-1',
      name: 'Class 10',
      code: 'C10',
      classTeacher: 'Rahul Sir',
      sections: 1,
      students: 32,
      capacity: 40,
      status: 'active',
    });
  });

  it('flattens class sections into section records', async () => {
    const { result } = renderHookWithProviders(() => useGetSections());

    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 });

    const sections = result.current.data ?? [];
    expect(sections.length).toBeGreaterThanOrEqual(1);
    expect(sections[0]).toMatchObject({
      id: 'sec-1',
      classId: 'class-1',
      className: 'Class 10',
      name: 'A',
      roomNo: '101',
      students: 32,
      status: 'active',
    });
  });

  it('resolves a class display name to its numeric label', async () => {
    const map = await resolveClassDisplayMap(['class-1']);
    expect(map.get('class-1')).toBe('10');
  });

  it('resolves a class name (with or without the Class prefix) to its id', async () => {
    expect(await resolveClassId('Class 10')).toBe('class-1');
    expect(await resolveClassId('10')).toBe('class-1');
    expect(await resolveClassId('00000000-0000-4000-8000-000000000001')).toBe(
      '00000000-0000-4000-8000-000000000001'
    );
    expect(await resolveClassId('')).toBeUndefined();
  });

  it('creates a class and maps the created record', async () => {
    const { result } = renderHookWithProviders(() => useAddClass());

    await act(async () => {
      result.current.mutate({
        name: 'Class 11',
        code: 'C11',
        classTeacher: 'Rahul Sir',
        sections: 2,
        capacity: 40,
      });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 });

    expect(result.current.data?.name).toBe('Class 11');
    expect(result.current.data?.code).toBe('C11');
    expect(result.current.data?.classTeacher).toBe('Rahul Sir');
  });

  it('promotes students and returns the promotion summary', async () => {
    const { result } = renderHookWithProviders(() => usePromoteStudents());

    await act(async () => {
      result.current.mutate({
        fromClassId: 'class-1',
        toClassId: 'class-2',
        promotedCount: 2,
        academicYearId: 'ay-1',
      });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 });

    expect(result.current.data).toMatchObject({
      id: 'promo-1',
      fromClassId: 'class-1',
      toClassId: 'class-2',
      promotedCount: 2,
      academicYearId: 'ay-1',
    });
  });

  it('loads the promotion history', async () => {
    const { result } = renderHookWithProviders(() => useGetPromotions());

    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 });

    const promotions = result.current.data ?? [];
    expect(promotions.length).toBeGreaterThanOrEqual(1);
    expect(promotions[0]).toMatchObject({
      id: 'promo-1',
      fromClassId: 'class-1',
      toClassId: 'class-2',
      promotedCount: 2,
    });
  });
});
