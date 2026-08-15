import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { useToast } from '@/hooks';
import type { ApiResponse } from '@/types';
import type {
  BillingStats,
  Paged,
  Plan,
  Subscription,
  SubscriptionInvoice,
  SubscriptionPeriod,
  TenantSummary,
} from '../types';

// ─── Helpers ────────────────────────────────────────────────────────────────────

function unwrap<T>(res: { data: ApiResponse<T> }): T {
  return res.data.data;
}

export function formatCurrency(amount: number | null | undefined, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount ?? 0));
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function daysUntil(value: string | Date | null | undefined): number | null {
  if (!value) return null;
  return Math.ceil((new Date(value).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
}

export function formatLimit(value: number | null | undefined): string {
  return value == null ? 'Unlimited' : String(value);
}

// ─── Queries ────────────────────────────────────────────────────────────────────

const Q = {
  stats: ['billing', 'stats'],
  plans: ['billing', 'plans'],
  subscriptions: ['billing', 'subscriptions'],
  tenants: (page: number, search: string) => ['billing', 'tenants', page, search] as const,
  tenant: (id: string) => ['billing', 'tenant', id] as const,
  invoices: (search?: string) => ['billing', 'invoices', search ?? ''] as const,
};

export const useAdminBillingStats = () =>
  useQuery({
    queryKey: Q.stats,
    queryFn: () => apiClient.get<ApiResponse<BillingStats>>('/billing/stats').then(unwrap),
  });

export const useAdminPlans = () =>
  useQuery({
    queryKey: Q.plans,
    queryFn: () =>
      apiClient.get<ApiResponse<Paged<Plan>>>('/billing/plans', { params: { limit: 50 } }).then(unwrap),
  });

export const useAdminSubscriptions = () =>
  useQuery({
    queryKey: Q.subscriptions,
    queryFn: () =>
      apiClient
        .get<ApiResponse<Paged<Subscription>>>('/billing/subscriptions', { params: { limit: 100 } })
        .then(unwrap),
  });

export const useAdminTenants = (page: number, search: string) =>
  useQuery({
    queryKey: Q.tenants(page, search),
    queryFn: () =>
      apiClient
        .get<ApiResponse<Paged<TenantSummary>>>('/tenants', {
          params: { page, limit: 10, search: search || undefined },
        })
        .then(unwrap),
  });

export const useAdminTenant = (id?: string) =>
  useQuery({
    queryKey: Q.tenant(id ?? ''),
    queryFn: () => apiClient.get<ApiResponse<TenantSummary>>(`/tenants/${id}`).then(unwrap),
    enabled: !!id,
  });

export const useAdminInvoices = (search?: string) =>
  useQuery({
    queryKey: Q.invoices(search),
    queryFn: () =>
      apiClient
        .get<ApiResponse<Paged<SubscriptionInvoice>>>('/billing/invoices', {
          params: { limit: 100, search: search || undefined },
        })
        .then(unwrap),
    enabled: search !== undefined,
  });

// ─── Mutation helper ────────────────────────────────────────────────────────────

interface AdminMutationOptions<TVars, TData> {
  mutationFn: (vars: TVars) => Promise<TData>;
  successMsg: string;
  invalidate?: Array<string | readonly unknown[]>;
}

function useAdminMutation<TVars, TData>({ mutationFn, successMsg, invalidate = [] }: AdminMutationOptions<TVars, TData>) {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      success('Success', successMsg);
      invalidate.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: Array.isArray(key) ? [...key] : [key] });
      });
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string | string[] } } };
      const msg = e?.response?.data?.message;
      error('Failed', Array.isArray(msg) ? msg.join(', ') : msg ?? successMsg);
    },
  });
}

// ─── Tenants ────────────────────────────────────────────────────────────────────

export interface CreateTenantInput {
  name: string;
  code: string;
  domain?: string;
  address?: string;
  phone?: string;
  website?: string;
  registrationNo?: string;
  adminEmail?: string;
  adminName?: string;
}

export const useCreateTenant = () =>
  useAdminMutation<CreateTenantInput, TenantSummary>({
    mutationFn: (body) => apiClient.post<ApiResponse<TenantSummary>>('/tenants', body).then(unwrap),
    successMsg: 'School created',
    invalidate: [Q.tenants(1, ''), Q.stats],
  });

// ─── Subscriptions ──────────────────────────────────────────────────────────────

export const useCreateSubscription = () =>
  useAdminMutation<
    { tenantId: string; planId: string; period?: SubscriptionPeriod; status?: string },
    Subscription
  >({
    mutationFn: (body) =>
      apiClient.post<ApiResponse<Subscription>>('/billing/subscriptions', body).then(unwrap),
    successMsg: 'Subscription created',
    invalidate: [Q.subscriptions, Q.stats, Q.tenants(1, '')],
  });

export const useChangePlan = (subscriptionId?: string) =>
  useAdminMutation<{ planId: string; period?: SubscriptionPeriod }, Subscription>({
    mutationFn: (body) =>
      apiClient
        .patch<ApiResponse<Subscription>>(`/billing/subscriptions/${subscriptionId}/plan`, body)
        .then(unwrap),
    successMsg: 'Plan changed',
    invalidate: [Q.subscriptions, Q.stats, Q.tenants(1, '')],
  });

export const useRenewSubscription = (subscriptionId?: string) =>
  useAdminMutation<
    { period?: SubscriptionPeriod; months?: number; notes?: string },
    Subscription
  >({
    mutationFn: (body) =>
      apiClient
        .post<ApiResponse<Subscription>>(`/billing/subscriptions/${subscriptionId}/renew`, body)
        .then(unwrap),
    successMsg: 'Subscription renewed',
    invalidate: [Q.subscriptions, Q.stats, Q.tenants(1, '')],
  });

export const useSubscriptionStatus = (subscriptionId?: string) =>
  useAdminMutation<{ action: 'cancel' | 'suspend' | 'resume' }, Subscription>({
    mutationFn: ({ action }) =>
      apiClient
        .post<ApiResponse<Subscription>>(`/billing/subscriptions/${subscriptionId}/${action}`)
        .then(unwrap),
    successMsg: 'Subscription updated',
    invalidate: [Q.subscriptions, Q.stats, Q.tenants(1, '')],
  });

// ─── Plans ──────────────────────────────────────────────────────────────────────

export interface PlanInput {
  name: string;
  code: string;
  description?: string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  studentLimit: number | null;
  teacherLimit: number | null;
  storageMb: number;
  isDefault: boolean;
  status: Plan['status'];
  sortOrder: number;
}

export const useCreatePlan = () =>
  useAdminMutation<PlanInput, Plan>({
    mutationFn: (body) => apiClient.post<ApiResponse<Plan>>('/billing/plans', body).then(unwrap),
    successMsg: 'Plan created',
    invalidate: [Q.plans, Q.stats],
  });

export const useUpdatePlan = (planId?: string) =>
  useAdminMutation<Partial<PlanInput>, Plan>({
    mutationFn: (body) =>
      apiClient.patch<ApiResponse<Plan>>(`/billing/plans/${planId}`, body).then(unwrap),
    successMsg: 'Plan updated',
    invalidate: [Q.plans, Q.stats],
  });

export const useDeletePlan = (planId?: string) =>
  useAdminMutation<Record<string, never>, { id: string }>({
    mutationFn: () => apiClient.delete<ApiResponse<{ id: string }>>(`/billing/plans/${planId}`).then(unwrap),
    successMsg: 'Plan deleted',
    invalidate: [Q.plans, Q.stats],
  });

// ─── Invoices ───────────────────────────────────────────────────────────────────

export interface InvoiceInput {
  tenantId: string;
  subscriptionId?: string;
  amount: number;
  currency: string;
  period: SubscriptionPeriod;
  periodStart?: string;
  periodEnd?: string;
  notes?: string;
}

export const useIssueInvoice = () =>
  useAdminMutation<InvoiceInput, SubscriptionInvoice>({
    mutationFn: (body) =>
      apiClient.post<ApiResponse<SubscriptionInvoice>>('/billing/invoices', body).then(unwrap),
    successMsg: 'Invoice issued',
    invalidate: [Q.invoices(undefined), Q.stats],
  });

export const useMarkInvoicePaid = (invoiceId?: string) =>
  useAdminMutation<Record<string, never>, SubscriptionInvoice>({
    mutationFn: () =>
      apiClient
        .post<ApiResponse<SubscriptionInvoice>>(`/billing/invoices/${invoiceId}/mark-paid`)
        .then(unwrap),
    successMsg: 'Invoice marked as paid',
    invalidate: [Q.invoices(undefined), Q.stats, Q.subscriptions],
  });

export const useCancelInvoice = (invoiceId?: string) =>
  useAdminMutation<Record<string, never>, SubscriptionInvoice>({
    mutationFn: () =>
      apiClient
        .post<ApiResponse<SubscriptionInvoice>>(`/billing/invoices/${invoiceId}/cancel`)
        .then(unwrap),
    successMsg: 'Invoice cancelled',
    invalidate: [Q.invoices(undefined), Q.stats],
  });
