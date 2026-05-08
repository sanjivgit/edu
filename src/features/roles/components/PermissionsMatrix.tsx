import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import type { PermissionAction, RolePermission } from '../services/roles.service';
import { PERMISSION_MODULES } from '../services/roles.service';

function toggleAction(current: RolePermission[], module: string, action: PermissionAction) {
  const idx = current.findIndex((p) => p.module === module);
  if (idx < 0) return [...current, { module, actions: [action] }];
  const perm = current[idx];
  const has = perm.actions.includes(action);
  const nextActions = has ? perm.actions.filter((a) => a !== action) : [...perm.actions, action];
  const nextPerm = nextActions.length ? { ...perm, actions: nextActions } : null;
  const copy = [...current];
  if (!nextPerm) copy.splice(idx, 1);
  else copy[idx] = nextPerm;
  return copy;
}

export function PermissionsMatrix({
  value,
  onChange,
}: {
  value: RolePermission[];
  onChange?: (next: RolePermission[]) => void;
}) {
  const readOnly = !onChange;
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold">Permissions</p>
        <p className="text-xs text-muted-foreground">Select actions per module</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40 border-b border-border">
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Module</th>
              <th className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {PERMISSION_MODULES.map((m) => {
              const current = value.find((p) => p.module === m.module);
              return (
                <tr key={m.module} className="hover:bg-muted/20">
                  <td className="px-3 py-2">
                    <p className="font-medium">{m.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{m.module}</p>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap items-center justify-center gap-1.5">
                      {m.actions.map((a) => {
                        const enabled = !!current?.actions.includes(a);
                        return (
                          <button
                            key={a}
                            type="button"
                            onClick={() => onChange?.(toggleAction(value, m.module, a))}
                            disabled={readOnly}
                            className={cn(
                              'h-8 px-3 rounded-md text-xs font-medium transition-all border',
                              enabled ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
                            )}
                          >
                            {a.toUpperCase()}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

