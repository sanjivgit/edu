import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary',
        secondary: 'bg-secondary text-secondary-foreground',
        destructive: 'bg-destructive/10 text-destructive',
        outline: 'border border-current',
        success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        ghost: 'bg-muted text-muted-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            variant === 'success' && 'bg-emerald-500',
            variant === 'warning' && 'bg-amber-500',
            variant === 'destructive' && 'bg-destructive',
            variant === 'default' && 'bg-primary',
            variant === 'info' && 'bg-blue-500',
          )}
        />
      )}
      {children}
    </span>
  );
}

// ─── Status Badge (auto color from status string) ───────────────────────────────
const STATUS_MAP: Record<string, VariantProps<typeof badgeVariants>['variant']> = {
  active: 'success',
  present: 'success',
  paid: 'success',
  approved: 'success',
  completed: 'success',
  published: 'success',
  inactive: 'ghost',
  absent: 'destructive',
  overdue: 'destructive',
  rejected: 'destructive',
  failed: 'destructive',
  pending: 'warning',
  late: 'warning',
  partial: 'warning',
  draft: 'ghost',
  info: 'info',
  transferred: 'info',
};

interface StatusBadgeProps {
  status: string;
  className?: string;
  dot?: boolean;
}

export function StatusBadge({ status, className, dot = true }: StatusBadgeProps) {
  const variant = STATUS_MAP[status.toLowerCase()] ?? 'secondary';
  return (
    <Badge variant={variant} dot={dot} className={className}>
      {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
    </Badge>
  );
}
