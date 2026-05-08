import { useState } from 'react';

export function useTimetableFilters(defaults?: { classId?: string; section?: string; week?: number }) {
  const [classId, setClassId] = useState(defaults?.classId ?? '10');
  const [section, setSection] = useState(defaults?.section ?? 'A');
  const [week, setWeek] = useState(defaults?.week ?? 0);

  return {
    classId,
    section,
    week,
    setClassId,
    setSection,
    setWeek,
  };
}

