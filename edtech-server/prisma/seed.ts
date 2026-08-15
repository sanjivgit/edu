import {
  PrismaClient,
  UserRole,
  Gender,
  AdmissionStatus,
  AttendanceStatus,
  AssessmentType,
  AssessmentStatus,
  ExamTerm,
  ExamStatus,
  HomeworkStatus,
  SyllabusStatus,
  FeeType,
  PaymentMode,
  PaymentStatus,
  NoticeStatus,
  NoticeCategory,
  AudienceScope,
  DiaryVisibility,
  DiaryStatus,
  HolidayType,
  HolidayStatus,
  TimetableDay,
  TransportStatus,
  AlbumVisibility,
  MediaType,
  LectureType,
  LectureStatus,
  ProductStatus,
  AcademicYearStatus,
  SubjectCategory,
  InvoiceStatus,
  Severity,
  AuditAction,
  AcademicStatus,
  PlanStatus,
  SubscriptionStatus,
  SubscriptionPeriod,
  SubscriptionInvoiceStatus,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const PERMISSIONS = [
  { module: 'dashboard', actions: ['view'] },
  { module: 'classes', actions: ['view', 'create', 'edit', 'delete'] },
  { module: 'admission', actions: ['view', 'create', 'edit', 'delete', 'approve'] },
  { module: 'fees', actions: ['view', 'create', 'edit', 'delete', 'approve'] },
  { module: 'invoice', actions: ['view', 'create', 'edit', 'delete', 'approve'] },
  { module: 'attendance', actions: ['view', 'create', 'edit', 'delete', 'export'] },
  { module: 'timetable', actions: ['view', 'create', 'edit', 'delete'] },
  { module: 'subjects', actions: ['view', 'create', 'edit', 'delete'] },
  { module: 'homework', actions: ['view', 'create', 'edit', 'delete'] },
  { module: 'assessment', actions: ['view', 'create', 'edit', 'delete'] },
  { module: 'exam', actions: ['view', 'create', 'edit', 'delete', 'approve'] },
  { module: 'noticeboard', actions: ['view', 'create', 'edit', 'delete'] },
  { module: 'notifications', actions: ['view', 'create', 'edit', 'delete'] },
  { module: 'reports', actions: ['view', 'export'] },
  { module: 'settings', actions: ['view', 'edit'] },
  { module: 'roles', actions: ['view', 'create', 'edit', 'delete'] },
];

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dateFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

async function main() {
  console.log('🌱 Seeding database...');

  // ── Cleanup ───────────────────────────────────────────────────────────────
  await prisma.auditLog.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.otp.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.galleryMedia.deleteMany();
  await prisma.galleryAlbum.deleteMany();
  await prisma.lecture.deleteMany();
  await prisma.product.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.feeStructure.deleteMany();
  await prisma.invoicePayment.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.routeAssignment.deleteMany();
  await prisma.transportStop.deleteMany();
  await prisma.transportRoute.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.holiday.deleteMany();
  await prisma.diaryEntry.deleteMany();
  await prisma.notice.deleteMany();
  await prisma.timetableCell.deleteMany();
  await prisma.timetable.deleteMany();
  await prisma.examResult.deleteMany();
  await prisma.examPaper.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.assessmentResult.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.homeworkSubmission.deleteMany();
  await prisma.homework.deleteMany();
  await prisma.attendanceEntry.deleteMany();
  await prisma.attendanceSession.deleteMany();
  await prisma.syllabus.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.section.deleteMany();
  await prisma.class.deleteMany();
  await prisma.academicYear.deleteMany();
  await prisma.student.deleteMany();
  await prisma.admission.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.settings.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.subscriptionInvoice.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.billingPlan.deleteMany();
  await prisma.tenant.deleteMany();

  // ── Tenant ────────────────────────────────────────────────────────────────
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Delhi Public School',
      code: 'school-001',
      domain: 'dps.example.com',
      logo: '/logos/dps.svg',
      theme: 'indigo',
      colorMode: 'light',
      tagline: 'Knowledge is Power',
      address: '12, Education Road, New Delhi - 110001',
      phone: '+91 11 1234 5678',
      website: 'https://dps.example.com',
    },
  });

  // ── Billing Plans ─────────────────────────────────────────────────────────
  const freePlan = await prisma.billingPlan.create({
    data: {
      name: 'Free',
      code: 'free',
      description: 'For small schools getting started',
      priceMonthly: 0,
      priceYearly: 0,
      studentLimit: 50,
      teacherLimit: 10,
      storageMb: 500,
      features: JSON.stringify({
        attendance: true,
        homework: true,
        chat: false,
        gallery: true,
        fees: false,
        reports: false,
        liveLectures: false,
        transport: false,
      }),
      isDefault: true,
      status: PlanStatus.active,
      sortOrder: 1,
    },
  });

  const starterPlan = await prisma.billingPlan.create({
    data: {
      name: 'Starter',
      code: 'starter',
      description: 'For growing schools with up to 500 students',
      priceMonthly: 299,
      priceYearly: 2990,
      studentLimit: 500,
      teacherLimit: 50,
      storageMb: 5000,
      features: JSON.stringify({
        attendance: true,
        homework: true,
        chat: true,
        gallery: true,
        fees: true,
        reports: false,
        liveLectures: false,
        transport: false,
      }),
      status: PlanStatus.active,
      sortOrder: 2,
    },
  });

  const proPlan = await prisma.billingPlan.create({
    data: {
      name: 'Pro',
      code: 'pro',
      description: 'Complete school management suite',
      priceMonthly: 799,
      priceYearly: 7990,
      studentLimit: 2000,
      teacherLimit: 200,
      storageMb: 20000,
      features: JSON.stringify({
        attendance: true,
        homework: true,
        chat: true,
        gallery: true,
        fees: true,
        reports: true,
        liveLectures: true,
        transport: true,
      }),
      status: PlanStatus.active,
      sortOrder: 3,
    },
  });

  await prisma.billingPlan.create({
    data: {
      name: 'Enterprise',
      code: 'enterprise',
      description: 'Unlimited everything + priority support',
      priceMonthly: 1999,
      priceYearly: 19990,
      studentLimit: null,
      teacherLimit: null,
      storageMb: 100000,
      features: JSON.stringify({
        attendance: true,
        homework: true,
        chat: true,
        gallery: true,
        fees: true,
        reports: true,
        liveLectures: true,
        transport: true,
      }),
      status: PlanStatus.active,
      sortOrder: 4,
    },
  });

  // ── Subscription ──────────────────────────────────────────────────────────
  const now = new Date();
  const subExpiry = new Date(now);
  subExpiry.setFullYear(subExpiry.getFullYear() + 1);
  const subscription = await prisma.subscription.create({
    data: {
      tenantId: tenant.id,
      planId: proPlan.id,
      status: SubscriptionStatus.active,
      period: SubscriptionPeriod.yearly,
      pricePerPeriod: proPlan.priceYearly,
      currency: 'INR',
      startsAt: now,
      expiresAt: subExpiry,
      autoRenew: true,
      notes: 'Yearly subscription (seeded)',
    },
  });

  await prisma.subscriptionInvoice.create({
    data: {
      invoiceNo: 'SUB-2026-0001',
      subscriptionId: subscription.id,
      tenantId: tenant.id,
      amount: proPlan.priceYearly,
      currency: 'INR',
      period: SubscriptionPeriod.yearly,
      periodStart: now,
      periodEnd: subExpiry,
      status: SubscriptionInvoiceStatus.paid,
      issuedAt: now,
      paidAt: now,
      notes: 'Annual payment received (offline)',
    },
  });

  // ── Roles ─────────────────────────────────────────────────────────────────
  const adminRole = await prisma.role.create({
    data: {
      name: 'Admin',
      description: 'Full administrative access',
      isSystem: true,
      permissions: JSON.stringify(PERMISSIONS),
      tenantId: tenant.id,
    },
  });

  const teacherRole = await prisma.role.create({
    data: {
      name: 'Teacher',
      description: 'Academic operations access',
      isSystem: true,
      tenantId: tenant.id,
      permissions: JSON.stringify(
        PERMISSIONS.filter((p) =>
          ['attendance', 'homework', 'assessment', 'exam', 'subjects', 'noticeboard', 'timetable'].includes(p.module),
        ).map((p) => ({ ...p, actions: p.actions.filter((a) => a !== 'delete') })),
      ),
    },
  });

  const accountantRole = await prisma.role.create({
    data: {
      name: 'Accountant',
      description: 'Finance module access',
      isSystem: true,
      tenantId: tenant.id,
      permissions: JSON.stringify(
        PERMISSIONS.filter((p) => ['fees', 'invoice', 'reports', 'dashboard'].includes(p.module)),
      ),
    },
  });

  await prisma.role.create({
    data: { name: 'Librarian', description: 'Library access', tenantId: tenant.id, permissions: '[]' },
  });

  // ── Users ─────────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('password123', 10);

  const superadmin = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'superadmin@educore.app',
      phone: '+91 9000000001',
      passwordHash,
      role: UserRole.superadmin,
      isEmailVerified: true,
      permissions: JSON.stringify([]),
      lastLoginAt: new Date(),
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: 'Ravi Kumar',
      email: 'admin@demo.school',
      phone: '+91 9000000002',
      passwordHash,
      role: UserRole.admin,
      tenantId: tenant.id,
      roleId: adminRole.id,
      permissions: JSON.stringify([]),
      isEmailVerified: true,
    },
  });

  const teacherUser = await prisma.user.create({
    data: {
      name: 'Priya Sharma',
      email: 'teacher@demo.school',
      phone: '+91 9000000003',
      passwordHash,
      role: UserRole.teacher,
      tenantId: tenant.id,
      roleId: teacherRole.id,
      permissions: JSON.stringify([]),
      isEmailVerified: true,
    },
  });

  const studentUser = await prisma.user.create({
    data: {
      name: 'Aarav Singh',
      email: 'student@demo.school',
      phone: '+91 9000000004',
      passwordHash,
      role: UserRole.student,
      tenantId: tenant.id,
      permissions: JSON.stringify([]),
      isEmailVerified: true,
    },
  });

  const parentUser = await prisma.user.create({
    data: {
      name: 'Suresh Singh',
      email: 'parent@demo.school',
      phone: '+91 9000000005',
      passwordHash,
      role: UserRole.parent,
      tenantId: tenant.id,
      permissions: JSON.stringify([]),
      isEmailVerified: true,
    },
  });

  // ── Academic Year ─────────────────────────────────────────────────────────
  const academicYear = await prisma.academicYear.create({
    data: {
      name: '2025-2026',
      startDate: new Date('2025-04-01'),
      endDate: new Date('2026-03-31'),
      status: AcademicYearStatus.active,
      tenantId: tenant.id,
    },
  });

  // ── Teachers ──────────────────────────────────────────────────────────────
  const teacher = await prisma.teacher.create({
    data: {
      fullName: 'Priya Sharma',
      employeeCode: 'EMP-001',
      phone: '+91 9000000003',
      email: 'teacher@demo.school',
      subject: 'Mathematics',
      tenantId: tenant.id,
      userId: teacherUser.id,
      status: AcademicStatus.active,
    },
  });

  const teachers = [];
  const teacherSeed = [
    { fullName: 'Anil Verma', subject: 'Science', phone: '+91 9810010001' },
    { fullName: 'Meena Iyer', subject: 'English', phone: '+91 9810010002' },
    { fullName: 'Rohit Gupta', subject: 'Hindi', phone: '+91 9810010003' },
    { fullName: 'Kavita Rao', subject: 'History', phone: '+91 9810010004' },
    { fullName: 'Sanjay Malhotra', subject: 'Computer', phone: '+91 9810010005' },
  ];
  for (let i = 0; i < teacherSeed.length; i++) {
    const t = await prisma.teacher.create({
      data: {
        fullName: teacherSeed[i].fullName,
        employeeCode: `EMP-00${i + 2}`,
        phone: teacherSeed[i].phone,
        email: `teacher${i + 2}@demo.school`,
        subject: teacherSeed[i].subject,
        tenantId: tenant.id,
        status: AcademicStatus.active,
      },
    });
    teachers.push(t);
  }

  // ── Classes & Sections ────────────────────────────────────────────────────
  const classNames = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const createdClasses = [];
  for (let i = 0; i < classNames.length; i++) {
    const c = await prisma.class.create({
      data: {
        name: `Class ${classNames[i]}`,
        code: `C${classNames[i]}`,
        tenantId: tenant.id,
        academicYearId: academicYear.id,
        capacity: 40,
        status: AcademicStatus.active,
        classTeacherId: i === 0 ? teacher.id : teachers[i % teachers.length]?.id,
      },
    });
    const sectionA = await prisma.section.create({
      data: { name: 'A', classId: c.id, roomNo: `R${100 + i}`, status: AcademicStatus.active, tenantId: tenant.id },
    });
    const sectionB = await prisma.section.create({
      data: { name: 'B', classId: c.id, roomNo: `R${200 + i}`, status: AcademicStatus.active, tenantId: tenant.id },
    });
    createdClasses.push({ c, sectionA, sectionB });
  }

  // ── Subjects ──────────────────────────────────────────────────────────────
  const subjectSeed = [
    { name: 'Mathematics', code: 'MAT', category: SubjectCategory.core },
    { name: 'Science', code: 'SCI', category: SubjectCategory.core },
    { name: 'English', code: 'ENG', category: SubjectCategory.language },
    { name: 'Hindi', code: 'HIN', category: SubjectCategory.language },
    { name: 'History', code: 'HIS', category: SubjectCategory.core },
    { name: 'Computer', code: 'CSC', category: SubjectCategory.lab },
    { name: 'Physical Education', code: 'PE', category: SubjectCategory.sports },
    { name: 'Art', code: 'ART', category: SubjectCategory.arts },
  ];
  const subjects = [];
  for (let i = 0; i < subjectSeed.length; i++) {
    const s = await prisma.subject.create({
      data: {
        name: subjectSeed[i].name,
        code: subjectSeed[i].code,
        category: subjectSeed[i].category,
        weeklyPeriods: 4,
        classId: createdClasses[0].c.id,
        teacherId: i === 0 ? teacher.id : teachers[i % teachers.length]?.id,
        isActive: true,
        tenantId: tenant.id,
      },
    });
    subjects.push(s);
  }

  // ── Students ──────────────────────────────────────────────────────────────
  const studentNames = [
    'Aarav Singh', 'Diya Patel', 'Vihaan Gupta', 'Ananya Reddy', 'Advik Joshi',
    'Ishaan Mehta', 'Riya Sharma', 'Arjun Nair', 'Saanvi Verma', 'Kabir Khan',
    'Myra Iyer', 'Reyansh Kumar', 'Aadhya Menon', 'Vivaan Das', 'Navya Pillai',
    'Atharv Kulkarni', 'Sara Fernandes', 'Shaurya Rao', 'Anika Bose', 'Rudra Mishra',
  ];
  const students = [];
  for (let i = 0; i < studentNames.length; i++) {
    const cls = createdClasses[i % 2].c;
    const section = i % 2 === 0 ? createdClasses[i % 2].sectionA : createdClasses[i % 2].sectionB;
    const student = await prisma.student.create({
      data: {
        rollNo: `R-${String(i + 1).padStart(3, '0')}`,
        name: studentNames[i],
        email: `student${i + 2}@demo.school`,
        phone: `+91 9000${String(100000 + i)}`,
        dob: new Date(`20${12 + (i % 5)}-0${(i % 9) + 1}-15`),
        gender: i % 2 === 0 ? Gender.male : Gender.female,
        address: `${i + 1} Residency Road, New Delhi`,
        admissionDate: dateFromNow(-(300 + i * 5)),
        status: i === 0 ? 'active' : i === 1 ? 'active' : i === 2 ? 'transferred' : 'active',
        classId: cls.id,
        sectionId: section.id,
        parentId: i === 0 ? parentUser.id : undefined,
        tenantId: tenant.id,
      },
    });
    students.push(student);
  }

  if (studentUser && students[0]) {
    await prisma.student.update({
      where: { id: students[0].id },
      data: { email: studentUser.email },
    });
  }

  // ── Admissions ─────────────────────────────────────────────────────────────
  const admissionSeed = [
    { firstName: 'Rohan', lastName: 'Gupta', status: AdmissionStatus.pending },
    { firstName: 'Simran', lastName: 'Kaur', status: AdmissionStatus.approved },
    { firstName: 'Armaan', lastName: 'Ali', status: AdmissionStatus.pending },
    { firstName: 'Nisha', lastName: 'Tiwari', status: AdmissionStatus.rejected },
    { firstName: 'Dev', lastName: 'Shah', status: AdmissionStatus.pending },
    { firstName: 'Tanvi', lastName: 'Chopra', status: AdmissionStatus.approved },
  ];
  for (let i = 0; i < admissionSeed.length; i++) {
    const a = admissionSeed[i];
    await prisma.admission.create({
      data: {
        firstName: a.firstName,
        lastName: a.lastName,
        dateOfBirth: new Date('2014-05-10'),
        gender: i % 2 === 0 ? Gender.male : Gender.female,
        nationality: 'Indian',
        classApplyingFor: `Class ${(i % 7) + 1}`,
        sectionPreference: ['A', 'B'][i % 2],
        parentPhone: `+91 98123${String(10000 + i)}`,
        addressLine1: `${i + 10} MG Road`,
        city: 'New Delhi',
        state: 'Delhi',
        country: 'India',
        pincode: '110001',
        emergencyContactName: a.firstName + ' Parent',
        emergencyContactPhone: `+91 98223${String(10000 + i)}`,
        transportRequired: i % 2 === 0,
        hostelRequired: i === 3,
        status: a.status,
        tenantId: tenant.id,
        appliedDate: dateFromNow(-(20 + i * 3)),
        approvedDate: a.status === AdmissionStatus.approved ? dateFromNow(-10) : null,
      },
    });
  }

  // ── Attendance ─────────────────────────────────────────────────────────────
  for (let d = 0; d < 10; d++) {
    const session = await prisma.attendanceSession.create({
      data: {
        classId: createdClasses[0].c.id,
        section: 'A',
        date: dateFromNow(-(d + 1)),
        markedBy: teacherUser.id,
        tenantId: tenant.id,
        entries: {
          create: students.slice(0, 15).map((s, idx) => ({
            studentId: s.id,
            status:
              idx % 10 === 0 ? AttendanceStatus.absent : idx % 7 === 0 ? AttendanceStatus.late : AttendanceStatus.present,
            remarks: idx % 10 === 0 ? 'Not feeling well' : null,
            tenantId: tenant.id,
          })),
        },
      },
    });
    await session;
  }

  // ── Homework ───────────────────────────────────────────────────────────────
  const homework1 = await prisma.homework.create({
      data: {
        title: 'Algebra Worksheet 3.1',
        description: 'Solve exercises 1-15 from chapter 3 on Linear Equations.',
        classId: createdClasses[0].c.id,
        section: 'A',
        subjectId: subjects[0].id,
        assignedDate: dateFromNow(-2),
        dueDate: dateFromNow(3),
        status: HomeworkStatus.assigned,
        authorId: teacherUser.id,
        attachments: JSON.stringify([]),
        tenantId: tenant.id,
        submissions: {
          create: students.slice(0, 10).map((s, idx) => ({
            studentId: s.id,
            submittedAt: dateFromNow(-1),
            status: idx % 9 === 0 ? 'missing' : idx % 5 === 0 ? 'late' : 'submitted',
            note: 'Completed on time',
            tenantId: tenant.id,
          })),
        },
      },
  });

  await prisma.homework.create({
      data: {
        title: 'Essay: My School',
        description: 'Write a 300-word essay about your school.',
        classId: createdClasses[0].c.id,
        section: 'A',
        subjectId: subjects[2].id,
        assignedDate: dateFromNow(-5),
        dueDate: dateFromNow(-1),
        status: HomeworkStatus.closed,
        authorId: teacherUser.id,
        attachments: JSON.stringify([]),
        tenantId: tenant.id,
      },
  });

  // ── Assessments ────────────────────────────────────────────────────────────
  await prisma.assessment.create({
      data: {
        title: 'Unit Test 1 - Mathematics',
        type: AssessmentType.unit_test,
        classId: createdClasses[0].c.id,
        section: 'A',
        subjectId: subjects[0].id,
        totalMarks: 50,
        date: dateFromNow(-7),
        instructions: 'All questions are compulsory. Calculator not allowed.',
        status: AssessmentStatus.published,
        authorId: teacherUser.id,
        tenantId: tenant.id,
        results: {
          create: students.slice(0, 12).map((s, idx) => ({
            studentId: s.id,
            marks: 50 - (idx * 3) % 20,
            grade: (50 - (idx * 3) % 20) > 40 ? 'A' : (50 - (idx * 3) % 20) > 30 ? 'B' : 'C',
            tenantId: tenant.id,
          })),
        },
      },
  });

  await prisma.assessment.create({
      data: {
        title: 'Science Quiz - Chapter 5',
        type: AssessmentType.quiz,
        classId: createdClasses[0].c.id,
        section: 'A',
        subjectId: subjects[1].id,
        totalMarks: 20,
        date: dateFromNow(5),
        status: AssessmentStatus.draft,
        authorId: teacherUser.id,
        tenantId: tenant.id,
      },
  });

  // ── Exams ──────────────────────────────────────────────────────────────────
  await prisma.exam.create({
      data: {
        name: 'Term 1 Examination',
        term: ExamTerm.term_1,
        classId: createdClasses[0].c.id,
        section: 'A',
        status: ExamStatus.completed,
        authorId: teacherUser.id,
        tenantId: tenant.id,
        papers: {
          create: [
            { subjectId: subjects[0].id, subjectName: 'Mathematics', date: dateFromNow(-20), startTime: '09:00', durationMinutes: 180, totalMarks: 100, tenantId: tenant.id },
            { subjectId: subjects[2].id, subjectName: 'English', date: dateFromNow(-18), startTime: '09:00', durationMinutes: 180, totalMarks: 100, tenantId: tenant.id },
            { subjectId: subjects[1].id, subjectName: 'Science', date: dateFromNow(-16), startTime: '09:00', durationMinutes: 180, totalMarks: 100, tenantId: tenant.id },
          ],
        },
        results: {
          create: students.slice(0, 8).map((s, idx) => ({
            studentId: s.id,
            total: 280 - idx * 5,
            grade: (280 - idx * 5) > 250 ? 'A+' : 'A',
            tenantId: tenant.id,
          })),
        },
      },
  });

  await prisma.exam.create({
      data: {
        name: 'Term 2 Examination',
        term: ExamTerm.term_2,
        classId: createdClasses[0].c.id,
        section: 'A',
        status: ExamStatus.scheduled,
        authorId: teacherUser.id,
        tenantId: tenant.id,
        papers: {
          create: [
            { subjectId: subjects[0].id, subjectName: 'Mathematics', date: dateFromNow(30), startTime: '09:00', durationMinutes: 180, totalMarks: 100, tenantId: tenant.id },
            { subjectId: subjects[1].id, subjectName: 'Science', date: dateFromNow(32), startTime: '09:00', durationMinutes: 180, totalMarks: 100, tenantId: tenant.id },
          ],
        },
      },
  });

  // ── Syllabus ───────────────────────────────────────────────────────────────
  await prisma.syllabus.create({
      data: {
        title: 'Mathematics Term 1 Syllabus',
        classId: createdClasses[0].c.id,
        section: 'A',
        subjectId: subjects[0].id,
        term: ExamTerm.term_1,
        description: 'Chapters 1-6 covering algebra, geometry and mensuration.',
        attachments: JSON.stringify([{ name: 'syllabus.pdf', url: '/uploads/syllabus.pdf' }]),
        progress: 70,
        status: SyllabusStatus.published,
        tenantId: tenant.id,
      },
  });

  // ── Fee Structures & Payments ──────────────────────────────────────────────
  const feeStructures = [];
  const feeSeed = [
    { name: 'Tuition Fee - Class 1', type: FeeType.tuition, amount: 2000, recurring: true, frequency: 'monthly' },
    { name: 'Transport Fee', type: FeeType.transport, amount: 800, recurring: true, frequency: 'monthly' },
    { name: 'Lab Fee', type: FeeType.lab, amount: 500, recurring: false, frequency: null },
    { name: 'Exam Fee', type: FeeType.exam, amount: 1000, recurring: false, frequency: null },
  ];
  for (let i = 0; i < feeSeed.length; i++) {
    const f = await prisma.feeStructure.create({
      data: {
        name: feeSeed[i].name,
        classId: createdClasses[0].c.id,
        amount: feeSeed[i].amount,
        dueDate: dateFromNow(15),
        type: feeSeed[i].type,
        isRecurring: feeSeed[i].recurring,
        frequency: feeSeed[i].frequency as any,
        tenantId: tenant.id,
      },
    });
    feeStructures.push(f);
  }

  for (let i = 0; i < students.length; i++) {
    const s = students[i];
    if (i % 3 === 0) continue; // some pending
    const fee = feeStructures[i % feeStructures.length];
    const isOverdue = i % 5 === 0;
    await prisma.payment.create({
      data: {
        studentId: s.id,
        feeId: fee.id,
        amount: fee.amount,
        paidDate: isOverdue ? dateFromNow(-30) : dateFromNow(-(i + 1)),
        mode: i % 2 === 0 ? PaymentMode.online : PaymentMode.cash,
        status: isOverdue ? PaymentStatus.overdue : PaymentStatus.paid,
        receiptNo: `RCP-${String(2000 + i)}`,
        referenceId: i % 2 === 0 ? `TXN${100000 + i}` : null,
        tenantId: tenant.id,
      },
    });
  }

  // ── Invoices ───────────────────────────────────────────────────────────────
  for (let i = 0; i < 6; i++) {
    const s = students[i];
    const status = i % 3 === 0 ? InvoiceStatus.issued : i % 4 === 0 ? InvoiceStatus.paid : InvoiceStatus.overdue;
    const total = 2500 + i * 500;
    const paidAmount = status === InvoiceStatus.paid ? total : status === InvoiceStatus.issued ? 0 : total * 0.5;
    await prisma.invoice.create({
      data: {
        invoiceNo: `INV-${String(3000 + i)}`,
        studentId: s.id,
        classId: s.classId,
        section: 'A',
        issueDate: dateFromNow(-(15 + i)),
        dueDate: dateFromNow(5),
        status,
        notes: 'Invoice for term fees',
        tenantId: tenant.id,
        items: {
          create: [
            { description: 'Tuition Fee', quantity: 1, unitPrice: 2000, tenantId: tenant.id },
            { description: 'Transport Fee', quantity: 1, unitPrice: 500 + i * 100, tenantId: tenant.id },
          ],
        },
        payments:
          paidAmount > 0
            ? {
                create: [
                  {
                    amount: paidAmount,
                    mode: PaymentMode.online,
                    referenceId: `REF${1000 + i}`,
                    paidDate: dateFromNow(-2),
                    tenantId: tenant.id,
                  },
                ],
              }
            : undefined,
      },
    });
  }

  // ── Transport ──────────────────────────────────────────────────────────────
  const route = await prisma.transportRoute.create({
      data: {
        name: 'Route 1 - Karol Bagh',
        vehicleNo: 'DL-01-AB-1234',
        driverName: 'Rajesh Kumar',
        driverPhone: '+91 9876543210',
        startsAt: '07:00',
        status: TransportStatus.active,
        tenantId: tenant.id,
        stops: {
          create: [
            { name: 'Karol Bagh', time: '07:00', tenantId: tenant.id },
            { name: 'Patel Nagar', time: '07:15', tenantId: tenant.id },
            { name: 'Rajendra Place', time: '07:30', tenantId: tenant.id },
            { name: 'School', time: '07:50', tenantId: tenant.id },
          ],
        },
        assignments: {
          create: students.slice(0, 5).map((s, idx) => ({
            studentId: s.id,
            stopName: ['Karol Bagh', 'Patel Nagar', 'Rajendra Place'][idx % 3],
            tenantId: tenant.id,
          })),
        },
      },
  });

  await prisma.vehicle.create({
      data: {
        vehicleNo: 'DL-01-AB-1234',
        name: 'School Bus 1',
        capacity: 45,
        status: TransportStatus.active,
        latitude: 28.6448,
        longitude: 77.2167,
        lastUpdateAt: new Date(),
        tenantId: tenant.id,
      },
  });

  // ── Noticeboard ────────────────────────────────────────────────────────────
  await prisma.notice.create({
      data: {
        title: 'Parent Teacher Meeting',
        message: 'The Parent-Teacher meeting will be held on Friday at 10 AM in the auditorium.',
        category: NoticeCategory.event,
        publishAt: dateFromNow(-1),
        expireAt: dateFromNow(5),
        scope: AudienceScope.all,
        status: NoticeStatus.published,
        views: 45,
        authorId: admin.id,
        tenantId: tenant.id,
      },
  });

  await prisma.notice.create({
      data: {
        title: 'Summer Break Announcement',
        message: 'Summer holidays begin from May 15. School reopens on June 1.',
        category: NoticeCategory.general,
        publishAt: dateFromNow(3),
        scope: AudienceScope.all,
        status: NoticeStatus.draft,
        authorId: admin.id,
        tenantId: tenant.id,
      },
  });

  // ── Diary ──────────────────────────────────────────────────────────────────
  await prisma.diaryEntry.create({
      data: {
        date: dateFromNow(-1),
        classId: createdClasses[0].c.id,
        section: 'A',
        subject: 'Mathematics',
        title: 'Linear Equations - Day 3',
        content: 'Taught cross multiplication method. Solved examples 1-3 from textbook.',
        visibility: DiaryVisibility.both,
        status: DiaryStatus.published,
        tags: JSON.stringify(['algebra', 'linear-equations']),
        authorId: teacherUser.id,
        tenantId: tenant.id,
      },
  });

  // ── Holidays ───────────────────────────────────────────────────────────────
  const holidaySeed = [
    { title: 'Independence Day', type: HolidayType.holiday, days: 0, fullDay: true },
    { title: 'Diwali Break', type: HolidayType.holiday, days: 12, fullDay: true },
    { title: 'Republic Day', type: HolidayType.holiday, days: 30, fullDay: true },
    { title: 'Annual Sports Day', type: HolidayType.event, days: 20, fullDay: false },
    { title: 'Half Yearly Exams', type: HolidayType.exam, days: 8, fullDay: true },
  ];
  for (let i = 0; i < holidaySeed.length; i++) {
    await prisma.holiday.create({
      data: {
        title: holidaySeed[i].title,
        type: holidaySeed[i].type as HolidayType,
        startDate: daysFromNow(holidaySeed[i].days),
        endDate: daysFromNow(holidaySeed[i].days + 1),
        isFullDay: holidaySeed[i].fullDay,
        appliesTo: i === 1 ? 'students' : 'all',
        status: i === 3 ? HolidayStatus.announced : HolidayStatus.announced,
        description: `${holidaySeed[i].title} holiday`,
        tenantId: tenant.id,
      },
    });
  }

  // ── Chat ───────────────────────────────────────────────────────────────────
  const conv = await prisma.conversation.create({
      data: {
        title: 'Class 1-A Group',
        isGroup: true,
        createdBy: teacherUser.id,
        tenantId: tenant.id,
        participants: {
          create: [
            { userId: teacherUser.id, tenantId: tenant.id },
            { userId: admin.id, tenantId: tenant.id },
            { userId: parentUser.id, tenantId: tenant.id },
          ],
        },
        messages: {
          create: [
            { senderId: teacherUser.id, text: 'Good morning everyone!', direction: 'out', tenantId: tenant.id },
            { senderId: admin.id, text: 'Good morning ma\u2019am', direction: 'in', tenantId: tenant.id },
            { senderId: parentUser.id, text: 'Homework is noted, thanks.', direction: 'in', tenantId: tenant.id },
          ],
        },
      },
  });

  const conv2 = await prisma.conversation.create({
      data: {
        title: 'Direct - Admin',
        isGroup: false,
        createdBy: admin.id,
        tenantId: tenant.id,
        participants: {
          create: [
            { userId: admin.id, tenantId: tenant.id },
            { userId: teacherUser.id, tenantId: tenant.id },
          ],
        },
        messages: {
          create: [
            { senderId: admin.id, text: 'Please submit attendance by 12 PM.', direction: 'out', tenantId: tenant.id },
            { senderId: teacherUser.id, text: 'Sure, will do.', direction: 'in', tenantId: tenant.id },
          ],
        },
      },
  });

  // ── Notifications ──────────────────────────────────────────────────────────
  await prisma.notification.create({
      data: {
        userId: admin.id,
        title: 'New Admission Request',
        message: 'Rohan Gupta applied for Class 5 admission.',
        type: 'info',
        channel: 'in_app',
        priority: 'normal',
        link: '/admissions',
        isRead: false,
        status: 'sent',
        tenantId: tenant.id,
      },
  });
  await prisma.notification.create({
      data: {
        userId: teacherUser.id,
        title: 'Homework Due Soon',
        message: 'Algebra Worksheet 3.1 is due in 3 days.',
        type: 'warning',
        channel: 'in_app',
        priority: 'high',
        link: '/homework',
        isRead: false,
        status: 'sent',
        tenantId: tenant.id,
      },
  });
  await prisma.notification.create({
      data: {
        userId: parentUser.id,
        title: 'Attendance Alert',
        message: 'Aarav was marked absent today.',
        type: 'warning',
        channel: 'in_app',
        priority: 'high',
        link: '/attendance',
        isRead: false,
        status: 'sent',
        tenantId: tenant.id,
      },
  });

  // ── Gallery ────────────────────────────────────────────────────────────────
  const album = await prisma.galleryAlbum.create({
    data: {
      title: 'Annual Day 2025',
      description: 'Photos from the annual day celebration',
      date: dateFromNow(-30),
      visibility: AlbumVisibility.public,
      coverUrl: '/uploads/annual-day.jpg',
      tenantId: tenant.id,
      createdById: admin.id,
      media: {
        create: [
          { type: MediaType.image, url: '/uploads/annual-day-1.jpg', caption: 'Stage performance', tenantId: tenant.id },
          { type: MediaType.image, url: '/uploads/annual-day-2.jpg', caption: 'Awards ceremony', tenantId: tenant.id },
        ],
      },
    },
  });

  // ── Lectures ───────────────────────────────────────────────────────────────
  await prisma.lecture.create({
    data: {
      title: 'Live Class - Chapter 5: Fractions',
      type: LectureType.live,
      subject: 'Mathematics',
      classId: createdClasses[0].c.id,
      section: 'A',
      description: 'Interactive live session on fractions.',
      scheduledAt: dateFromNow(2),
      durationMinutes: 45,
      meetingUrl: 'https://meet.educore.app/abc123',
      status: LectureStatus.scheduled,
      hostId: teacherUser.id,
      tenantId: tenant.id,
    },
  });

  await prisma.lecture.create({
    data: {
      title: 'Recorded - Algebra Basics',
      type: LectureType.recorded,
      subject: 'Mathematics',
      classId: createdClasses[0].c.id,
      section: 'A',
      description: 'Pre-recorded lesson covering algebra basics.',
      durationMinutes: 30,
      attachments: JSON.stringify([{ name: 'algebra-basics.mp4', url: '/uploads/algebra-basics.mp4' }]),
      status: LectureStatus.published,
      hostId: teacherUser.id,
      tenantId: tenant.id,
    },
  });

  // ── Products ───────────────────────────────────────────────────────────────
  await prisma.product.createMany({
    data: [
      { name: 'School Uniform - Junior', sku: 'UNI-JR', category: 'Uniform', stock: 25, price: 450, tenantId: tenant.id, status: ProductStatus.active },
      { name: 'School Bag', sku: 'BAG-01', category: 'Stationery', stock: 3, price: 350, tenantId: tenant.id, status: ProductStatus.active },
      { name: 'Science Kit', sku: 'SCI-KIT', category: 'Lab', stock: 12, price: 1200, tenantId: tenant.id, status: ProductStatus.active },
      { name: 'Exercise Books (Set of 10)', sku: 'NB-SET10', category: 'Stationery', stock: 5, price: 150, tenantId: tenant.id, status: ProductStatus.inactive },
    ],
  });

  // ── Settings ───────────────────────────────────────────────────────────────
  await prisma.settings.create({
    data: {
      tenantId: tenant.id,
      institutionName: 'Delhi Public School',
      shortCode: 'DPS',
      registrationNo: 'SCH/2020/00125',
      institutionType: 'school',
      academicYearId: academicYear.id,
      contactEmail: 'info@dps.example.com',
      phone: '+91 11 1234 5678',
      website: 'https://dps.example.com',
      notificationPrefs: JSON.stringify({
        feeAlerts: true,
        attendanceAlerts: true,
        homeworkAssignments: true,
        examScheduleUpdates: true,
        noticeboardUpdates: true,
        chatMessages: true,
        systemAlerts: true,
        weeklyDigest: false,
      }),
      systemConfig: JSON.stringify({ allowSelfRegistration: false, maxStudentsPerClass: 40 }),
    },
  });

  // ── Timetable ──────────────────────────────────────────────────────────────
  const tt = await prisma.timetable.create({
      data: {
        classId: createdClasses[0].c.id,
        section: 'A',
        week: 0,
        tenantId: tenant.id,
        cells: {
          create: [
            { day: TimetableDay.Monday, periodId: 1, subjectId: subjects[0].id, subjectName: 'Mathematics', teacherId: teacher.id, teacherName: teacher.fullName, tenantId: tenant.id },
            { day: TimetableDay.Monday, periodId: 2, subjectId: subjects[2].id, subjectName: 'English', teacherId: teachers[2]?.id, teacherName: 'Meena Iyer', tenantId: tenant.id },
            { day: TimetableDay.Tuesday, periodId: 1, subjectId: subjects[1].id, subjectName: 'Science', teacherId: teachers[0]?.id, teacherName: 'Anil Verma', tenantId: tenant.id },
            { day: TimetableDay.Wednesday, periodId: 1, subjectId: subjects[3].id, subjectName: 'Hindi', teacherId: teachers[2]?.id, teacherName: 'Rohit Gupta', tenantId: tenant.id },
            { day: TimetableDay.Thursday, periodId: 2, subjectId: subjects[5].id, subjectName: 'Computer', teacherId: teachers[4]?.id, teacherName: 'Sanjay Malhotra', tenantId: tenant.id },
          ],
        },
      },
  });

  // ── Audit Logs ─────────────────────────────────────────────────────────────
  await prisma.auditLog.createMany({
    data: [
      { actor: admin.name, action: AuditAction.login, module: 'auth', summary: 'Admin logged in', ip: '127.0.0.1', severity: Severity.info, tenantId: tenant.id },
      { actor: teacherUser.name, action: AuditAction.create, module: 'homework', entity: 'Homework', entityId: homework1.id, summary: 'Created homework: Algebra Worksheet 3.1', severity: Severity.info, tenantId: tenant.id },
      { actor: admin.name, action: AuditAction.approve, module: 'admission', summary: 'Approved admission application', severity: Severity.info, tenantId: tenant.id },
    ],
  });

  // ── Link student to parent (parent relation was set at student creation) ──
  await prisma.$disconnect();
  console.log('✅ Seeding completed.');
  console.log('Demo accounts (password: password123):');
  console.log('  superadmin@educore.app');
  console.log('  admin@demo.school');
  console.log('  teacher@demo.school');
  console.log('  student@demo.school');
  console.log('  parent@demo.school');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
