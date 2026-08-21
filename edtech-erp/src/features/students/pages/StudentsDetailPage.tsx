import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { CreditCard, GraduationCap, Trophy, User, ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { useAuth } from '@/hooks';
import { useGetStudentById } from '../services/students.service';
import { useGetFees } from '@/features/fees/services/fees.service';
import { useGetPromotions } from '@/features/classes/services/classes.service';
import { useGetAcademicYears } from '@/features/classes/services/classes.service';
import { useGetClasses } from '@/features/classes/services/classes.service';
import { useGetScoreCardsByStudent } from '@/features/score-card/services/score-card.service';

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium mt-0.5">{value || '\u2014'}</p>
    </div>
  );
}

export default function StudentsDetailPage() {
  const navigate = useNavigate();
  const { isStudent, isParent, isManagement } = useAuth();
  const canEdit = isManagement;
  const { id = '' } = useParams();
  const detailQuery = useGetStudentById({ studentId: id });
  const feesQuery = useGetFees(isManagement ? undefined : undefined);
  const promotionsQuery = useGetPromotions();
  const academicYearsQuery = useGetAcademicYears();
  const classesQuery = useGetClasses();
  const scoreCardsQuery = useGetScoreCardsByStudent(id);

  if (!detailQuery.isLoading && !detailQuery.data) return <Navigate to="/students" replace />;
  const student = detailQuery.data;
  if (!student) return null;

  const allFees = feesQuery.data ?? [];
  const allPromotions = promotionsQuery.data ?? [];
  const academicYears = academicYearsQuery.data ?? [];
  const classes = classesQuery.data ?? [];

  const studentFees = allFees.filter(
    (f) => f.studentId === student.id || f.rollNo === student.rollNo || f.studentName === student.name
  );
  const totalPaid = studentFees.filter((f) => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);
  const totalPending = studentFees.filter((f) => f.status === 'pending' || f.status === 'overdue').reduce((sum, f) => sum + f.amount, 0);
  const pendingFees = studentFees.filter((f) => f.status === 'pending' || f.status === 'overdue');

  const studentPromotions = allPromotions.filter((p) =>
    p.promotedStudents?.some((s) => s.id === student.id) ||
    p.retainedStudents?.some((s) => s.id === student.id)
  );

  const canPayFees = isParent || isManagement;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isStudent ? 'My Profile' : 'Student Details'}
        description={isStudent ? 'Your student profile' : 'View complete student profile'}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/students')}>
              Back
            </Button>
            {canEdit && (
              <Button size="sm" onClick={() => navigate(`/students/${student.id}/edit`)}>
                Edit
              </Button>
            )}
          </div>
        }
      />

      {/* Student Header */}
      <Card className="p-5">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
            {student.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="text-lg font-semibold">{student.name}</p>
            <p className="text-sm text-muted-foreground">
              {student.rollNo} &middot; Class {student.classId}-{student.section}
              {student.currentAcademicYearName && (
                <> &middot; {student.currentAcademicYearName}</>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={student.status} />
            {student.gender && (
              <span className="text-sm text-muted-foreground capitalize">{student.gender}</span>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Info */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Personal Information</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Date of Birth" value={student.dob ? new Date(student.dob).toLocaleDateString('en-IN') : ''} />
            <Field label="Gender" value={student.gender ? student.gender.charAt(0).toUpperCase() + student.gender.slice(1) : ''} />
            <Field label="Phone" value={student.phone} />
            <Field label="Email" value={student.email} />
            <Field label="Admission Date" value={student.admissionDate ? new Date(student.admissionDate).toLocaleDateString('en-IN') : ''} />
            <Field label="Academic Year" value={student.currentAcademicYearName} />
            <Field label="Address" value={student.address} />
          </div>
        </Card>

        {/* Fee Summary — only for admin, parent, or student viewing own */}
        {(isManagement || isParent || isStudent) && (
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Fee Summary</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Paid</span>
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                  {'\u20B9'}{totalPaid.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Pending</span>
                <span className={`text-sm font-semibold ${totalPending > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                  {'\u20B9'}{totalPending.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-sm font-medium">Balance Due</span>
                <span className={`text-base font-bold ${totalPending > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                  {'\u20B9'}{totalPending.toLocaleString()}
                </span>
              </div>
              {pendingFees.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pending Fees</p>
                  {pendingFees.map((fee) => (
                    <div key={fee.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-xs">
                      <div>
                        <span className="font-medium capitalize">{fee.feeType}</span>
                        <span className="text-muted-foreground ml-2">Due {new Date(fee.dueDate).toLocaleDateString('en-IN')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{'\u20B9'}{fee.amount.toLocaleString()}</span>
                        <StatusBadge status={fee.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {totalPending > 0 && canPayFees && (
                <Button
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => navigate(`/fees/${student.id}`)}
                >
                  {isParent ? 'Pay Now' : 'Record Payment'}
                </Button>
              )}
              {isStudent && totalPending > 0 && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Contact admin to make a payment
                </p>
              )}
            </div>
          </Card>
        )}

        {/* Promotion History — admin/teacher only */}
        {isManagement && (
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Promotion History</h3>
            </div>
            {studentPromotions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No promotion records found.</p>
            ) : (
              <div className="space-y-2">
                {studentPromotions.map((promo) => {
                  const fromClass = classes.find((c) => c.id === promo.fromClassId)?.name ?? 'Unknown';
                  const toClass = classes.find((c) => c.id === promo.toClassId)?.name ?? 'Unknown';
                  const year = academicYears.find((y) => y.id === promo.academicYearId)?.name ?? '';
                  const wasPromoted = promo.promotedStudents?.some((s) => s.id === student.id);
                  const studentEntry = promo.promotedStudents?.find((s) => s.id === student.id) ?? promo.retainedStudents?.find((s) => s.id === student.id);
                  return (
                    <div key={promo.id} className="rounded-lg border p-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{fromClass} {'\u2192'} {toClass}</span>
                        <span className={`font-medium ${wasPromoted ? 'text-green-600' : 'text-amber-600'}`}>
                          {wasPromoted ? 'Promoted' : 'Retained'}
                        </span>
                      </div>
                      {year && <div className="text-muted-foreground mt-0.5">{year}</div>}
                      {studentEntry?.totalMarks != null && (
                        <div className="text-muted-foreground mt-0.5">Marks: {studentEntry.totalMarks}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Score Cards */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Score Cards</h3>
        </div>
        {(scoreCardsQuery.data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No score cards found.</p>
        ) : (
          <div className="space-y-4">
            {(scoreCardsQuery.data ?? []).map((sc) => (
              <div key={sc.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold">{sc.examName ?? 'Exam'}</p>
                    <p className="text-xs text-muted-foreground">
                      {sc.academicYearName ?? '\u2014'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={sc.status} />
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        {sc.obtainedMarks}/{sc.totalMarks}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {sc.percentage.toFixed(1)}%
                        {sc.grade && ` \u00B7 ${sc.grade}`}
                      </p>
                    </div>
                  </div>
                </div>
                {sc.items.length > 0 && (
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b">
                        <th className="py-1.5 text-left font-medium text-muted-foreground">Subject</th>
                        <th className="py-1.5 text-right font-medium text-muted-foreground">Marks</th>
                        <th className="py-1.5 text-right font-medium text-muted-foreground">Grade</th>
                        <th className="py-1.5 text-left font-medium text-muted-foreground">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sc.items.map((item, idx) => (
                        <tr key={idx} className="border-b last:border-0">
                          <td className="py-1.5 font-medium">{item.subjectName}</td>
                          <td className="py-1.5 text-right font-mono">
                            {item.obtainedMarks}/{item.totalMarks}
                          </td>
                          <td className="py-1.5 text-right">{item.grade ?? '\u2014'}</td>
                          <td className="py-1.5 text-muted-foreground">{item.remarks ?? '\u2014'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {sc.publishedAt && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Published: {new Date(sc.publishedAt).toLocaleDateString('en-IN')}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
