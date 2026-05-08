import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, SelectInput } from '@/components/ui/Input';
import type { ExamPaper } from '../services/exam.service';

const SUBJECTS = ['Mathematics', 'Science', 'English', 'Hindi', 'History', 'Computer', 'PE', 'Art'];

export function ExamPapersTable({
  papers,
  onChange,
  readOnly = false,
}: {
  papers: ExamPaper[];
  onChange: (papers: ExamPaper[]) => void;
  readOnly?: boolean;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold">Exam Papers</p>
        {!readOnly && (
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              onChange([
                ...papers,
                { subject: 'Mathematics', date: new Date().toISOString().split('T')[0], startTime: '09:30', durationMinutes: 90, totalMarks: 100 },
              ])
            }
          >
            Add Paper
          </Button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40 border-b border-border">
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Subject</th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground w-[140px]">Date</th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground w-[120px]">Start</th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground w-[140px]">Duration</th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground w-[140px]">Marks</th>
              {!readOnly && <th className="px-3 py-2 w-[80px]" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {papers.map((p, idx) => (
              <tr key={idx} className="hover:bg-muted/20">
                <td className="px-3 py-2">
                  {readOnly ? (
                    <span className="text-sm">{p.subject}</span>
                  ) : (
                    <SelectInput
                      label=""
                      options={SUBJECTS.map((s) => ({ label: s, value: s }))}
                      value={p.subject}
                      onChange={(e) => {
                        const next = [...papers];
                        next[idx] = { ...next[idx], subject: e.target.value };
                        onChange(next);
                      }}
                    />
                  )}
                </td>
                <td className="px-3 py-2">
                  {readOnly ? (
                    <span className="font-mono text-xs">{p.date}</span>
                  ) : (
                    <Input
                      label=""
                      type="date"
                      value={p.date}
                      onChange={(e) => {
                        const next = [...papers];
                        next[idx] = { ...next[idx], date: e.target.value };
                        onChange(next);
                      }}
                    />
                  )}
                </td>
                <td className="px-3 py-2">
                  {readOnly ? (
                    <span className="font-mono text-xs">{p.startTime}</span>
                  ) : (
                    <Input
                      label=""
                      type="time"
                      value={p.startTime}
                      onChange={(e) => {
                        const next = [...papers];
                        next[idx] = { ...next[idx], startTime: e.target.value };
                        onChange(next);
                      }}
                    />
                  )}
                </td>
                <td className="px-3 py-2">
                  {readOnly ? (
                    <span className="font-mono text-xs">{p.durationMinutes} min</span>
                  ) : (
                    <Input
                      label=""
                      type="number"
                      value={String(p.durationMinutes)}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        const next = [...papers];
                        next[idx] = { ...next[idx], durationMinutes: Number.isFinite(v) ? v : 90 };
                        onChange(next);
                      }}
                    />
                  )}
                </td>
                <td className="px-3 py-2">
                  {readOnly ? (
                    <span className="font-mono text-xs">{p.totalMarks}</span>
                  ) : (
                    <Input
                      label=""
                      type="number"
                      value={String(p.totalMarks)}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        const next = [...papers];
                        next[idx] = { ...next[idx], totalMarks: Number.isFinite(v) ? v : 100 };
                        onChange(next);
                      }}
                    />
                  )}
                </td>
                {!readOnly && (
                  <td className="px-3 py-2 text-right">
                    <Button size="sm" variant="ghost" onClick={() => onChange(papers.filter((_, i) => i !== idx))}>
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

