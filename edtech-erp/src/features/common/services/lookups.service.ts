import apiClient from '@/lib/apiClient';
import type { ApiResponse } from '@/types';

async function fetchList<T>(url: string, search?: string): Promise<T[]> {
  const params: Record<string, unknown> = { limit: 500 };
  if (search) params.search = search;
  const res = await apiClient.get<ApiResponse<T[]>>(url, { params });
  const data = res.data.data;
  return Array.isArray(data) ? data : ((data as { items?: T[] })?.items ?? []);
}

export async function findTeacherIdByName(name?: string): Promise<string | undefined> {
  if (!name?.trim()) return undefined;
  const items = await fetchList<{ id: string; fullName: string }>('/teachers');
  return items.find((t) => t.fullName.toLowerCase() === name.trim().toLowerCase())?.id;
}

export async function findClassIdByName(name?: string): Promise<string | undefined> {
  if (!name?.trim()) return undefined;
  const items = await fetchList<{ id: string; name: string }>('/classes');
  return items.find((c) => c.name.toLowerCase() === name.trim().toLowerCase())?.id;
}

export async function resolveClassDisplayMap(classIds: string[]): Promise<Map<string, string>> {
  const ids = Array.from(new Set((classIds ?? []).filter(Boolean)));
  if (ids.length === 0) return new Map();
  const items = await fetchList<{ id: string; name: string }>('/classes');
  const map = new Map<string, string>();
  for (const c of items) {
    const num = c.name.match(/(\d+)/);
    if (num) map.set(c.id, num[1]);
  }
  return map;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function resolveClassId(value?: string): Promise<string | undefined> {
  if (!value?.trim()) return undefined;
  const v = value.trim();
  if (UUID_RE.test(v)) return v;
  const items = await fetchList<{ id: string; name: string }>('/classes');
  return (
    items.find((c) => c.name.toLowerCase() === v.toLowerCase())?.id ??
    items.find((c) => c.name.toLowerCase() === `class ${v.toLowerCase()}`)?.id
  );
}

export async function findSubjectIdByName(name?: string): Promise<string | undefined> {
  if (!name?.trim()) return undefined;
  const items = await fetchList<{ id: string; name: string }>('/subjects');
  return items.find((s) => s.name.toLowerCase() === name.trim().toLowerCase())?.id;
}

export async function findStudentIdByName(value?: string): Promise<string | undefined> {
  if (!value?.trim()) return undefined;
  const target = value.trim().replace(/\s*\(.*\)\s*$/, '').toLowerCase();
  const items = await fetchList<{ id: string; name: string; rollNo?: string }>('/students');
  return (
    items.find((s) => s.name.toLowerCase() === target)?.id ??
    items.find((s) => s.rollNo?.toLowerCase() === target)?.id
  );
}

export async function resolveSectionId(classIdValue?: string, section?: string): Promise<string | undefined> {
  if (!section?.trim()) return undefined;
  const realClassId = await resolveClassId(classIdValue);
  if (!realClassId) return undefined;
  const items = await fetchList<{ id: string; sections: Array<{ id: string; name: string }> }>('/classes');
  const cls = items.find((c) => c.id === realClassId);
  return cls?.sections?.find((s) => s.name.toLowerCase() === section.trim().toLowerCase())?.id;
}
