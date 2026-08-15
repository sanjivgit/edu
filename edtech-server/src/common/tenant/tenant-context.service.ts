import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';

interface TenantStore {
  tenantId?: string | null;
}

@Injectable()
export class TenantContext {
  private readonly storage = new AsyncLocalStorage<TenantStore>();

  run<T>(tenantId: string | null | undefined, fn: () => T): T {
    return this.storage.run({ tenantId }, fn);
  }

  get tenantId(): string | null | undefined {
    return this.storage.getStore()?.tenantId;
  }
}
