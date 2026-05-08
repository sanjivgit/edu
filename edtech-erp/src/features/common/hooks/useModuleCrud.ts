import { useQuery } from '@tanstack/react-query';
import { useAppMutation } from '@/reactQueryConfig/hooks/useAppMutation';
import {
  moduleRecordCreateSchema,
  moduleRecordUpdateSchema,
} from '../validation/moduleRecord.schema';

interface ModuleRecord {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

const store = new Map<string, ModuleRecord[]>();

function getSeedRecords(moduleTitle: string): ModuleRecord[] {
  return Array.from({ length: 5 }, (_, idx) => ({
    id: `${moduleTitle.slice(0, 3).toUpperCase()}-${String(idx + 1).padStart(3, '0')}`,
    name: `${moduleTitle} Entry ${idx + 1}`,
    status: idx % 4 === 0 ? 'inactive' : 'active',
    createdAt: new Date(2026, 0, idx + 3).toISOString(),
    updatedAt: new Date(2026, 0, idx + 3).toISOString(),
  }));
}

function ensureModule(moduleKey: string, moduleTitle: string) {
  if (!store.has(moduleKey)) {
    store.set(moduleKey, getSeedRecords(moduleTitle));
  }
}

export function useModuleRecords(moduleKey: string, moduleTitle: string) {
  return useQuery({
    queryKey: ['module-records', moduleKey],
    queryFn: async () => {
      ensureModule(moduleKey, moduleTitle);
      return [...(store.get(moduleKey) ?? [])];
    },
  });
}

export function useModuleRecordById(moduleKey: string, moduleTitle: string, id: string | null) {
  return useQuery({
    queryKey: ['module-record', moduleKey, id],
    queryFn: async () => {
      ensureModule(moduleKey, moduleTitle);
      const current = store.get(moduleKey) ?? [];
      return current.find((item) => item.id === id) ?? null;
    },
    enabled: Boolean(id),
  });
}

export function useCreateModuleRecord(moduleKey: string, moduleTitle: string, entityLabel: string) {
  return useAppMutation({
    mutationFn: async ({ name }: { name: string }) => {
      ensureModule(moduleKey, moduleTitle);
      const payload = moduleRecordCreateSchema.parse(
        { name },
        // { abortEarly: true, stripUnknown: true }
      ) as { name: string };
      const current = store.get(moduleKey) ?? [];
      const created: ModuleRecord = {
        id: `${moduleTitle.slice(0, 3).toUpperCase()}-${String(current.length + 1).padStart(3, '0')}`,
        name: payload.name,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.set(moduleKey, [...current, created]);
      return created;
    },
    successMsg: `${entityLabel} created successfully.`,
    errorMsg: `Could not create ${entityLabel.toLowerCase()}.`,
    invalidateQueryKeys: [['module-records', moduleKey]],
  });
}

export function useUpdateModuleRecord(moduleKey: string, moduleTitle: string, entityLabel: string) {
  return useAppMutation({
    mutationFn: async ({ id, name, status }: { id: string; name: string; status: 'active' | 'inactive' }) => {
      ensureModule(moduleKey, moduleTitle);
      const payload = moduleRecordUpdateSchema.parse(
        { id, name, status },
        // { abortEarly: true, stripUnknown: true }
      ) as { id: string; name: string; status: 'active' | 'inactive' };
      const current = store.get(moduleKey) ?? [];
      const found = current.find((item) => item.id === payload.id);
      if (!found) throw new Error('Record not found');
      const updated: ModuleRecord = {
        ...found,
        name: payload.name,
        status: payload.status,
        updatedAt: new Date().toISOString(),
      };
      store.set(
        moduleKey,
        current.map((item) => (item.id === payload.id ? updated : item))
      );
      return updated;
    },
    successMsg: `${entityLabel} updated successfully.`,
    errorMsg: `Could not update ${entityLabel.toLowerCase()}.`,
    invalidateQueryKeys: [['module-records', moduleKey]],
  });
}

export function useDeleteModuleRecord(moduleKey: string, moduleTitle: string, entityLabel: string) {
  return useAppMutation({
    mutationFn: async ({ id }: { id: string }) => {
      ensureModule(moduleKey, moduleTitle);
      const current = store.get(moduleKey) ?? [];
      store.set(
        moduleKey,
        current.filter((item) => item.id !== id)
      );
      return { id };
    },
    successMsg: `${entityLabel} deleted successfully.`,
    errorMsg: `Could not delete ${entityLabel.toLowerCase()}.`,
    invalidateQueryKeys: [['module-records', moduleKey]],
  });
}
