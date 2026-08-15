import type { PaginationMeta } from '@/types';

export type SubscriptionStatus = 'trial' | 'active' | 'expired' | 'cancelled' | 'suspended';
export type SubscriptionPeriod = 'monthly' | 'yearly';
export type PlanStatus = 'active' | 'inactive';
export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'overdue' | 'cancelled';

export interface Plan {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  studentLimit: number | null;
  teacherLimit: number | null;
  storageMb: number;
  features: Record<string, boolean>;
  isDefault: boolean;
  status: PlanStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface TenantSummary {
  id: string;
  name: string;
  code: string;
  domain?: string;
  logo?: string;
  address?: string;
  phone?: string;
  website?: string;
  registrationNo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userCount?: number;
  studentCount?: number;
  teacherCount?: number;
  classCount?: number;
  subscription?: Subscription;
}

export interface Subscription {
  id: string;
  tenantId: string;
  planId: string;
  status: SubscriptionStatus;
  period: SubscriptionPeriod;
  pricePerPeriod: number;
  currency: string;
  startsAt: string;
  expiresAt: string;
  trialEndsAt?: string | null;
  autoRenew: boolean;
  cancelledAt?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  tenant?: { id: string; name: string; code: string; isActive?: boolean };
  plan?: Plan;
  invoices?: SubscriptionInvoice[];
}

export interface SubscriptionInvoice {
  id: string;
  invoiceNo: string;
  subscriptionId?: string | null;
  tenantId: string;
  amount: number;
  currency: string;
  period: SubscriptionPeriod;
  periodStart: string;
  periodEnd: string;
  status: InvoiceStatus;
  issuedAt: string;
  paidAt?: string | null;
  notes?: string | null;
  tenant?: { id: string; name: string; code: string };
  subscription?: { id: string; plan?: { id: string; name: string } };
}

export interface BillingStats {
  totalTenants: number;
  activeTenants: number;
  activeSubscriptions: number;
  expiringSoon: number;
  mrr: number;
  revenue: number;
  planBreakdown: { planId: string; name: string; count: number }[];
}

export interface Paged<T> {
  items: T[];
  meta: PaginationMeta;
}
