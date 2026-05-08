import { useQuery } from '@tanstack/react-query';
import { useAppMutation } from '@/reactQueryConfig/hooks/useAppMutation';
import { mockDelay } from '@/shared/utils';

export type AttendanceStatus = 'present' | 'absent' | 'late';

export interface StudentRosterItem {
  id: string;
  name: string;
  rollNo: string;
}

export interface AttendanceEntry {
  studentId: string;
  status: AttendanceStatus;
}

export interface AttendanceSession {
  id: string;
  classId: string;
  section: string;
  date: string; // yyyy-mm-dd
  entries: AttendanceEntry[];
  createdAt: string;
}

const API = '/attendance';

const rosterStore = new Map<string, StudentRosterItem[]>();
let sessionStore: AttendanceSession[] = [];

function rosterKey(classId: string, section: string) {
  return `${classId}-${section}`;
}

function ensureRoster(classId: string, section: string) {
  const key = rosterKey(classId, section);
  if (rosterStore.has(key)) return;
  const names = [
    'Aarav Sharma','Priya Patel','Riya Singh','Arjun Kumar','Sneha Gupta','Rahul Verma','Kavya Nair','Vikram Mehta',
    'Aisha Khan','Dev Patel','Mia Roy','Raj Gupta','Ananya Singh','Kiran Joshi','Om Tiwari','Zara Ali','Harsh Mishra','Pooja Nair',
  ];
  rosterStore.set(
    key,
    Array.from({ length: 18 }, (_, i) => ({
      id: `${key}-S${i + 1}`,
      name: names[i],
      rollNo: String(i + 1).padStart(3, '0'),
    }))
  );
}

function ensureSeedSessions() {
  if (sessionStore.length) return;
  const today = new Date();
  const d1 = new Date(today); d1.setDate(today.getDate() - 1);
  const d2 = new Date(today); d2.setDate(today.getDate() - 2);
  const dates = [today, d1, d2].map((d) => d.toISOString().split('T')[0]);
  ensureRoster('10', 'A');
  const roster = rosterStore.get(rosterKey('10', 'A'))!;
  sessionStore = dates.map((date, idx) => ({
    id: `ATT-${100 + idx}`,
    classId: '10',
    section: 'A',
    date,
    entries: roster.map((s, i) => ({
      studentId: s.id,
      status: (['present','present','absent','late'][i % 4] as AttendanceStatus),
    })),
    createdAt: new Date().toISOString(),
  }));
}

export const useGetRoster = ({ classId, section }: { classId?: string; section?: string }) =>
  useQuery({
    queryKey: [API, 'roster', classId, section],
    queryFn: async () => {
      await mockDelay(150);
      ensureRoster(classId!, section!);
      return rosterStore.get(rosterKey(classId!, section!)) ?? [];
    },
    enabled: !!classId && !!section,
  });

export const useGetSessions = () =>
  useQuery({
    queryKey: [API, 'sessions'],
    queryFn: async () => {
      await mockDelay(150);
      ensureSeedSessions();
      return [...sessionStore].sort((a, b) => b.date.localeCompare(a.date));
    },
  });

export const useGetSessionById = ({ sessionId }: { sessionId?: string }) =>
  useQuery({
    queryKey: [API, 'sessions', sessionId],
    queryFn: async () => {
      await mockDelay(120);
      ensureSeedSessions();
      return sessionStore.find((s) => s.id === sessionId) ?? null;
    },
    enabled: !!sessionId,
  });

export const useSaveAttendanceSession = () =>
  useAppMutation({
    mutationFn: async (body: { classId: string; section: string; date: string; entries: AttendanceEntry[] }) => {
      await mockDelay(200);
      ensureRoster(body.classId, body.section);
      const existing = sessionStore.find((s) => s.classId === body.classId && s.section === body.section && s.date === body.date);
      if (existing) {
        sessionStore = sessionStore.map((s) => (s.id === existing.id ? { ...s, entries: body.entries } : s));
        return sessionStore.find((s) => s.id === existing.id)!;
      }
      const created: AttendanceSession = {
        id: `ATT-${100 + sessionStore.length}`,
        classId: body.classId,
        section: body.section,
        date: body.date,
        entries: body.entries,
        createdAt: new Date().toISOString(),
      };
      sessionStore = [created, ...sessionStore];
      return created;
    },
    successMsg: 'Attendance saved successfully',
    errorMsg: 'Failed to save attendance',
    invalidateQueryKeys: [[API, 'sessions']],
  });
