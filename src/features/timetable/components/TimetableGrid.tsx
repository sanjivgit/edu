import type { TimetableDay, TimetableRecord } from '../services/timetable.service';

const DAYS: TimetableDay[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS = [
  { id: 1, time: '8:00–8:45' },
  { id: 2, time: '8:45–9:30' },
  { id: 3, time: '9:30–10:15' },
  { id: 4, time: '10:15–10:30', isBreak: true, label: '☕ Short Break' },
  { id: 5, time: '10:30–11:15' },
  { id: 6, time: '11:15–12:00' },
  { id: 7, time: '12:00–12:45' },
  { id: 8, time: '12:45–1:30', isBreak: true, label: '🍱 Lunch Break' },
  { id: 9, time: '1:30–2:15' },
  { id: 10, time: '2:15–3:00' },
];

const SUBJ_COLOR: Record<string, string> = {
  Mathematics: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300',
  Science: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300',
  English: 'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300',
  Hindi: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300',
  History: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300',
  Computer: 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300',
  PE: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300',
  Art: 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300',
};

export function TimetableLegend() {
  return (
    <div className="flex flex-wrap gap-1.5">
      {Object.keys(SUBJ_COLOR).map((s) => (
        <span key={s} className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${SUBJ_COLOR[s]}`}>
          {s}
        </span>
      ))}
    </div>
  );
}

export function TimetableGrid({
  record,
  onCellClick,
}: {
  record: TimetableRecord | null;
  onCellClick?: (payload: { day: TimetableDay; periodId: number; subject?: string; teacher?: string; isEmpty: boolean }) => void;
}) {
  const grid = record?.grid ?? {};
  return (
    <div className="overflow-x-auto rounded-xl border border-border shadow-card">
      <div className="min-w-[860px]">
        <div className="grid bg-card" style={{ gridTemplateColumns: '90px repeat(6,1fr)' }}>
          <div className="bg-muted/40 px-3 py-3 border-b border-r border-border">
            <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Period</span>
          </div>
          {DAYS.map((d) => (
            <div key={d} className="bg-muted/40 px-2 py-3 border-b border-r border-border last:border-r-0 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{d.slice(0, 3)}</p>
              <p className="text-[9px] text-muted-foreground/50 mt-0.5">{d}</p>
            </div>
          ))}

          {PERIODS.map((p) => {
            if (p.isBreak)
              return (
                <div
                  key={p.id}
                  className="bg-muted/20 py-2 border-b border-border text-center text-[10px] font-medium text-muted-foreground"
                  style={{ gridColumn: '1 / -1' }}
                >
                  {p.label} · {p.time}
                </div>
              );
            return (
              <div key={p.id} className="contents">
                <div className="px-3 py-2 border-b border-r border-border bg-muted/10">
                  <p className="text-[10px] font-bold text-muted-foreground">P{p.id}</p>
                  <p className="text-[9px] text-muted-foreground/60 mt-0.5">{p.time}</p>
                </div>
                {DAYS.map((d) => {
                  const cell = grid[d]?.[p.id];
                  const subject = cell?.subject ?? '';
                  const teacher = cell?.teacher ?? '';
                  const isEmpty = !subject;
                  return (
                    <div
                      key={d}
                      className="px-1.5 py-1.5 border-b border-r border-border last:border-r-0 hover:bg-muted/20 transition-colors cursor-pointer group min-h-[56px]"
                      onClick={() => onCellClick?.({ day: d, periodId: p.id, subject, teacher, isEmpty })}
                    >
                      {!isEmpty ? (
                        <div
                          className={`rounded-md px-1.5 py-1.5 border text-center h-full flex flex-col justify-center ${
                            SUBJ_COLOR[subject] ?? 'bg-muted text-muted-foreground border-border'
                          }`}
                        >
                          <p className="text-[11px] font-semibold leading-tight">{subject}</p>
                          <p className="text-[9px] opacity-60 mt-0.5 leading-tight">{teacher}</p>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <span className="text-[10px] text-muted-foreground/20 group-hover:text-muted-foreground/50 transition-colors">
                            + Add
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

