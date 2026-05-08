import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import type { InvoiceItem } from '../services/invoice.service';

export function InvoiceItemsTable({
  items,
  onChange,
  readOnly = false,
}: {
  items: InvoiceItem[];
  onChange: (items: InvoiceItem[]) => void;
  readOnly?: boolean;
}) {
  const total = items.reduce((sum, it) => sum + (it.quantity || 0) * (it.unitPrice || 0), 0);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold">Invoice Items</p>
        {!readOnly && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onChange([...items, { description: '', quantity: 1, unitPrice: 0 }])}
          >
            Add Item
          </Button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40 border-b border-border">
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Description</th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground w-[110px]">Qty</th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground w-[140px]">Unit Price</th>
              <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground w-[140px]">Amount</th>
              {!readOnly && <th className="px-3 py-2 w-[80px]" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((it, idx) => {
              const amount = (it.quantity || 0) * (it.unitPrice || 0);
              return (
                <tr key={idx} className="hover:bg-muted/20">
                  <td className="px-3 py-2">
                    {readOnly ? (
                      <span className="text-sm">{it.description}</span>
                    ) : (
                      <Input
                        label=""
                        value={it.description}
                        onChange={(e) => {
                          const next = [...items];
                          next[idx] = { ...next[idx], description: e.target.value };
                          onChange(next);
                        }}
                        placeholder="e.g. Tuition Fee - April"
                      />
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {readOnly ? (
                      <span className="font-mono text-xs">{it.quantity}</span>
                    ) : (
                      <Input
                        label=""
                        type="number"
                        value={String(it.quantity ?? 1)}
                        onChange={(e) => {
                          const q = Number(e.target.value);
                          const next = [...items];
                          next[idx] = { ...next[idx], quantity: Number.isFinite(q) ? q : 1 };
                          onChange(next);
                        }}
                      />
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {readOnly ? (
                      <span className="font-mono text-xs">₹{it.unitPrice}</span>
                    ) : (
                      <Input
                        label=""
                        type="number"
                        value={String(it.unitPrice ?? 0)}
                        onChange={(e) => {
                          const p = Number(e.target.value);
                          const next = [...items];
                          next[idx] = { ...next[idx], unitPrice: Number.isFinite(p) ? p : 0 };
                          onChange(next);
                        }}
                      />
                    )}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-xs">₹{amount}</td>
                  {!readOnly && (
                    <td className="px-3 py-2 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onChange(items.filter((_, i) => i !== idx))}
                      >
                        Remove
                      </Button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-border">
              <td colSpan={readOnly ? 3 : 4} className="px-3 py-2 text-right text-sm font-semibold">
                Total
              </td>
              <td className="px-3 py-2 text-right font-mono text-sm font-semibold">₹{total}</td>
              {!readOnly && <td />}
            </tr>
          </tfoot>
        </table>
      </div>
    </Card>
  );
}

