import type { HolidayRecord } from '../services/holidays.service';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function byMonth(data: HolidayRecord[]) {
  return MONTHS.map((label, index) => ({
    label,
    items: data.filter((item) => new Date(item.startDate).getMonth() === index),
  }));
}

export function HolidaysCalendar({ data }: { data: HolidayRecord[] }) {
  const months = byMonth(data);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {months.map((month) => (
        <div key={month.label} className="rounded-xl border bg-card p-4">
          <div className="mb-3 text-sm font-semibold">{month.label}</div>
          <div className="space-y-2">
            {month.items.length === 0 ? (
              <div className="text-xs text-muted-foreground">No holidays planned</div>
            ) : (
              month.items.map((item) => (
                <div key={item.id} className="rounded-lg border p-2 text-xs">
                  <div className="font-medium">{item.title}</div>
                  <div className="text-muted-foreground">{item.startDate}{item.startDate !== item.endDate ? ` to ${item.endDate}` : ''}</div>
                  <div className="mt-1 uppercase tracking-wide text-[10px] text-primary">{item.type}</div>
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

