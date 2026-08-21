import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SelectInput } from '@/components/ui/Input';
import { useGetStudentsByClass, useGetExamsByClass } from '../services/classes.service';
import { useGetExamResults } from '@/features/exam/services/exam.service';
import type { AcademicYearItem, ClassItem, PromotionRecord } from '../services/classes.service';

interface PromotionFormValues {
  fromClassId: string;
  toClassId: string;
  academicYearId: string;
  examId: string;
  selectedStudentIds: string[];
}

interface StudentWithMarks {
  id: string;
  name: string;
  rollNo: string;
  totalMarks?: number | null;
  percentage?: number;
  passed?: boolean;
}

export function PromotionPanel({
  classes,
  academicYears,
  promotions,
  isSubmitting = false,
  onSubmit,
}: {
  classes: ClassItem[];
  academicYears: AcademicYearItem[];
  promotions: PromotionRecord[];
  isSubmitting?: boolean;
  onSubmit: (values: { fromClassId: string; toClassId: string; promotedCount: number; academicYearId: string; studentIds: string[] }) => void;
}) {
  const form = useForm<PromotionFormValues>({
    defaultValues: {
      fromClassId: classes[0]?.id ?? '',
      toClassId: classes[1]?.id ?? '',
      academicYearId: academicYears.find((y) => y.status === 'active')?.id ?? academicYears[0]?.id ?? '',
      examId: '',
      selectedStudentIds: [],
    },
  });

  const [selectAll, setSelectAll] = useState(false);
  const watchedFromClass = form.watch('fromClassId');
  const watchedExamId = form.watch('examId');
  const selectedIds = form.watch('selectedStudentIds');

  const { data: sourceStudents = [], isLoading: isStudentsLoading } = useGetStudentsByClass(watchedFromClass);
  const { data: classExams = [] } = useGetExamsByClass(watchedFromClass);
  const { data: examResults = [] } = useGetExamResults({ examId: watchedExamId || undefined });

  const selectedExam = classExams.find((e) => e.id === watchedExamId);

  const studentsWithMarks: StudentWithMarks[] = useMemo(() => {
    if (!watchedExamId) {
      return sourceStudents.map((s) => ({ ...s, totalMarks: null, percentage: undefined, passed: undefined }));
    }
    const resultsMap = new Map(examResults.map((r) => [r.rollNo, r.total]));
    return sourceStudents.map((s) => {
      const total = resultsMap.get(s.rollNo);
      const percentage = total != null && selectedExam ? (total / selectedExam.totalMarks) * 100 : null;
      const passed = percentage != null ? percentage >= selectedExam!.passPercentage : undefined;
      return { ...s, totalMarks: total ?? null, percentage: percentage ?? undefined, passed };
    });
  }, [sourceStudents, examResults, watchedExamId, selectedExam]);

  useEffect(() => {
    if (selectAll) {
      form.setValue('selectedStudentIds', studentsWithMarks.map((s) => s.id));
    }
  }, [selectAll, studentsWithMarks]);

  useEffect(() => {
    setSelectAll(selectedIds.length === studentsWithMarks.length && studentsWithMarks.length > 0);
  }, [selectedIds, studentsWithMarks]);

  const toggleStudent = (id: string) => {
    const current = form.getValues('selectedStudentIds');
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    form.setValue('selectedStudentIds', next);
  };

  const handleSubmit = (values: PromotionFormValues) => {
    if (values.selectedStudentIds.length === 0) return;
    onSubmit({
      fromClassId: values.fromClassId,
      toClassId: values.toClassId,
      promotedCount: values.selectedStudentIds.length,
      academicYearId: values.academicYearId,
      studentIds: values.selectedStudentIds,
    });
  };

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const passCount = studentsWithMarks.filter((s) => s.passed === true).length;
  const failCount = studentsWithMarks.filter((s) => s.passed === false).length;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[380px,1fr] gap-6">
      <Card className="p-5 space-y-4">
        <h3 className="text-base font-semibold">Promote Students</h3>
        <SelectInput
          label="From Class"
          options={classes.map((c) => ({ label: c.name, value: c.id }))}
          value={watchedFromClass}
          onChange={(e) => {
            form.setValue('fromClassId', e.target.value);
            form.setValue('selectedStudentIds', []);
            form.setValue('examId', '');
            setSelectAll(false);
          }}
        />
        <SelectInput label="To Class" options={classes.map((c) => ({ label: c.name, value: c.id }))} value={form.watch('toClassId')} onChange={(e) => form.setValue('toClassId', e.target.value)} />
        <SelectInput label="Academic Year" options={academicYears.map((y) => ({ label: y.name, value: y.id }))} value={form.watch('academicYearId')} onChange={(e) => form.setValue('academicYearId', e.target.value)} />

        <SelectInput
          label="Exam (optional — for marks & pass/fail)"
          options={[{ label: '— No exam —', value: '' }, ...classExams.map((e) => ({ label: `${e.name} (${e.term})`, value: e.id }))]}
          value={watchedExamId}
          onChange={(e) => {
            form.setValue('examId', e.target.value);
            form.setValue('selectedStudentIds', []);
            setSelectAll(false);
          }}
        />

        {selectedExam ? (
          <div className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            Pass: {selectedExam.passPercentage}% | Total: {selectedExam.totalMarks}
            {watchedExamId ? ` | ${passCount} passed, ${failCount} failed` : ''}
          </div>
        ) : null}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              Select Students <span className="text-muted-foreground">({selectedIds.length} selected)</span>
            </label>
            {studentsWithMarks.length > 0 ? (
              <button
                type="button"
                className="text-xs text-primary hover:underline"
                onClick={() => setSelectAll(!selectAll)}
              >
                {selectAll ? 'Deselect All' : 'Select All'}
              </button>
            ) : null}
          </div>

          {isStudentsLoading ? (
            <div className="text-sm text-muted-foreground py-2">Loading students...</div>
          ) : studentsWithMarks.length === 0 ? (
            <div className="text-sm text-muted-foreground py-2">No active students in this class.</div>
          ) : (
            <div className="max-h-64 overflow-y-auto rounded-lg border p-2 space-y-1">
              {studentsWithMarks.map((student) => (
                <label
                  key={student.id}
                  className={`flex items-center gap-2 rounded px-2 py-1.5 text-sm cursor-pointer ${
                    student.passed === true
                      ? 'hover:bg-green-50 dark:hover:bg-green-900/20'
                      : student.passed === false
                        ? 'hover:bg-red-50 dark:hover:bg-red-900/20'
                        : 'hover:bg-accent'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    checked={selectedIds.includes(student.id)}
                    onChange={() => toggleStudent(student.id)}
                  />
                  <span className="flex-1 truncate">{student.name}</span>
                  {student.rollNo ? (
                    <span className="text-xs text-muted-foreground shrink-0">#{student.rollNo}</span>
                  ) : null}
                  {watchedExamId && student.totalMarks != null ? (
                    <>
                      <span className="text-xs font-mono shrink-0">
                        {student.totalMarks}/{selectedExam?.totalMarks}
                      </span>
                      <span className={`text-xs font-medium shrink-0 ${student.passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {student.passed ? 'Pass' : 'Fail'}
                      </span>
                    </>
                  ) : watchedExamId && student.totalMarks == null ? (
                    <span className="text-xs text-muted-foreground shrink-0">No result</span>
                  ) : null}
                </label>
              ))}
            </div>
          )}
        </div>

        <Button
          className="w-full"
          isLoading={isSubmitting}
          disabled={selectedIds.length === 0}
          onClick={form.handleSubmit(handleSubmit)}
        >
          Promote {selectedIds.length > 0 ? `${selectedIds.length} Student${selectedIds.length !== 1 ? 's' : ''}` : 'Students'}
        </Button>
      </Card>

      <Card className="p-5">
        <h3 className="text-base font-semibold mb-4">Promotion History</h3>
        <div className="space-y-3">
          {promotions.length === 0 ? (
            <div className="text-sm text-muted-foreground">No promotions recorded yet.</div>
          ) : (
            promotions.map((item) => {
              const from = classes.find((c) => c.id === item.fromClassId)?.name ?? item.fromClassId;
              const to = classes.find((c) => c.id === item.toClassId)?.name ?? item.toClassId;
              const year = academicYears.find((y) => y.id === item.academicYearId)?.name ?? item.academicYearId;
              const isExpanded = expandedId === item.id;
              const promoted = item.promotedStudents ?? [];
              const retained = item.retainedStudents ?? [];
              const hasStudentDetails = promoted.length > 0 || retained.length > 0;
              const hasMarks = promoted.some((s) => s.totalMarks != null) || retained.some((s) => s.totalMarks != null);

              return (
                <div key={item.id} className="rounded-lg border p-3 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="font-medium">
                        {from} &rarr; {to}
                        {item.mode ? (
                          <span className="ml-2 text-xs font-normal text-muted-foreground">({item.mode})</span>
                        ) : null}
                      </div>
                      <div className="text-muted-foreground">
                        {item.promotedCount} student{item.promotedCount !== 1 ? 's' : ''} promoted in {year}
                        {item.retainedCount ? `, ${item.retainedCount} retained` : ''}
                      </div>
                    </div>
                    {hasStudentDetails ? (
                      <button
                        type="button"
                        className="mt-0.5 rounded p-1 text-muted-foreground hover:bg-accent shrink-0"
                        onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      >
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>
                    ) : null}
                  </div>

                  {isExpanded && hasStudentDetails ? (
                    <div className="mt-3 space-y-2 border-t pt-3">
                      {promoted.length > 0 ? (
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wide text-green-600 dark:text-green-400 mb-1">
                            Promoted ({promoted.length})
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {promoted.map((s) => (
                              <span
                                key={s.id}
                                className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-300"
                              >
                                {s.name}
                                {s.rollNo ? <span className="text-green-500 dark:text-green-400">#{s.rollNo}</span> : null}
                                {hasMarks && s.totalMarks != null ? (
                                  <span className="font-mono text-green-600 dark:text-green-400">{s.totalMarks}</span>
                                ) : null}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : null}
                      {retained.length > 0 ? (
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400 mb-1">
                            Retained ({retained.length})
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {retained.map((s) => (
                              <span
                                key={s.id}
                                className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                              >
                                {s.name}
                                {s.rollNo ? <span className="text-amber-500 dark:text-amber-400">#{s.rollNo}</span> : null}
                                {hasMarks && s.totalMarks != null ? (
                                  <span className="font-mono text-amber-600 dark:text-amber-400">{s.totalMarks}</span>
                                ) : null}
                                {hasMarks ? (
                                  s.passed ? (
                                    <span className="text-green-600 dark:text-green-400">Pass</span>
                                  ) : (
                                    <span className="text-red-600 dark:text-red-400">Fail</span>
                                  )
                                ) : null}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}
