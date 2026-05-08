import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import type { TransportStop } from '../services/transport.service';

export function RouteStopsTable({
  stops,
  onChange,
  readOnly = false,
}: {
  stops: TransportStop[];
  onChange: (stops: TransportStop[]) => void;
  readOnly?: boolean;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold">Stops</p>
        {!readOnly && (
          <Button size="sm" variant="outline" onClick={() => onChange([...stops, { name: '', time: '07:30' }])}>
            Add Stop
          </Button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40 border-b border-border">
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Stop</th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground w-[140px]">Time</th>
              {!readOnly && <th className="px-3 py-2 w-[90px]" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {stops.map((s, idx) => (
              <tr key={idx} className="hover:bg-muted/20">
                <td className="px-3 py-2">
                  {readOnly ? (
                    <span>{s.name}</span>
                  ) : (
                    <Input
                      label=""
                      value={s.name}
                      placeholder="e.g. City Mall"
                      onChange={(e) => {
                        const next = [...stops];
                        next[idx] = { ...next[idx], name: e.target.value };
                        onChange(next);
                      }}
                    />
                  )}
                </td>
                <td className="px-3 py-2">
                  {readOnly ? (
                    <span className="font-mono text-xs">{s.time}</span>
                  ) : (
                    <Input
                      label=""
                      type="time"
                      value={s.time}
                      onChange={(e) => {
                        const next = [...stops];
                        next[idx] = { ...next[idx], time: e.target.value };
                        onChange(next);
                      }}
                    />
                  )}
                </td>
                {!readOnly && (
                  <td className="px-3 py-2 text-right">
                    <Button size="sm" variant="ghost" onClick={() => onChange(stops.filter((_, i) => i !== idx))}>
                      Remove
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

