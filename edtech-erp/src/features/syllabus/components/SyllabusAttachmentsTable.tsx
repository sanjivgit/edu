import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import type { SyllabusAttachment } from '../services/syllabus.service';

export function SyllabusAttachmentsTable({
  items,
  onChange,
  readOnly = false,
}: {
  items: SyllabusAttachment[];
  onChange: (items: SyllabusAttachment[]) => void;
  readOnly?: boolean;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold">Attachments</p>
        {!readOnly && (
          <Button size="sm" variant="outline" onClick={() => onChange([...items, { name: '', url: '' }])}>
            Add File
          </Button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40 border-b border-border">
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Name</th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">URL</th>
              {!readOnly && <th className="px-3 py-2 w-[90px]" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((a, idx) => (
              <tr key={idx} className="hover:bg-muted/20">
                <td className="px-3 py-2">
                  {readOnly ? (
                    <span className="text-sm">{a.name}</span>
                  ) : (
                    <Input
                      label=""
                      value={a.name}
                      placeholder="e.g. Term 1 Syllabus.pdf"
                      onChange={(e) => {
                        const next = [...items];
                        next[idx] = { ...next[idx], name: e.target.value };
                        onChange(next);
                      }}
                    />
                  )}
                </td>
                <td className="px-3 py-2">
                  {readOnly ? (
                    <a className="text-xs text-primary underline break-all" href={a.url} target="_blank" rel="noreferrer">
                      {a.url}
                    </a>
                  ) : (
                    <Input
                      label=""
                      value={a.url}
                      placeholder="https://..."
                      onChange={(e) => {
                        const next = [...items];
                        next[idx] = { ...next[idx], url: e.target.value };
                        onChange(next);
                      }}
                    />
                  )}
                </td>
                {!readOnly && (
                  <td className="px-3 py-2 text-right">
                    <Button size="sm" variant="ghost" onClick={() => onChange(items.filter((_, i) => i !== idx))}>
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

