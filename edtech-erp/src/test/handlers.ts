import { http, HttpResponse, type HttpHandler } from 'msw';
import {
  API_BASE_URL,
  envelope,
  listEnvelope,
  makeAuditLog,
  makeAuditLogRaw,
  makeClass,
  makeConversation,
  makeConversationDetail,
  makeChatMessage,
  makeLecture,
  makeLoginResponse,
  makeProduct,
  makeProductStats,
  makeTeacher,
  makeUser,
} from './factories';

const BASE = API_BASE_URL;

// ─── Auth ──────────────────────────────────────────────────────────────────────
export const authHandlers: HttpHandler[] = [
  http.post(`${BASE}/auth/login`, () => HttpResponse.json(envelope(makeLoginResponse()))),
  http.get(`${BASE}/auth/me`, ({ request }) => {
    if (!request.headers.get('Authorization')) {
      return HttpResponse.json({ message: 'Unauthorized', statusCode: 401 }, { status: 401 });
    }
    return HttpResponse.json(envelope({ user: makeUser() }));
  }),
  http.post(`${BASE}/auth/logout`, () =>
    HttpResponse.json(envelope({ message: 'Logged out successfully' }))
  ),
  http.post(`${BASE}/auth/forgot-password`, () =>
    HttpResponse.json(envelope({ message: 'OTP sent to your email', devOtp: '123456' }))
  ),
  http.post(`${BASE}/auth/verify-otp`, () =>
    HttpResponse.json(envelope({ message: 'OTP verified', verified: true }))
  ),
];

// ─── Chat ──────────────────────────────────────────────────────────────────────
export const chatHandlers: HttpHandler[] = [
  http.get(`${BASE}/chat/conversations`, () =>
    HttpResponse.json(
      listEnvelope([
        makeConversation({ id: 'conv-2', updatedAt: '2024-06-02T10:00:00.000Z', title: 'Science' }),
        makeConversation({ id: 'conv-1', updatedAt: '2024-06-01T10:00:00.000Z', title: 'Maths Group' }),
      ])
    )
  ),
  http.get(`${BASE}/chat/conversations/:id`, ({ params }) =>
    HttpResponse.json(envelope(makeConversationDetail({ id: params.id })))
  ),
  http.get(`${BASE}/chat/conversations/:id/messages`, () =>
    HttpResponse.json(
      listEnvelope([
        makeChatMessage({
          id: 'msg-1',
          at: '2024-06-01T09:00:00.000Z',
          direction: 'in',
          sender: 'Riya Sharma',
          text: 'Hello!',
        }),
        makeChatMessage({
          id: 'msg-2',
          at: '2024-06-01T09:01:00.000Z',
          direction: 'out',
          sender: 'Admin User',
          text: 'Hi Riya!',
        }),
      ])
    )
  ),
  http.post(`${BASE}/chat/conversations/:id/messages`, async ({ request, params }) => {
    const body = (await request.json()) as { content?: string };
    if (!body.content) {
      return HttpResponse.json({ message: 'content should not be empty', statusCode: 400 }, { status: 400 });
    }
    return HttpResponse.json(
      envelope(
        makeChatMessage({
          id: 'msg-new',
          conversationId: params.id,
          direction: 'out',
          sender: 'Admin User',
          text: body.content,
          at: '2024-06-01T09:05:00.000Z',
        })
      )
    );
  }),
  http.post(`${BASE}/chat/conversations`, () => HttpResponse.json(envelope(makeConversationDetail()))),
  http.patch(`${BASE}/chat/conversations/:id/read`, () =>
    HttpResponse.json(envelope({ message: 'Conversation marked as read' }))
  ),
];

// ─── Audit logs ────────────────────────────────────────────────────────────────
export const auditLogHandlers: HttpHandler[] = [
  http.get(`${BASE}/audit-logs`, () =>
    HttpResponse.json(
      listEnvelope([
        makeAuditLog({
          id: 'log-2',
          user: 'Teacher One',
          action: 'CREATE',
          module: 'homework',
          description: 'Created homework assignment',
          timestamp: '2024-06-02T12:00:00.000Z',
          createdAt: '2024-06-02T12:00:00.000Z',
        }),
        makeAuditLog(),
      ])
    )
  ),
  http.get(`${BASE}/audit-logs/:id`, () => HttpResponse.json(envelope(makeAuditLogRaw()))),
  http.get(`${BASE}/audit-logs/export`, () =>
    HttpResponse.text('Timestamp,User,Action,Module,Description', {
      headers: { 'Content-Type': 'text/csv; charset=utf-8' },
    })
  ),
];

// ─── Products ──────────────────────────────────────────────────────────────────
const productsStore = [
  makeProduct({ id: 'prod-1', price: '149.99' }),
  makeProduct({ id: 'prod-2', name: 'Notebook', sku: 'NB-002', price: '45.00' }),
];

export const productHandlers: HttpHandler[] = [
  http.get(`${BASE}/products`, () =>
    HttpResponse.json(listEnvelope(productsStore, productsStore.length))
  ),
  http.get(`${BASE}/products/stats`, () => HttpResponse.json(envelope(makeProductStats()))),
  http.get(`${BASE}/products/:id`, ({ params }) =>
    HttpResponse.json(envelope(productsStore.find((p) => p.id === params.id) ?? makeProduct()))
  ),
  http.post(`${BASE}/products`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const created = makeProduct({ ...body, id: 'prod-new' });
    productsStore.push(created);
    return HttpResponse.json(envelope(created));
  }),
  http.put(`${BASE}/products/:id`, () => HttpResponse.json(envelope(makeProduct({ id: 'prod-1' })))),
  http.delete(`${BASE}/products/:id`, () =>
    HttpResponse.json(envelope({ message: 'Product deleted successfully' }))
  ),
];

// ─── Lectures ──────────────────────────────────────────────────────────────────
const lecturesStore = [makeLecture()];

export const lectureHandlers: HttpHandler[] = [
  http.get(`${BASE}/lectures/live`, () => HttpResponse.json(listEnvelope(lecturesStore))),
  http.get(`${BASE}/lectures/recorded`, () =>
    HttpResponse.json(
      listEnvelope([
        makeLecture({
          id: 'rec-1',
          status: 'published',
          title: 'Recorded: Polynomials',
          attachments: [{ name: 'video.mp4', url: '/uploads/lecture-1.mp4' }],
        }),
      ])
    )
  ),
  http.get(`${BASE}/lectures/:id`, ({ params }) =>
    HttpResponse.json(envelope(lecturesStore.find((l) => l.id === params.id) ?? makeLecture()))
  ),
  http.post(`${BASE}/lectures/live`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const created = makeLecture({ ...body, id: 'lec-new' });
    lecturesStore.push(created);
    return HttpResponse.json(envelope(created));
  }),
  http.post(`${BASE}/lectures/recorded`, () => HttpResponse.json(envelope(makeLecture({ id: 'rec-new' })))),
  http.post(`${BASE}/lectures/:id/join`, ({ params }) =>
    HttpResponse.json(envelope(makeLecture({ id: params.id, joinUrl: 'https://meet.example.com/join' })))
  ),
  http.put(`${BASE}/lectures/:id`, ({ params }) =>
    HttpResponse.json(envelope(makeLecture({ id: params.id, title: 'Updated Title' })))
  ),
  http.delete(`${BASE}/lectures/:id`, () =>
    HttpResponse.json(envelope({ message: 'Lecture deleted successfully' }))
  ),
];

// ─── Classes / lookups ─────────────────────────────────────────────────────────
const classesStore = [makeClass()];

export const classHandlers: HttpHandler[] = [
  http.get(`${BASE}/classes`, () =>
    HttpResponse.json(listEnvelope(classesStore.map((c) => ({ ...c, _count: { students: c.studentCount } }))))
  ),
  http.get(`${BASE}/classes/:id`, ({ params }) =>
    HttpResponse.json(envelope(classesStore.find((c) => c.id === params.id) ?? makeClass()))
  ),
  http.get(`${BASE}/classes/:id/students`, () => HttpResponse.json(listEnvelope([{ id: 'stu-1' }, { id: 'stu-2' }]))),
  http.post(`${BASE}/classes`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const created = makeClass({ ...body, id: 'class-new' });
    classesStore.push(created);
    return HttpResponse.json(envelope(created));
  }),
  http.put(`${BASE}/classes/:id`, ({ params }) =>
    HttpResponse.json(envelope(makeClass({ id: params.id, name: 'Updated Class' })))
  ),
  http.delete(`${BASE}/classes/:id`, () =>
    HttpResponse.json(envelope({ message: 'Class deleted successfully' }))
  ),
  http.post(`${BASE}/classes/promote`, () =>
    HttpResponse.json(
      envelope({
        mode: 'target',
        promotionId: 'promo-1',
        promotedCount: 2,
        retainedCount: 0,
        promotion: { id: 'promo-1', promotedOn: '2024-06-01T00:00:00.000Z' },
      })
    )
  ),
  http.get(`${BASE}/promotions`, () =>
    HttpResponse.json(
      listEnvelope([
        {
          id: 'promo-1',
          fromClassId: 'class-1',
          toClassId: 'class-2',
          promotedCount: 2,
          academicYearId: 'ay-1',
          promotedOn: '2024-06-01T00:00:00.000Z',
        },
      ])
    )
  ),
  http.get(`${BASE}/sections`, () => HttpResponse.json(listEnvelope([]))),
  http.post(`${BASE}/sections`, () =>
    HttpResponse.json(envelope({ id: 'sec-new', name: 'B', classId: 'class-new', roomNo: null }))
  ),
  http.put(`${BASE}/sections/:id`, () =>
    HttpResponse.json(envelope({ id: 'sec-1', name: 'B', classId: 'class-1', roomNo: '102' }))
  ),
  http.delete(`${BASE}/sections/:id`, () =>
    HttpResponse.json(envelope({ message: 'Section deleted successfully' }))
  ),
  http.get(`${BASE}/teachers`, () => HttpResponse.json(listEnvelope([makeTeacher()]))),
  http.get(`${BASE}/academic-years`, () =>
    HttpResponse.json(
      listEnvelope([
        {
          id: 'ay-1',
          name: '2024-25',
          startDate: '2024-04-01T00:00:00.000Z',
          endDate: '2025-03-31T00:00:00.000Z',
          status: 'active',
        },
      ])
    )
  ),
];

export const handlers: HttpHandler[] = [
  ...authHandlers,
  ...chatHandlers,
  ...auditLogHandlers,
  ...productHandlers,
  ...lectureHandlers,
  ...classHandlers,
];
