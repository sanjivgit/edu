import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { TenantContext } from '../common/tenant/tenant-context.service';

const TENANT_MODELS = new Set<string>([
  'User',
  'Role',
  'Settings',
  'AcademicYear',
  'Class',
  'Section',
  'Subject',
  'Teacher',
  'Student',
  'Promotion',
  'PromotionStudent',
  'Admission',
  'AttendanceSession',
  'AttendanceEntry',
  'Homework',
  'HomeworkSubmission',
  'Assessment',
  'AssessmentResult',
  'Exam',
  'ExamPaper',
  'ExamResult',
  'Syllabus',
  'Timetable',
  'TimetableCell',
  'FeeStructure',
  'Payment',
  'Invoice',
  'InvoiceItem',
  'InvoicePayment',
  'TransportRoute',
  'TransportStop',
  'RouteAssignment',
  'Vehicle',
  'Notice',
  'DiaryEntry',
  'Holiday',
  'Conversation',
  'ConversationParticipant',
  'ChatMessage',
  'Notification',
  'GalleryAlbum',
  'GalleryMedia',
  'Lecture',
  'Product',
  'AuditLog',
]);

// Global models intentionally NOT tenant scoped: Tenant, Otp, RefreshToken.

function mergeWhere(where: any, scope: any): any {
  if (!where) return scope;
  return { AND: [where, scope] };
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly extended: PrismaClient;

  constructor(private readonly tenantContext: TenantContext) {
    super();

    const extended = this.$extends({
      query: {
        async $allOperations({ model, operation, args, query }) {
          const tenantId = tenantContext.tenantId;
          if (!tenantId || !TENANT_MODELS.has(model)) {
            return query(args);
          }

          const readScope =
            model === 'Role' ? { OR: [{ tenantId }, { tenantId: null }] } : { tenantId };
          const writeScope = { tenantId };

          switch (operation) {
            case 'findMany':
            case 'findFirst':
            case 'findFirstOrThrow':
            case 'count':
            case 'aggregate':
            case 'groupBy':
              args.where = mergeWhere(args.where, readScope);
              return query(args);

            case 'findUnique':
            case 'findUniqueOrThrow': {
              const target = operation === 'findUnique' ? 'findFirst' : 'findFirstOrThrow';
              const ctx = Prisma.getExtensionContext(this) as PrismaClient;
              return (ctx as any)[model][target]({
                ...args,
                where: mergeWhere(args.where, readScope),
              });
            }

            case 'create':
              if (!args.data.tenantId) args.data.tenantId = tenantId;
              return query(args);

            case 'createMany':
            case 'createManyAndReturn':
              if (Array.isArray(args.data)) {
                for (const item of args.data) {
                  if (!item.tenantId) item.tenantId = tenantId;
                }
              }
              return query(args);

            case 'updateMany':
            case 'deleteMany':
            case 'updateManyAndReturn':
              args.where = mergeWhere(args.where, writeScope);
              return query(args);

            case 'update':
            case 'delete':
            case 'upsert': {
              const ctx = Prisma.getExtensionContext(this) as PrismaClient;
              const existing = await (ctx as any)[model].findFirst({
                where: mergeWhere(args.where, writeScope),
                select: { id: true },
              });
              if (!existing) {
                throw new Prisma.PrismaClientKnownRequestError(
                  'An operation failed because it depends on one or more records that were required but not found.',
                  {
                    code: 'P2025',
                    clientVersion: Prisma.prismaVersion.client,
                    meta: { modelName: model },
                  },
                );
              }
              if (operation === 'upsert' && args.create && !args.create.tenantId) {
                args.create.tenantId = tenantId;
              }
              return query(args);
            }

            default:
              return query(args);
          }
        },
      },
    }) as PrismaClient;
    this.extended = extended;

    return new Proxy(this, {
      get(target, prop, receiver) {
        if (
          prop === 'extended' ||
          prop === 'onModuleInit' ||
          prop === 'onModuleDestroy' ||
          prop === 'constructor'
        ) {
          return (target as any)[prop];
        }
        return Reflect.get((target as any).extended, prop, receiver);
      },
      set(target, prop, value) {
        (target as any).extended[prop] = value;
        return true;
      },
    }) as PrismaService;
  }

  async onModuleInit() {
    await this.extended.$connect();
  }

  async onModuleDestroy() {
    await this.extended.$disconnect();
  }
}
