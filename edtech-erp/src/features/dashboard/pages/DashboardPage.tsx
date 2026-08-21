import { useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  Users, GraduationCap, CreditCard, TrendingUp, UserCheck,
  BookOpen, Bell, ArrowUpRight, Calendar, Clock,
} from 'lucide-react';
import { Card, StatCard, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/shared/PageHeader';
import { useAuth } from '@/hooks';
import { formatCurrency, formatRelativeTime } from '@/utils';
import {
  useDashboardStats,
  useEnrollmentTrend,
  useAttendanceSummary,
  useRecentActivity,
  mapDashboardStat,
} from '../services/dashboard.service';

// ─── Mock data ──────────────────────────────────────────────────────────────────
const enrollmentStatic = [
  { month: 'Apr', students: 820, target: 850 },
  { month: 'May', students: 845, target: 860 },
  { month: 'Jun', students: 790, target: 870 },
  { month: 'Jul', students: 860, target: 880 },
  { month: 'Aug', students: 910, target: 900 },
  { month: 'Sep', students: 945, target: 920 },
  { month: 'Oct', students: 960, target: 940 },
  { month: 'Nov', students: 980, target: 960 },
  { month: 'Dec', students: 1020, target: 980 },
  { month: 'Jan', students: 1050, target: 1000 },
  { month: 'Feb', students: 1080, target: 1020 },
  { month: 'Mar', students: 1105, target: 1040 },
];

const feeData = [
  { month: 'Oct', collected: 420000, pending: 85000 },
  { month: 'Nov', collected: 395000, pending: 72000 },
  { month: 'Dec', collected: 440000, pending: 60000 },
  { month: 'Jan', collected: 480000, pending: 55000 },
  { month: 'Feb', collected: 510000, pending: 48000 },
  { month: 'Mar', collected: 525000, pending: 42000 },
];

const attendanceStatic = [
  { name: 'Present', value: 87, color: '#10b981' },
  { name: 'Absent', value: 8, color: '#f43f5e' },
  { name: 'Late', value: 5, color: '#f59e0b' },
];

const subjectData = [
  { subject: 'Maths', avg: 78 },
  { subject: 'Science', avg: 82 },
  { subject: 'English', avg: 74 },
  { subject: 'History', avg: 69 },
  { subject: 'Hindi', avg: 85 },
  { subject: 'Computer', avg: 91 },
];

const recentActivitiesStatic = [
  { id: '1', user: 'Priya Sharma', role: 'Admin', action: 'Added 12 new students to Class 10-A', time: new Date(Date.now() - 8 * 60 * 1000).toISOString(), type: 'create' as const },
  { id: '2', user: 'Ramesh Kumar', role: 'Teacher', action: 'Marked attendance for Class 9-B', time: new Date(Date.now() - 25 * 60 * 1000).toISOString(), type: 'update' as const },
  { id: '3', user: 'Finance Team', role: 'Admin', action: 'Generated fee invoices for March 2025', time: new Date(Date.now() - 1.5 * 3600 * 1000).toISOString(), type: 'create' as const },
  { id: '4', user: 'Sunita Verma', role: 'Teacher', action: 'Published homework for Class 8 — Science Chapter 5', time: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), type: 'create' as const },
  { id: '5', user: 'System', role: 'Auto', action: 'Sent attendance alerts to 14 parents', time: new Date(Date.now() - 5 * 3600 * 1000).toISOString(), type: 'other' as const },
  { id: '6', user: 'Arjun Singh', role: 'Admin', action: 'Updated timetable for Term 2', time: new Date(Date.now() - 8 * 3600 * 1000).toISOString(), type: 'update' as const },
];

const upcomingEvents = [
  { id: '1', title: 'Annual Sports Day', date: '2025-04-18', type: 'event', color: 'bg-violet-500' },
  { id: '2', title: 'Class 10 Board Exam Prep', date: '2025-04-20', type: 'exam', color: 'bg-rose-500' },
  { id: '3', title: 'Parent-Teacher Meeting', date: '2025-04-22', type: 'meeting', color: 'bg-amber-500' },
  { id: '4', title: 'Science Exhibition', date: '2025-04-25', type: 'event', color: 'bg-emerald-500' },
  { id: '5', title: 'Fee Due Date — April', date: '2025-04-30', type: 'fee', color: 'bg-blue-500' },
];

// Fallback stats when the API has no data yet
const fallbackStats = [
  {
    label: 'Total Students',
    value: '1,105',
    change: 4.2,
    changeType: 'positive' as const,
    icon: <Users className="h-5 w-5" />,
    iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  },
  {
    label: "Today's Attendance",
    value: '87%',
    change: 2.1,
    changeType: 'positive' as const,
    icon: <UserCheck className="h-5 w-5" />,
    iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  {
    label: 'Fee Collected',
    value: '₹5.25L',
    change: 8.4,
    changeType: 'positive' as const,
    icon: <CreditCard className="h-5 w-5" />,
    iconBg: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
  },
  {
    label: 'Active Teachers',
    value: '68',
    change: 1.5,
    changeType: 'positive' as const,
    icon: <GraduationCap className="h-5 w-5" />,
    iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  },
  {
    label: 'Active Classes',
    value: '42',
    change: 0,
    changeType: 'neutral' as const,
    icon: <BookOpen className="h-5 w-5" />,
    iconBg: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400',
  },
  {
    label: 'Pending Notices',
    value: '7',
    change: -2,
    changeType: 'negative' as const,
    icon: <Bell className="h-5 w-5" />,
    iconBg: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
  },
];

// ─── Custom tooltip for recharts ────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-xl shadow-elevated px-3 py-2.5 text-xs">
      <p className="font-semibold mb-1.5">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full inline-block" style={{ backgroundColor: p.color }} />
          {p.name}: <span className="font-medium">{typeof p.value === 'number' && p.value > 10000 ? formatCurrency(p.value) : p.value}</span>
        </p>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { user, isManagement, isStudent, isParent } = useAuth();
  const statsQuery = useDashboardStats(user?.role);
  const enrollmentQuery = useEnrollmentTrend();
  const attendanceQuery = useAttendanceSummary();
  const activityQuery = useRecentActivity();

  const stats = useMemo(() => {
    const apiStats = statsQuery.data?.stats;
    return apiStats?.length ? apiStats.map(mapDashboardStat) : fallbackStats;
  }, [statsQuery.data]);

  const enrollmentData = useMemo(
    () => (enrollmentQuery.data?.length ? enrollmentQuery.data : enrollmentStatic),
    [enrollmentQuery.data]
  );

  const attendanceData = useMemo(() => {
    const points = attendanceQuery.data;
    if (!points?.length) return attendanceStatic;
    const latest = points[points.length - 1];
    const present = latest.percentage;
    return [
      { name: 'Present', value: present, color: '#10b981' },
      { name: 'Absent', value: 100 - present, color: '#f43f5e' },
    ];
  }, [attendanceQuery.data]);

  const recentActivities = useMemo(() => {
    const items = activityQuery.data;
    if (!items?.length) return recentActivitiesStatic;
    return items.map((a) => ({
      id: a.id,
      user: a.user,
      role: a.module,
      action: a.action,
      time: a.timestamp,
      type: a.type as 'create' | 'update' | 'other',
    }));
  }, [activityQuery.data]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting}, ${user?.name?.split(' ')[0] ?? 'there'} 👋`}
        description={
          isStudent ? "Here's a summary of your academic progress."
          : isParent ? "Here's what's happening with your children today."
          : "Here's what's happening at your institution today."
        }
        actions={
          isManagement ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" leftIcon={<Calendar className="h-4 w-4" />}>
                April 2025
              </Button>
              <Button size="sm" leftIcon={<TrendingUp className="h-4 w-4" />}>
                View Reports
              </Button>
            </div>
          ) : isStudent ? (
            <Button variant="outline" size="sm" leftIcon={<BookOpen className="h-4 w-4" />}
              onClick={() => window.location.href = '/student/attendance'}>
              My Attendance
            </Button>
          ) : isParent ? (
            <Button variant="outline" size="sm" leftIcon={<Users className="h-4 w-4" />}
              onClick={() => window.location.href = '/parent-portal'}>
              View Children
            </Button>
          ) : null
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} isLoading={statsQuery.isLoading} className="xl:col-span-1" />
        ))}
      </div>

      {/* Student-specific quick actions */}
      {isStudent && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => window.location.href = '/student/attendance'}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium">My Attendance</p>
                <p className="text-xs text-muted-foreground">View your attendance record</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => window.location.href = '/student/fees'}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium">My Fees</p>
                <p className="text-xs text-muted-foreground">Check fee status & pay</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => window.location.href = '/student/exams'}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium">My Exams</p>
                <p className="text-xs text-muted-foreground">View upcoming & past exams</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Parent-specific quick actions */}
      {isParent && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => window.location.href = '/parent-portal'}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium">My Children</p>
                <p className="text-xs text-muted-foreground">View progress & details</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => window.location.href = '/parent-portal/fees'}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium">Fee Payments</p>
                <p className="text-xs text-muted-foreground">Pay fees online</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => window.location.href = '/notices'}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Bell className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium">Noticeboard</p>
                <p className="text-xs text-muted-foreground">View school notices</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Charts Row 1 — admin/teacher only */}
      {isManagement && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Enrollment Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Student Enrollment Trend</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">12-month enrollment vs target</p>
              </div>
              <Badge variant="success" dot>On Track</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={enrollmentData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="students"
                  name="Students"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  fill="url(#gradStudents)"
                />
                <Area
                  type="monotone"
                  dataKey="target"
                  name="Target"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  fill="none"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Attendance Pie */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Attendance</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">School-wide breakdown</p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={attendanceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={72}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {attendanceData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) =>
                      active && payload?.length ? (
                        <div className="bg-popover border border-border rounded-lg px-3 py-2 text-xs shadow-elevated">
                          <p style={{ color: (payload[0].payload as typeof attendanceData[0]).color }} className="font-semibold">
                            {payload[0].name}: {payload[0].value}%
                          </p>
                        </div>
                      ) : null
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-1.5 w-full mt-2">
                {attendanceData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      {d.name}
                    </span>
                    <span className="font-semibold">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      )}

      {/* Charts Row 2 — admin/teacher only */}
      {isManagement && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Fee Collection */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Fee Collection Overview</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Last 6 months</p>
              </div>
              <Button variant="ghost" size="sm" rightIcon={<ArrowUpRight className="h-3.5 w-3.5" />}>
                Details
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={feeData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v / 100000}L`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="collected" name="Collected" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" name="Pending" fill="hsl(var(--destructive) / 0.5)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subject Performance */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Subject Performance</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Average scores across classes</p>
              </div>
              <Badge variant="info">Term 2</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={subjectData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis dataKey="subject" type="category" tick={{ fontSize: 11 }} width={60} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="avg" name="Avg Score" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      )}

      {/* Activity + Events */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Recent Activity */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-0 divide-y divide-border">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 py-3.5">
                  <Avatar name={activity.user} size="sm" />
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className="text-sm font-medium">{activity.user}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {activity.action}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatRelativeTime(activity.time)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Upcoming Events</CardTitle>
              <Button variant="ghost" size="sm">Calendar</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <div className={`h-9 w-1.5 rounded-full flex-shrink-0 ${event.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.date).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </p>
                  </div>
                  <Badge variant="ghost" className="capitalize text-[10px] flex-shrink-0">
                    {event.type}
                  </Badge>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" size="sm">
              View Full Calendar
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
