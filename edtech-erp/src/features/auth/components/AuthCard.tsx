import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <Card className="w-full max-w-md mx-auto p-6 sm:p-7">
      <div className="space-y-1.5 mb-6">
        <h1 className="font-display font-bold text-2xl tracking-tight">{title}</h1>
        {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {children}
    </Card>
  );
}
