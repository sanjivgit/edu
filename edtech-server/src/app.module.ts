import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './modules/auth/auth.module';
import { BillingModule } from './modules/billing/billing.module';
import { SettingsModule } from './modules/settings/settings.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { StudentsModule } from './modules/students/students.module';
import { AdmissionsModule } from './modules/admissions/admissions.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { ClassesModule } from './modules/classes/classes.module';
import { SubjectsModule } from './modules/subjects/subjects.module';
import { TimetableModule } from './modules/timetable/timetable.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { HomeworkModule } from './modules/homework/homework.module';
import { AssessmentsModule } from './modules/assessments/assessments.module';
import { ExamsModule } from './modules/exams/exams.module';
import { SyllabusModule } from './modules/syllabus/syllabus.module';
import { FeesModule } from './modules/fees/fees.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { TransportModule } from './modules/transport/transport.module';
import { NoticeboardModule } from './modules/noticeboard/noticeboard.module';
import { DiaryModule } from './modules/diary/diary.module';
import { HolidaysModule } from './modules/holidays/holidays.module';
import { ChatModule } from './modules/chat/chat.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { GalleryModule } from './modules/gallery/gallery.module';
import { LecturesModule } from './modules/lectures/lectures.module';
import { ProductsModule } from './modules/products/products.module';
import { ReportsModule } from './modules/reports/reports.module';
import { RolesModule } from './modules/roles/roles.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { TenantsModule } from './modules/tenants/tenants.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    CommonModule,
    AuthModule,
    BillingModule,
    SettingsModule,
    DashboardModule,
    StudentsModule,
    AdmissionsModule,
    TeachersModule,
    ClassesModule,
    SubjectsModule,
    TimetableModule,
    AttendanceModule,
    HomeworkModule,
    AssessmentsModule,
    ExamsModule,
    SyllabusModule,
    FeesModule,
    InvoicesModule,
    TransportModule,
    NoticeboardModule,
    DiaryModule,
    HolidaysModule,
    ChatModule,
    NotificationsModule,
    GalleryModule,
    LecturesModule,
    ProductsModule,
    ReportsModule,
    RolesModule,
    AuditLogsModule,
    TenantsModule,
  ],
})
export class AppModule {}
