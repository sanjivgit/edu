import { Card } from '@/components/ui/Card';

export function ReportsTopTable({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ label: string; value: number; meta?: string }>;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">Top 3</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40 border-b border-border">
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Label</th>
              <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => (
              <tr key={r.label} className="hover:bg-muted/20">
                <td className="px-3 py-2">
                  <p className="font-medium">{r.label}</p>
                  {r.meta && <p className="text-xs text-muted-foreground mt-0.5">{r.meta}</p>}
                </td>
                <td className="px-3 py-2 text-right font-mono text-xs">{r.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

