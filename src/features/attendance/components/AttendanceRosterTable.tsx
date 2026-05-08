import { useMemo } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { StatusBadge } from '@/components/ui/Badge';
import type { AttendanceStatus, StudentRosterItem } from '../services/attendance.service';

export function AttendanceRosterTable({
  students,
  attendance,
  onMark,
  readOnly = false,
}: {
  students: StudentRosterItem[];
  attendance: Record<string, AttendanceStatus>;
  onMark: (studentId: string, status: AttendanceStatus) => void;
  readOnly?: boolean;
}) {
  const counts = useMemo(() => {
    return Object.values(attendance).reduce(
      (acc, s) => {
        acc[s] = (acc[s] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  }, [attendance]);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40 border-b border-border">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">#</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Student</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Roll No</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mark</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {students.map((s, idx) => (
              <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 text-muted-foreground text-xs">{idx + 1}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={s.name} size="sm" />
                    <span className="font-medium">{s.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{s.rollNo}</td>
                <td className="px-4 py-3 text-center">
                  <StatusBadge status={attendance[s.id] ?? 'present'} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1.5">
                    {(['present', 'absent', 'late'] as const).map((status) => (
                      <button
                        key={status}
                        disabled={readOnly}
                        onClick={() => onMark(s.id, status)}
                        className={`h-8 px-3 rounded-md text-xs font-medium transition-all border ${
                          (attendance[s.id] ?? 'present') === status
                            ? status === 'present'
                              ? 'bg-emerald-500 text-white border-emerald-500'
                              : status === 'absent'
                                ? 'bg-red-500 text-white border-red-500'
                                : 'bg-amber-500 text-white border-amber-500'
                            : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <p className="text-muted-foreground">
          {students.length} students · <span className="text-emerald-600 font-medium">{counts.present ?? 0} present</span>
          {' · '}<span className="text-red-600 font-medium">{counts.absent ?? 0} absent</span>
          {' · '}<span className="text-amber-600 font-medium">{counts.late ?? 0} late</span>
        </p>
        <p className="font-semibold text-primary">
          {students.length ? Math.round(((counts.present ?? 0) / students.length) * 100) : 0}% Attendance
        </p>
      </div>
    </div>
  );
}

