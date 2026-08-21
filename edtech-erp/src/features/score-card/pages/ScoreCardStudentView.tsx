import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { useGetAcademicYears } from '@/features/classes/services/classes.service';
import { useGetScoreCardsByStudent } from '../services/score-card.service';

export default function ScoreCardStudentView() {
  const { studentId } = useParams();
  const { data: academicYears = [] } = useGetAcademicYears();
  const [academicYearFilter, setAcademicYearFilter] = useState<string>('');
  const { data: scoreCards = [], isLoading } = useGetScoreCardsByStudent(studentId ?? '', academicYearFilter || undefined);

  const selectClass2 =
    'h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary w-48';

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Score Cards"
        description="View your exam results and academic performance"
      />

      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-muted-foreground">Academic Year</label>
        <select className={selectClass2} value={academicYearFilter} onChange={(e) => setAcademicYearFilter(e.target.value)}>
          <option value="">All Years</option>
          {academicYears.map((y) => (
            <option key={y.id} value={y.id}>{y.name}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading score cards...</div>
      ) : scoreCards.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No score cards found.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {scoreCards.map((card) => (
            <Card key={card.id} className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold">{card.examName ?? 'Exam'}</h3>
                  <p className="text-sm text-muted-foreground">
                    {card.className ? `Class ${card.className}` : ''}
                    {card.academicYearName ? ` | ${card.academicYearName}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={card.status === 'published' ? 'active' : 'pending'} />
                  <div className="text-right">
                    <p className="text-2xl font-bold">{card.obtainedMarks}/{card.totalMarks}</p>
                    <p className="text-sm text-muted-foreground">{card.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              {card.items.length > 0 ? (
                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left px-4 py-2 font-medium">Subject</th>
                        <th className="text-right px-4 py-2 font-medium">Total</th>
                        <th className="text-right px-4 py-2 font-medium">Obtained</th>
                        <th className="text-right px-4 py-2 font-medium">Percentage</th>
                        <th className="text-left px-4 py-2 font-medium">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {card.items.map((item, idx) => {
                        const pct = item.totalMarks > 0 ? ((item.obtainedMarks / item.totalMarks) * 100).toFixed(1) : '0';
                        return (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                            <td className="px-4 py-2 font-medium">{item.subjectName}</td>
                            <td className="px-4 py-2 text-right">{item.totalMarks}</td>
                            <td className="px-4 py-2 text-right font-medium">{item.obtainedMarks}</td>
                            <td className="px-4 py-2 text-right">
                              <span className={Number(pct) >= 50 ? 'text-green-600' : Number(pct) >= 35 ? 'text-amber-600' : 'text-red-600'}>
                                {pct}%
                              </span>
                            </td>
                            <td className="px-4 py-2 text-muted-foreground">{item.remarks ?? item.grade ?? '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t bg-muted/50 font-semibold">
                        <td className="px-4 py-2">Total</td>
                        <td className="px-4 py-2 text-right">{card.totalMarks}</td>
                        <td className="px-4 py-2 text-right">{card.obtainedMarks}</td>
                        <td className="px-4 py-2 text-right">{card.percentage.toFixed(1)}%</td>
                        <td className="px-4 py-2">{card.grade ?? '—'}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No subject-wise details available.</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
