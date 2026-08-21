import { ArrowLeft, Save, Send } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/Badge';
import { useAuth } from '@/hooks';
import { useGetExamById } from '@/features/exam/services/exam.service';
import { useGetStudentsByClass } from '@/features/classes/services/classes.service';
import {
  useGetScoreCardsByExam,
  useSaveScoreCard,
  usePublishScoreCards,
} from '../services/score-card.service';
import type { ScoreCardItem } from '../services/score-card.service';

function calcGrade(percentage: number): string {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  if (percentage >= 35) return 'E';
  return 'F';
}

interface StudentRow {
  studentId: string;
  studentName: string;
  rollNo: string;
  marks: Record<string, string>;
  existingScoreCardId?: string;
  status: 'draft' | 'published';
}

export default function ScoreCardEntryPage() {
  const navigate = useNavigate();
  const { examId } = useParams();
  const { isManagement } = useAuth();

  const examQuery = useGetExamById({ examId });
  const exam = examQuery.data;

  const studentsQuery = useGetStudentsByClass(exam?.classId);
  const students = studentsQuery.data ?? [];

  const scoreCardsQuery = useGetScoreCardsByExam(examId ?? '');
  const existingCards = scoreCardsQuery.data ?? [];

  const saveMutation = useSaveScoreCard();
  const publishMutation = usePublishScoreCards();

  const papers = useMemo(() => exam?.papers ?? [], [exam]);

  const [studentRows, setStudentRows] = useState<StudentRow[]>([]);

  useEffect(() => {
    if (students.length === 0) return;

    setStudentRows(
      students.map((s) => {
        const existing = existingCards.find((c) => c.studentId === s.id);
        const marks: Record<string, string> = {};
        papers.forEach((p) => {
          const item = existing?.items.find((i) => i.examPaperId === p.subject);
          marks[p.subject] = item != null ? String(item.obtainedMarks) : '';
        });
        return {
          studentId: s.id,
          studentName: s.name,
          rollNo: s.rollNo,
          marks,
          existingScoreCardId: existing?.id,
          status: existing?.status ?? 'draft',
        };
      })
    );
  }, [students, existingCards, papers]);

  const handleMarkChange = useCallback(
    (studentId: string, subject: string, value: string) => {
      setStudentRows((prev) =>
        prev.map((row) =>
          row.studentId === studentId ? { ...row, marks: { ...row.marks, [subject]: value } } : row
        )
      );
    },
    []
  );

  const calcStudentTotals = useCallback(
    (row: StudentRow) => {
      let totalObtained = 0;
      let totalMax = 0;
      papers.forEach((p) => {
        const obtained = parseFloat(row.marks[p.subject]) || 0;
        totalObtained += obtained;
        totalMax += p.totalMarks;
      });
      const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
      return {
        totalObtained,
        totalMax,
        percentage: Math.round(percentage * 100) / 100,
        grade: calcGrade(percentage),
      };
    },
    [papers]
  );

  const handleSave = useCallback(
    async (row: StudentRow) => {
      if (!examId || !exam) return;
      const items: ScoreCardItem[] = papers.map((p) => ({
        examPaperId: p.subject,
        subjectName: p.subject,
        totalMarks: p.totalMarks,
        obtainedMarks: parseFloat(row.marks[p.subject]) || 0,
      }));
      await saveMutation.mutateAsync({
        examId,
        studentId: row.studentId,
        classId: exam.classId,
        items,
      });
    },
    [examId, exam, papers, saveMutation]
  );

  const handlePublishAll = useCallback(async () => {
    const draftIds = existingCards
      .filter((c) => c.status === 'draft')
      .map((c) => c.id);
    if (draftIds.length === 0) return;
    await publishMutation.mutateAsync({ scoreCardIds: draftIds });
  }, [existingCards, publishMutation]);

  if (!exam) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Score Entry"
          actions={
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/score-cards')}>
              Back
            </Button>
          }
        />
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">{examQuery.isLoading ? 'Loading...' : 'Exam not found.'}</p>
        </Card>
      </div>
    );
  }

  const TERM_LABEL: Record<string, string> = { 'term-1': 'Term 1', 'term-2': 'Term 2', final: 'Final' };
  const draftCount = existingCards.filter((c) => c.status === 'draft').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Score Entry"
        description={`${exam.name} - ${TERM_LABEL[exam.term] ?? exam.term} - Class ${exam.classId}-${exam.section}`}
        actions={
          <div className="flex items-center gap-2">
            {isManagement && draftCount > 0 && (
              <Button
                size="sm"
                leftIcon={<Send className="h-4 w-4" />}
                onClick={handlePublishAll}
                disabled={publishMutation.isPending}
              >
                Publish All Drafts ({draftCount})
              </Button>
            )}
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/score-cards')}>
              Back
            </Button>
          </div>
        }
      />

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm border border-border rounded-xl overflow-hidden">
          <thead>
            <tr className="bg-muted/40 border-b border-border">
              <th className="px-4 py-3 text-left font-display font-semibold text-xs uppercase tracking-wide text-muted-foreground">Student</th>
              <th className="px-4 py-3 text-left font-display font-semibold text-xs uppercase tracking-wide text-muted-foreground">Roll No</th>
              {papers.map((p) => (
                <th key={p.subject} className="px-4 py-3 text-center font-display font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  {p.subject}
                  <span className="block text-[10px] font-normal normal-case">Max: {p.totalMarks}</span>
                </th>
              ))}
              <th className="px-4 py-3 text-center font-display font-semibold text-xs uppercase tracking-wide text-muted-foreground">Total</th>
              <th className="px-4 py-3 text-center font-display font-semibold text-xs uppercase tracking-wide text-muted-foreground">%</th>
              <th className="px-4 py-3 text-center font-display font-semibold text-xs uppercase tracking-wide text-muted-foreground">Grade</th>
              <th className="px-4 py-3 text-center font-display font-semibold text-xs uppercase tracking-wide text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-right font-display font-semibold text-xs uppercase tracking-wide text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {studentRows.length === 0 ? (
              <tr>
                <td colSpan={papers.length + 6} className="px-4 py-16 text-center text-muted-foreground">
                  {studentsQuery.isLoading ? 'Loading students...' : 'No students found for this class.'}
                </td>
              </tr>
            ) : (
              studentRows.map((row) => {
                const totals = calcStudentTotals(row);
                return (
                  <tr key={row.studentId} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{row.studentName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.rollNo}</td>
                    {papers.map((p) => (
                      <td key={p.subject} className="px-4 py-3">
                        <Input
                          type="number"
                          min={0}
                          max={p.totalMarks}
                          value={row.marks[p.subject] ?? ''}
                          onChange={(e) => handleMarkChange(row.studentId, p.subject, e.target.value)}
                          className="h-8 w-20 text-center mx-auto"
                          placeholder="0"
                        />
                      </td>
                    ))}
                    <td className="px-4 py-3 text-center font-mono text-xs font-semibold">{totals.totalObtained}/{totals.totalMax}</td>
                    <td className="px-4 py-3 text-center font-mono text-xs">{totals.percentage}%</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-primary/10 text-primary">
                        {totals.grade}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isManagement && (
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<Save className="h-3.5 w-3.5" />}
                          onClick={() => handleSave(row)}
                          disabled={saveMutation.isPending}
                        >
                          Save
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
