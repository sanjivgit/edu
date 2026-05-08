import * as React from 'react';
import { cn, initials, avatarColor } from '@/utils';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
}

const sizeMap = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-xl',
};

const statusColors = {
  online: 'bg-emerald-500',
  offline: 'bg-gray-400',
  away: 'bg-amber-500',
  busy: 'bg-red-500',
};

const statusSizes = {
  xs: 'h-1.5 w-1.5 border',
  sm: 'h-2 w-2 border',
  md: 'h-2.5 w-2.5 border-2',
  lg: 'h-3 w-3 border-2',
  xl: 'h-3.5 w-3.5 border-2',
};

export function Avatar({ src, name, size = 'md', className, status }: AvatarProps) {
  const [imgError, setImgError] = React.useState(false);

  return (
    <div className="relative inline-flex flex-shrink-0">
      <div
        className={cn(
          'rounded-full flex items-center justify-center font-display font-semibold select-none overflow-hidden',
          sizeMap[size],
          !src || imgError ? avatarColor(name) : 'bg-muted',
          'text-white',
          className
        )}
      >
        {src && !imgError ? (
          <img
            src={src}
            alt={name}
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <span>{initials(name)}</span>
        )}
      </div>
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-card',
            statusColors[status],
            statusSizes[size]
          )}
        />
      )}
    </div>
  );
}

// ─── Avatar Group ───────────────────────────────────────────────────────────────
interface AvatarGroupProps {
  users: { name: string; src?: string }[];
  max?: number;
  size?: AvatarProps['size'];
}

export function AvatarGroup({ users, max = 4, size = 'sm' }: AvatarGroupProps) {
  const visible = users.slice(0, max);
  const overflow = users.length - max;

  return (
    <div className="flex -space-x-2">
      {visible.map((u, i) => (
        <div key={i} className="ring-2 ring-card rounded-full">
          <Avatar name={u.name} src={u.src} size={size} />
        </div>
      ))}
      {overflow > 0 && (
        <div
          className={cn(
            'rounded-full ring-2 ring-card flex items-center justify-center bg-muted text-muted-foreground font-medium',
            sizeMap[size],
            'text-xs'
          )}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
