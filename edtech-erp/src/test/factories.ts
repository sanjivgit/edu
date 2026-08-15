import type { User } from '@/types';

export const API_BASE_URL = 'http://localhost:4000/v1';

export function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    name: 'Admin User',
    email: 'admin@educore.test',
    role: 'superadmin',
    avatar: undefined,
    phone: '+919999999999',
    tenantId: 'tenant-1',
    permissions: ['*'],
    ...overrides,
  };
}

// ─── Auth ──────────────────────────────────────────────────────────────────────
export function makeLoginResponse(user: User = makeUser()) {
  return {
    token: 'jwt-access-token',
    refreshToken: 'jwt-refresh-token',
    user,
    message: 'Login successful',
  };
}

// ─── Chat ──────────────────────────────────────────────────────────────────────
export function makeConversation(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'conv-1',
    title: 'Maths Group',
    subtitle: '3 participants',
    avatarName: 'M',
    unreadCount: 2,
    lastMessage: 'See you tomorrow',
    updatedAt: '2024-06-01T10:00:00.000Z',
    ...overrides,
  };
}

export function makeConversationDetail(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'conv-1',
    title: 'Maths Group',
    isGroup: true,
    participants: [
      { id: 'u2', name: 'Riya Sharma', avatar: null },
      { id: 'u3', name: 'Aman Verma', avatar: null },
    ],
    updatedAt: '2024-06-01T10:00:00.000Z',
    ...overrides,
  };
}

export function makeChatMessage(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'msg-1',
    conversationId: 'conv-1',
    direction: 'in' as const,
    sender: 'Riya Sharma',
    text: 'Hello!',
    at: '2024-06-01T09:00:00.000Z',
    ...overrides,
  };
}

// ─── Audit logs ────────────────────────────────────────────────────────────────
export function makeAuditLog(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'log-1',
    user: 'Admin User',
    action: 'LOGIN',
    module: 'auth',
    entityId: null,
    description: 'Admin User logged in',
    metadata: { ip: '127.0.0.1' },
    timestamp: '2024-06-01T09:30:00.000Z',
    createdAt: '2024-06-01T09:30:00.000Z',
    ...overrides,
  };
}

export function makeAuditLogRaw(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'log-9',
    actor: 'Teacher One',
    action: 'CREATE',
    module: 'homework',
    entityId: 'hw-42',
    summary: 'Created homework assignment',
    meta: { priority: 'high' },
    createdAt: '2024-06-02T12:00:00.000Z',
    ...overrides,
  };
}

// ─── Products ──────────────────────────────────────────────────────────────────
export function makeProduct(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'prod-1',
    name: 'School Bag',
    sku: 'SB-001',
    category: 'Stationery',
    stock: 25,
    price: 149.99,
    status: 'active' as const,
    ...overrides,
  };
}

export function makeProductStats(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    totalProducts: 10,
    activeProducts: 8,
    lowStockProducts: 3,
    inventoryValue: 45210.5,
    ...overrides,
  };
}

// ─── Lectures ──────────────────────────────────────────────────────────────────
export function makeLecture(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'lec-1',
    title: 'Algebra Basics',
    subject: 'Mathematics',
    classId: 'class-1',
    section: 'A',
    description: 'Introduction to algebra',
    scheduledAt: '2024-06-05T09:30:00.000Z',
    durationMinutes: 45,
    meetingUrl: 'https://meet.example.com/abc',
    status: 'scheduled' as const,
    host: { id: 'teacher-1', name: 'Rahul Sir' },
    attachments: [],
    createdAt: '2024-06-01T08:00:00.000Z',
    updatedAt: '2024-06-01T08:00:00.000Z',
    ...overrides,
  };
}

// ─── Classes / lookups ─────────────────────────────────────────────────────────
export function makeClass(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'class-1',
    name: 'Class 10',
    code: 'C10',
    capacity: 40,
    status: 'active' as const,
    academicYearId: 'ay-1',
    studentCount: 32,
    classTeacher: { id: 'teacher-1', fullName: 'Rahul Sir' },
    sections: [{ id: 'sec-1', name: 'A', roomNo: '101', studentCount: 32, status: 'active' }],
    ...overrides,
  };
}

export function makeTeacher(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'teacher-1',
    fullName: 'Rahul Sir',
    ...overrides,
  };
}

export function makeAcademicYear(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'ay-1',
    name: '2024-25',
    startDate: '2024-04-01T00:00:00.000Z',
    endDate: '2025-03-31T00:00:00.000Z',
    status: 'active' as const,
    ...overrides,
  };
}

// ─── Generic helpers ───────────────────────────────────────────────────────────
export function envelope<T>(data: T, meta?: { page: number; limit: number; total: number; totalPages: number }) {
  return {
    data,
    message: 'Success',
    success: true,
    ...(meta ? { meta } : {}),
  };
}

export function listEnvelope<T>(items: T[], total = items.length) {
  return envelope(items, { page: 1, limit: items.length || 1, total, totalPages: Math.ceil(total / (items.length || 1)) });
}
