import { mockDelay } from '@/shared/utils';

export interface ModuleRecord {
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

export const mockModuleService = {
  async list(moduleKey: string, moduleTitle: string): Promise<ModuleRecord[]> {
    ensureModule(moduleKey, moduleTitle);
    await mockDelay(250);
    return [...(store.get(moduleKey) ?? [])];
  },

  async getById(moduleKey: string, moduleTitle: string, id: string): Promise<ModuleRecord | null> {
    ensureModule(moduleKey, moduleTitle);
    await mockDelay(180);
    const current = store.get(moduleKey) ?? [];
    return current.find((item) => item.id === id) ?? null;
  },

  async create(moduleKey: string, moduleTitle: string, name: string): Promise<ModuleRecord> {
    ensureModule(moduleKey, moduleTitle);
    await mockDelay(250);
    const current = store.get(moduleKey) ?? [];
    const created: ModuleRecord = {
      id: `${moduleTitle.slice(0, 3).toUpperCase()}-${String(current.length + 1).padStart(3, '0')}`,
      name,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.set(moduleKey, [...current, created]);
    return created;
  },

  async update(
    moduleKey: string,
    moduleTitle: string,
    id: string,
    payload: Pick<ModuleRecord, 'name' | 'status'>
  ): Promise<ModuleRecord> {
    ensureModule(moduleKey, moduleTitle);
    await mockDelay(250);
    const current = store.get(moduleKey) ?? [];
    const found = current.find((item) => item.id === id);

    if (!found) {
      throw new Error('Record not found');
    }

    const updated: ModuleRecord = {
      ...found,
      name: payload.name,
      status: payload.status,
      updatedAt: new Date().toISOString(),
    };

    store.set(
      moduleKey,
      current.map((item) => (item.id === id ? updated : item))
    );
    return updated;
  },

  async remove(moduleKey: string, moduleTitle: string, id: string): Promise<{ id: string }> {
    ensureModule(moduleKey, moduleTitle);
    await mockDelay(220);
    const current = store.get(moduleKey) ?? [];
    store.set(
      moduleKey,
      current.filter((item) => item.id !== id)
    );
    return { id };
  },
};
