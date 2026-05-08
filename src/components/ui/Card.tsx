import * as React from 'react';
import { cn } from '@/lib/utils';

// ─── Base Card ──────────────────────────────────────────────────────────────────
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated' | 'ghost';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const cardVariants: Record<string, string> = {
  default: 'bg-card text-card-foreground shadow-card border border-border',
  bordered: 'bg-card text-card-foreground border-2 border-border',
  elevated: 'bg-card text-card-foreground shadow-elevated border border-border/50',
  ghost: 'bg-transparent text-card-foreground',
};

const paddingVariants: Record<string, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-xl', cardVariants[variant], paddingVariants[padding], className)}
      {...props}
    >
      {children}
    </div>
  )
);
Card.displayName = 'Card';

// ─── Card Header ────────────────────────────────────────────────────────────────
export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

// ─── Card Title ─────────────────────────────────────────────────────────────────
export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('font-display text-base font-semibold leading-tight tracking-tight', className)}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

// ─── Card Description ───────────────────────────────────────────────────────────
export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
));
CardDescription.displayName = 'CardDescription';

// ─── Card Content ───────────────────────────────────────────────────────────────
export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('mt-4', className)} {...props} />
));
CardContent.displayName = 'CardContent';

// ─── Card Footer ────────────────────────────────────────────────────────────────
export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-4 mt-4 border-t border-border', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

// ─── Stat Card ──────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  iconBg?: string;
  prefix?: string;
  suffix?: string;
  className?: string;
  isLoading?: boolean;
}

export function StatCard({
  label,
  value,
  change,
  changeType = 'neutral',
  icon,
  iconBg = 'bg-primary/10 text-primary',
  prefix,
  suffix,
  className,
  isLoading = false,
}: StatCardProps) {
  if (isLoading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <div className="skeleton h-4 w-24 rounded" />
            <div className="skeleton h-8 w-32 rounded" />
            <div className="skeleton h-3 w-20 rounded" />
          </div>
          <div className="skeleton h-11 w-11 rounded-xl" />
        </div>
      </Card>
    );
  }

  const changeColors: Record<string, string> = {
    positive: 'text-emerald-600 dark:text-emerald-400',
    negative: 'text-red-600 dark:text-red-400',
    neutral: 'text-muted-foreground',
  };

  return (
    <Card className={cn('hover:shadow-soft transition-shadow duration-200', className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 flex-1 min-w-0">
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          <p className="text-2xl font-display font-bold tracking-tight truncate">
            {prefix}{value}{suffix}
          </p>
          {change !== undefined && (
            <p className={cn('text-xs font-medium flex items-center gap-1', changeColors[changeType])}>
              {changeType === 'positive' ? '↑' : changeType === 'negative' ? '↓' : '→'}
              {Math.abs(change)}% vs last month
            </p>
          )}
        </div>
        <div className={cn('h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0', iconBg)}>
          {icon}
        </div>
      </div>
    </Card>
  );
}
